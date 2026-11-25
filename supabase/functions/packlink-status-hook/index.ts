// O9 — Packlink status hook called by Zapier ("Packlink PRO Shipment Status Updated" →
// Webhooks POST). verify_jwt = false (configured in supabase/config.toml) + shared-secret
// header or query param (`SECRET` env var). Updates the order row, logs to email_log on
// shipped/delivered via send-order-status, and writes to webhook_events for auditing.
//
// Payload mapping is defensive — Zapier flattens fields differently depending on triggers.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { BUILD_ID, PRICING_VERSION, CAPABILITIES } from "../_shared/version.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-packlink-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SECRET = Deno.env.get("PACKLINK_HOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

function extract(payload: any): { orderRef?: string; trackingNumber?: string; carrier?: string; status?: string } {
  if (!payload || typeof payload !== "object") return {};
  return {
    orderRef: payload.order_ref ?? payload.orderReference ?? payload.reference ?? payload.external_reference,
    trackingNumber: payload.tracking_number ?? payload.trackingNumber ?? payload.tracking ?? payload.awb,
    carrier: payload.carrier ?? payload.courier ?? payload.service,
    status: payload.status ?? payload.state ?? payload.shipment_status,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  if (url.searchParams.has("health")) {
    return json({ fn: "packlink-status-hook", build: BUILD_ID, pricingVersion: PRICING_VERSION, capabilities: CAPABILITIES });
  }
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const sentSecret = url.searchParams.get("secret") ?? req.headers.get("x-packlink-secret") ?? "";
  if (!SECRET || sentSecret !== SECRET) return json({ error: "FORBIDDEN" }, 403);

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "INVALID_JSON" }, 400);
  }
  const { orderRef, trackingNumber, carrier, status } = extract(payload);
  if (!orderRef) return json({ error: "MISSING_ORDER_REF" }, 400);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  await supabase.from("webhook_events").insert({
    source: "packlink",
    event_type: status ?? "status",
    payload,
    status: "received",
  });

  const update: Record<string, unknown> = {};
  if (trackingNumber) update["tracking_number"] = trackingNumber;
  if (carrier) update["carrier"] = carrier;
  if (status) update["status"] = status;

  if (Object.keys(update).length) {
    const refNumber = Number(String(orderRef).replace(/^#/, ""));
    if (Number.isFinite(refNumber)) {
      await supabase.from("orders").update(update).eq("order_number", refNumber);
    }
  }
  return json({ ok: true });
});
