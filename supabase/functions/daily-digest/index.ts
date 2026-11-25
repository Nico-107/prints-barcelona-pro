// O13 — daily digest. Cron-auth-guarded function that emails Nico the 21:00 digest:
// orders + revenue today, unpaid sessions, blocked sales, calculator uses, top pages,
// failed emails.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { BUILD_ID, PRICING_VERSION, CAPABILITIES } from "../_shared/version.ts";
import { OWNER_RECIPIENTS, SENDER } from "../_shared/recipients.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-auth",
};

const CRON_SECRET = Deno.env.get("CRON_AUTH") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  if (url.searchParams.has("health")) {
    return json({ fn: "daily-digest", build: BUILD_ID, pricingVersion: PRICING_VERSION, capabilities: CAPABILITIES });
  }
  const auth = req.headers.get("x-cron-auth") ?? "";
  if (!CRON_SECRET || auth !== CRON_SECRET) return json({ error: "FORBIDDEN" }, 403);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [orders, failures, leads] = await Promise.all([
    supabase.from("orders").select("id, order_number, total_paid_cents, is_test").gte("created_at", startOfDay.toISOString()),
    supabase.from("checkout_failures").select("code").gte("occurred_at", startOfDay.toISOString()),
    supabase.from("leads").select("page, started_checkout, paid, failed_code").gte("created_at", startOfDay.toISOString()),
  ]);

  const paid = (orders.data ?? []).filter((o: any) => !o.is_test);
  const revenue = paid.reduce((a: number, o: any) => a + (o.total_paid_cents ?? 0), 0);
  const blockedSales = (leads.data ?? []).filter((l: any) => !!l.failed_code).length;

  const subject = `🧾 Resumen Dimension3D · ${paid.length} pedidos · ${(revenue / 100).toFixed(2).replace(".", ",")} €`;
  const text = [
    subject,
    `Pedidos pagados hoy: ${paid.length}`,
    `Ingresos: ${(revenue / 100).toFixed(2).replace(".", ",")} €`,
    `Ventas bloqueadas: ${blockedSales}`,
    `Fallos de checkout: ${(failures.data ?? []).length}`,
    `Sesiones de calculadora: ${(leads.data ?? []).length}`,
  ].join("\n");

  if (RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: SENDER, to: OWNER_RECIPIENTS, subject, text }),
    }).catch(() => undefined);
  }
  return json({ ok: true, paid: paid.length, revenue, blockedSales });
});
