// send-order-status (item 1.4): one function, four customer emails.
//
// POST {order_id: uuid, kind: "in_production" | "shipped" | "ready_pickup" | "delivered" | "review"}
//
// Reads the order from the database (so tracking_token, carrier, language etc.
// are always correct), picks the right template, sends to the customer in
// their language, and writes an order_events row. If the customer has no
// email the send is skipped and a `email_skipped` event is logged.
//
// Called by the admin panel (Phase 2) and by the Packlink webhook (Phase 4).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  renderInProduction,
  renderShipped,
  renderReadyForPickup,
  renderDelivered,
  renderReviewRequest,
  toLangKey,
  type CustomerLang,
  type CustomerOrderContext,
} from "../_shared/customerEmailTemplates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_ORIGIN = "https://www.dimension3dprints.com";
const REPLY_TO = "dimension3dprintsbcn@gmail.com";
const WHATSAPP_NUMBER = "+34672051147";
const PICKUP_ADDRESS_ES = "Carrer d'Entença 95, 08015 Barcelona";
const REVIEW_URL = `${SITE_ORIGIN}/reviews/new`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  order_id?: string;
  order_number?: number;
  kind: "in_production" | "shipped" | "ready_pickup" | "delivered" | "review";
  eta?: string | null;
  eta_window?: string | null;
  review_url?: string | null;
}

async function sendEmail(to: string[], subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Dimension3D <noreply@dimension3dprints.com>",
      to,
      subject,
      html,
      reply_to: REPLY_TO,
    }),
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Resend ${res.status}: ${details}`);
  }
  return await res.json();
}

async function recordEvent(admin: ReturnType<typeof createClient>, orderId: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await admin.from("order_events").insert({
      order_id: orderId,
      ...payload,
    });
  } catch (err) {
    console.warn("order_events insert failed (table may be missing):", (err as Error)?.message);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

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
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const body = await req.json() as RequestBody;
    if (!body.kind) {
      return new Response(JSON.stringify({ error: "MISSING_KIND" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    let query = admin.from("orders").select(
      "id, order_number, customer_email, customer_name, language, tracking_token, carrier, tracking_number, tracking_url, fulfillment"
    );
    query = body.order_id
      ? query.eq("id", body.order_id)
      : query.eq("order_number", Number(body.order_number ?? 0));
    const { data: order, error: orderErr } = await query.maybeSingle();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "ORDER_NOT_FOUND" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const customerEmail = (order.customer_email as string | null | undefined)?.trim() || null;
    if (!customerEmail) {
      await recordEvent(admin, order.id as string, {
        kind: "email_skipped",
        message: `No email for ${body.kind}`,
        visible_to_customer: false,
        actor: "system",
      });
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const language: CustomerLang = toLangKey(order.language as string | null | undefined);
    const firstName = ((order.customer_name as string | null)?.trim()?.split(" ")[0]) ?? customerEmail.split("@")[0] ?? null;
    const ctx: CustomerOrderContext = {
      orderNumber: Number(order.order_number),
      trackingToken: String(order.tracking_token ?? ""),
      firstName,
      customerLanguage: language,
      siteOrigin: SITE_ORIGIN,
      whatsappNumber: WHATSAPP_NUMBER,
    };

    let subject = "";
    let html = "";
    switch (body.kind) {
      case "in_production":
        ({ subject, html } = renderInProduction({ ctx, etaIso: body.eta ?? "próximos días" }));
        break;
      case "shipped":
        ({ subject, html } = renderShipped({
          ctx,
          carrier: String(order.carrier ?? "Carrier"),
          trackingNumber: String(order.tracking_number ?? ""),
          trackingUrl: String(order.tracking_url ?? SITE_ORIGIN),
          etaWindow: body.eta_window ?? "2–4 días",
        }));
        break;
      case "ready_pickup":
        ({ subject, html } = renderReadyForPickup({ ctx, pickupAddress: PICKUP_ADDRESS_ES }));
        break;
      case "delivered":
        ({ subject, html } = renderDelivered({ ctx }));
        break;
      case "review":
        ({ subject, html } = renderReviewRequest({ ctx, reviewUrl: body.review_url ?? REVIEW_URL }));
        break;
    }

    const emailResult = await sendEmail([customerEmail], subject, html);

    await recordEvent(admin, order.id as string, {
      kind: "email_sent",
      status: body.kind,
      message: subject,
      visible_to_customer: true,
      email_id: emailResult.id ?? null,
      actor: isInternal ? "system" : "owner",
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResult.id ?? null }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("send-order-status error:", err);
    const message = err instanceof Error ? err.message : "unknown";
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR", message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
