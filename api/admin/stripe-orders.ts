// Vercel serverless function — admin view of paid Stripe checkout sessions.
// Called from the admin UI. Requires an authenticated Supabase JWT whose email
// is in ADMIN_EMAILS.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const PAGE_SIZE_DEFAULT = 50;
const WINDOW_DAYS_DEFAULT = 180;

export function parseAdminEmails(env: string | undefined): string[] {
  if (!env) return [];
  return env.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s.length > 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const auth = req.headers["authorization"];
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "MISSING_BEARER" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[stripe-orders] Supabase env not configured");
    res.status(500).json({ error: "SERVER_MISCONFIGURED" });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user?.email) {
    res.status(401).json({ error: "INVALID_SESSION" });
    return;
  }

  const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS);
  const email = userData.user.email.toLowerCase();
  if (!adminEmails.includes(email)) {
    res.status(403).json({ error: "FORBIDDEN", email });
    return;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "STRIPE_KEY_MISSING" });
    return;
  }

  const stripe = new Stripe(stripeKey);

  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? ""), 10) || PAGE_SIZE_DEFAULT, 1), 100);
  const starting_after = typeof req.query.starting_after === "string" ? req.query.starting_after : undefined;
  const windowDays = Math.min(Math.max(parseInt(String(req.query.days ?? ""), 10) || WINDOW_DAYS_DEFAULT, 1), 365);
  const createdGte = Math.floor(Date.now() / 1000) - windowDays * 86400;

  try {
    const list = await stripe.checkout.sessions.list({
      limit,
      starting_after,
      created: { gte: createdGte },
    });

    const paid = list.data
      .filter((s) => s.payment_status === "paid" || s.payment_status === "no_payment_required")
      .map((s) => {
        const metadata = (s.metadata ?? {}) as Record<string, string>;
        const shippingDetails = s.collected_information?.shipping_details ?? (s as any).shipping_details ?? null;
        const address = shippingDetails?.address ?? null;
        const shippingName = shippingDetails?.name ?? null;
        return {
          id: s.id,
          created: s.created,
          amount_total: s.amount_total,
          currency: s.currency,
          customer_name: s.customer_details?.name ?? shippingName ?? null,
          customer_email: s.customer_details?.email ?? s.customer_email ?? null,
          customer_phone: s.customer_details?.phone ?? null,
          shipping_address: address,
          shipping_name: shippingName,
          order_id: metadata.order_id ?? null,
          order_number: metadata.order_number ?? null,
          quote_id: metadata.quote_id ?? null,
          source_path: metadata.source_path ?? null,
          page_language: metadata.page_language ?? null,
          fulfillment: metadata.fulfillment ?? (shippingDetails ? "shipping" : "pickup"),
          payment_link: `https://dashboard.stripe.com/${s.livemode ? "" : "test/"}payments/${s.payment_intent ?? s.id}`,
          session_link: `https://dashboard.stripe.com/${s.livemode ? "" : "test/"}checkout/sessions/${s.id}`,
          livemode: s.livemode,
          metadata,
        };
      });

    res.status(200).json({
      sessions: paid,
      has_more: list.has_more,
      next_cursor: list.has_more ? list.data[list.data.length - 1]?.id ?? null : null,
      window_days: windowDays,
    });
  } catch (err: any) {
    console.error("[stripe-orders] Stripe list failed:", err?.message ?? err);
    res.status(502).json({ error: "STRIPE_LIST_FAILED", message: err?.message ?? "unknown" });
  }
}
