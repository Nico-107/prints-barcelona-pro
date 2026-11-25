// O7 — admin-stripe-sync. Admin-JWT function: for one order or every order missing
// customer data, fetch the Stripe checkout session (+ payment intent) and fill in
// customer_name/email/phone, shipping_address and total_paid_cents. Idempotent.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { BUILD_ID, PRICING_VERSION, CAPABILITIES } from "../_shared/version.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

async function fetchSession(sessionId: string): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=customer_details&expand[]=payment_intent`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) throw new Error(`Stripe ${res.status}`);
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  if (url.searchParams.has("health")) {
    return json({ fn: "admin-stripe-sync", build: BUILD_ID, pricingVersion: PRICING_VERSION, capabilities: CAPABILITIES });
  }
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const body = await req.json().catch(() => ({}));
  const sessionId: string | undefined = body?.session_id;

  if (sessionId) {
    const sess = await fetchSession(sessionId);
    const sd = sess.shipping_details ?? sess.collected_information?.shipping_details;
    const update: Record<string, unknown> = {};
    if (sess.customer_details?.name) update.customer_name = sess.customer_details.name;
    if (sess.customer_details?.email) update.customer_email = sess.customer_details.email;
    if (sess.customer_details?.phone) update.customer_phone = sess.customer_details.phone;
    if (sd?.address) update.shipping_address = sd.address;
    if (sess.amount_total) update.total_paid_cents = sess.amount_total;
    await supabase.from("orders").update(update).eq("stripe_session_id", sessionId);
    return json({ ok: true, updated: Object.keys(update) });
  }

  // Batch mode: fetch recent orders missing customer data.
  const { data: rows } = await supabase
    .from("orders")
    .select("id, stripe_session_id, customer_name, customer_email, total_paid_cents")
    .is("customer_name", null)
    .limit(100);
  if (!rows?.length) return json({ ok: true, updated: 0 });
  let n = 0;
  for (const row of rows) {
    if (!row.stripe_session_id) continue;
    try {
      const sess = await fetchSession(row.stripe_session_id);
      const sd = sess.shipping_details ?? sess.collected_information?.shipping_details;
      const update: Record<string, unknown> = {};
      if (sess.customer_details?.name) update.customer_name = sess.customer_details.name;
      if (sess.customer_details?.email) update.customer_email = sess.customer_details.email;
      if (sess.customer_details?.phone) update.customer_phone = sess.customer_details.phone;
      if (sd?.address) update.shipping_address = sd.address;
      if (sess.amount_total) update.total_paid_cents = sess.amount_total;
      if (Object.keys(update).length) {
        await supabase.from("orders").update(update).eq("id", row.id);
        n++;
      }
    } catch {
      // next order
    }
  }
  return json({ ok: true, updated: n });
});
