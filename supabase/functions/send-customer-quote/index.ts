// Phase 3 item 3.1 + 3.2: owner-triggered. Takes a quote_request id plus the
// quote settings and:
//   1. Creates a Stripe payment link for the total.
//   2. Writes quote_* columns on the row (sent_at, price_cents, shipping,
//      production_days, message, stripe_link, expires_at = +14 days).
//   3. Sends the customer the renderCustomerQuoteEmail in their language.
//
// Admin-only. The customer then opens /presupuesto/<token> which reads the
// row via get_quote_by_token.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { renderCustomerQuoteEmail } from "../_shared/customerQuoteTemplate.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_ORIGIN = "https://www.dimension3dprints.com";
const REPLY_TO = "dimension3dprintsbcn@gmail.com";
const FREE_SHIPPING_FROM_CENTS = 10000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  quote_id: string;
  price_cents: number;              // pieces subtotal in cents
  shipping_cents?: number;          // owner override; if omitted we compute
  production_days: number;
  message?: string | null;
  fulfillment?: "pickup" | "shipping";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    const isServiceJwt = (() => {
      try {
        const part = bearer.split(".")[1];
        if (!part) return false;
        const claims = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
        return claims?.role === "service_role";
      } catch { return false; }
    })();
    const isInternal = bearer === serviceRoleKey || isServiceJwt;
    if (!isInternal) {
      const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      const { data: role } = await userClient
        .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!role) return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const body = await req.json() as Body;
    if (!body.quote_id || !Number.isFinite(body.price_cents) || !Number.isFinite(body.production_days)) {
      return new Response(JSON.stringify({ error: "INVALID_BODY" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: quote, error: qErr } = await admin
      .from("quote_requests")
      .select("id, quote_token, contact_email, contact_phone, material, color, infill, wall_loops, pieces, page_language, fulfillment")
      .eq("id", body.quote_id)
      .maybeSingle();
    if (qErr || !quote) {
      return new Response(JSON.stringify({ error: "QUOTE_NOT_FOUND" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const fulfillment = (body.fulfillment ?? (quote.fulfillment === "pickup" ? "pickup" : "shipping")) as "pickup" | "shipping";
    // Free-shipping threshold (single source of truth lives client-side too;
    // kept duplicated here because edge functions can't import src/).
    const shipping = (() => {
      if (fulfillment === "pickup") return 0;
      if (typeof body.shipping_cents === "number") return Math.max(0, Math.round(body.shipping_cents));
      return body.price_cents >= FREE_SHIPPING_FROM_CENTS ? 0 : 1500; // 15 € default when not free
    })();
    const totalCents = body.price_cents + shipping;

    // ── Stripe payment link ─────────────────────────────────────────────────
    const priceRes = await fetch("https://api.stripe.com/v1/prices", {
      method: "POST",
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        unit_amount: String(totalCents),
        currency: "eur",
        "product_data[name]": `Presupuesto Dimension3D (${(quote.id as string).slice(0, 8)})`,
      }),
    });
    if (!priceRes.ok) {
      const t = await priceRes.text();
      console.error("Stripe price failed:", t);
      return new Response(JSON.stringify({ error: "STRIPE_PRICE_FAILED", details: t }), {
        status: 502, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const price = await priceRes.json();

    const successUrl = `${SITE_ORIGIN}/presupuesto/${encodeURIComponent(String(quote.quote_token))}?paid=1`;
    const linkRes = await fetch("https://api.stripe.com/v1/payment_links", {
      method: "POST",
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "line_items[0][price]": price.id,
        "line_items[0][quantity]": "1",
        "metadata[quote_id]": String(quote.id),
        "metadata[quote_token]": String(quote.quote_token),
        "after_completion[type]": "redirect",
        "after_completion[redirect][url]": successUrl,
      }),
    });
    if (!linkRes.ok) {
      const t = await linkRes.text();
      console.error("Stripe payment_link failed:", t);
      return new Response(JSON.stringify({ error: "STRIPE_LINK_FAILED", details: t }), {
        status: 502, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const link = await linkRes.json();

    // ── Persist quote settings ──────────────────────────────────────────────
    const sentAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 14 * 24 * 3600_000).toISOString();
    const { error: updErr } = await admin.from("quote_requests").update({
      quote_price_cents: body.price_cents,
      quote_shipping_cents: shipping,
      quote_production_days: body.production_days,
      quote_message: body.message ?? null,
      quote_fulfillment: fulfillment,
      quote_stripe_link: link.url,
      quote_sent_at: sentAt,
      quote_expires_at: expiresAt,
      status: "quote_sent",
    }).eq("id", body.quote_id);
    if (updErr) {
      console.error("Quote row update failed:", updErr);
      return new Response(JSON.stringify({ error: "UPDATE_FAILED", details: updErr.message }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ── Customer email ──────────────────────────────────────────────────────
    const email = (quote.contact_email as string | null)?.trim() || null;
    let customerEmailId: string | null = null;
    if (email) {
      const firstName = email.split("@")[0] ?? null;
      const piecesList = Array.isArray(quote.pieces) ? (quote.pieces as unknown as Array<{ name: string; quantity: number; material: string; color?: string | null }>) : [];
      const { subject, html } = renderCustomerQuoteEmail({
        firstName,
        language: (quote.page_language as string | null) ?? "es",
        quoteUrl: `${SITE_ORIGIN}/presupuesto/${encodeURIComponent(String(quote.quote_token))}`,
        priceCents: body.price_cents,
        shippingCents: shipping,
        productionDays: body.production_days,
        message: body.message ?? null,
        expiresAtIso: expiresAt,
        fulfillment,
        pieces: piecesList.length
          ? piecesList.map((p) => ({ name: p.name, quantity: p.quantity, material: p.material, color: p.color ?? null }))
          : [{ name: "Presupuesto", quantity: 1, material: String(quote.material ?? ""), color: quote.color }],
      });
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Dimension3D <noreply@dimension3dprints.com>",
          to: [email],
          subject,
          html,
          reply_to: REPLY_TO,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        console.warn("Customer quote email failed:", t);
      } else {
        const data = await res.json();
        customerEmailId = data?.id ?? null;
      }
    }

    return new Response(JSON.stringify({ success: true, link: link.url, customerEmailId, expiresAt }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("send-customer-quote error:", err);
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
