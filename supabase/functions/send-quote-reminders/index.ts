// Phase 3 item 3.5: one reminder email if a sent quote is neither paid nor
// answered after 3 days. One only — guarded by quote_reminder_sent_at.
//
// Intended to be invoked on a schedule (e.g. daily cron) via Supabase's
// scheduled functions. Admin or service-role only.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { renderCustomerQuoteEmail } from "../_shared/customerQuoteTemplate.ts";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_ORIGIN = "https://www.dimension3dprints.com";
const REPLY_TO = "dimension3dprintsbcn@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const cronAuthFailure = authenticateCronRequest(req);
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const isServiceJwt = (() => {
      try {
        const part = bearer.split(".")[1];
        if (!part) return false;
        const claims = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
        return claims?.role === "service_role";
      } catch { return false; }
    })();
    if (!(bearer === serviceRoleKey || isServiceJwt) && cronAuthFailure !== null) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600_000).toISOString();

    const { data: rows, error } = await admin
      .from("quote_requests")
      .select("id, quote_token, contact_email, page_language, quote_price_cents, quote_shipping_cents, quote_production_days, quote_message, quote_fulfillment, quote_expires_at, material, color, pieces")
      .not("quote_sent_at", "is", null)
      .lte("quote_sent_at", threeDaysAgo)
      .is("quote_paid_at", null)
      .is("quote_reminder_sent_at", null)
      .neq("status", "accepted")
      .neq("status", "rejected")
      .limit(50);
    if (error) {
      return new Response(JSON.stringify({ error: "DB_SELECT_FAILED", details: error.message }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const results: Array<{ id: string; sent: boolean; reason?: string }> = [];
    for (const q of rows ?? []) {
      const email = (q.contact_email as string | null)?.trim();
      if (!email) {
        await admin.from("quote_requests").update({ quote_reminder_sent_at: new Date().toISOString() }).eq("id", q.id);
        results.push({ id: q.id as string, sent: false, reason: "no_email" });
        continue;
      }
      const piecesArr = Array.isArray(q.pieces) ? (q.pieces as unknown as Array<{ name: string; quantity: number; material: string; color?: string | null }>) : [];
      const { subject, html } = renderCustomerQuoteEmail({
        firstName: email.split("@")[0] ?? null,
        language: (q.page_language as string | null) ?? "es",
        quoteUrl: `${SITE_ORIGIN}/presupuesto/${encodeURIComponent(String(q.quote_token))}`,
        priceCents: q.quote_price_cents ?? 0,
        shippingCents: q.quote_shipping_cents ?? 0,
        productionDays: q.quote_production_days ?? 7,
        message: q.quote_message ?? null,
        expiresAtIso: (q.quote_expires_at as string | null) ?? new Date(Date.now() + 11 * 24 * 3600_000).toISOString(),
        fulfillment: (q.quote_fulfillment === "pickup" ? "pickup" : "shipping"),
        pieces: piecesArr.length ? piecesArr : [{ name: "Presupuesto", quantity: 1, material: String(q.material ?? ""), color: q.color }],
      });

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Dimension3D <noreply@dimension3dprints.com>",
          to: [email],
          subject: `Recordatorio · ${subject}`,
          html,
          reply_to: REPLY_TO,
        }),
      });
      if (res.ok) {
        await admin.from("quote_requests").update({ quote_reminder_sent_at: new Date().toISOString() }).eq("id", q.id);
        results.push({ id: q.id as string, sent: true });
      } else {
        const t = await res.text();
        console.warn(`Reminder send failed for ${q.id}:`, t);
        results.push({ id: q.id as string, sent: false, reason: "email_send_failed" });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("send-quote-reminders error:", err);
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
