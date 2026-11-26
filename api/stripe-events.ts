// Vercel serverless function — Stripe webhook that sends owner notification
// emails when a checkout.session.completed event fires.
//
// Co-exists with the Deno/Supabase webhook at supabase/functions/stripe-webhook.
// Gated by env EMAIL_VIA_VERCEL=1 so we can switch back to Supabase once Lovable
// credits are restored.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { Resend } from "resend";
import { renderOwnerPurchaseEmail } from "./_lib/ownerPurchaseEmail.js";
import { parseOwnerEmails, recipientsFor, isSevilla, SENDER } from "./_lib/recipients.js";

export const config = { api: { bodyParser: false } };

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Idempotency: in-memory dedup across warm invocations. Stripe retries with the
// same event.id; on cold start the set is empty, which is fine — Stripe's own
// retries happen over minutes, our instance stays warm long enough for a few
// retries in a row. We also return 200 for duplicates so Stripe stops retrying.
const seenEventIds = new Set<string>();
const SEEN_LIMIT = 2000;
function markSeen(id: string) {
  seenEventIds.add(id);
  if (seenEventIds.size > SEEN_LIMIT) {
    const first = seenEventIds.values().next().value;
    if (first) seenEventIds.delete(first);
  }
}

export function pickLineItems(
  lineItems: Stripe.LineItem[] | undefined,
): Array<{ name: string; quantity: number; amountCents: number; material?: string | null }> {
  if (!lineItems) return [];
  return lineItems.map((li) => {
    const product = typeof li.price?.product === "object" && li.price?.product !== null && !(li.price.product as Stripe.DeletedProduct).deleted
      ? (li.price.product as Stripe.Product)
      : null;
    const material = product?.metadata?.material ?? null;
    return {
      name: li.description ?? product?.name ?? "Pieza",
      quantity: li.quantity ?? 1,
      amountCents: li.amount_total ?? 0,
      material,
    };
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  if (process.env.EMAIL_VIA_VERCEL !== "1") {
    // Kill switch: ack quickly so Stripe doesn't retry, but do nothing.
    res.status(200).json({ received: true, skipped: "EMAIL_VIA_VERCEL_disabled" });
    return;
  }

  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET_VERCEL;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!sig || typeof sig !== "string" || !secret || !stripeKey || !resendKey) {
    res.status(400).send("Missing signature or configuration");
    return;
  }

  const stripe = new Stripe(stripeKey);
  const raw = await readRawBody(req);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret);
  } catch (err: any) {
    console.error("[stripe-events] Signature verification failed:", err?.message ?? err);
    res.status(400).send(`Signature error: ${err?.message ?? "invalid"}`);
    return;
  }

  // Idempotency
  if (seenEventIds.has(event.id)) {
    console.log(`[stripe-events] duplicate event ${event.id} — skipping`);
    res.status(200).json({ received: true, duplicate: true });
    return;
  }
  markSeen(event.id);

  if (event.type !== "checkout.session.completed") {
    res.status(200).json({ received: true, ignored: event.type });
    return;
  }

  try {
    const sessionShallow = event.data.object as Stripe.Checkout.Session;
    const full = await stripe.checkout.sessions.retrieve(sessionShallow.id, {
      expand: ["line_items", "line_items.data.price.product", "payment_intent"],
    });

    const metadata = (full.metadata ?? {}) as Record<string, string>;
    const sourcePath = metadata.source_path ?? null;
    const pageLanguage = metadata.page_language ?? null;

    const ownerEmails = parseOwnerEmails(process.env.OWNER_EMAILS);
    const danielEmail = (process.env.DANIEL_EMAIL ?? "").trim() || null;
    const to = recipientsFor({
      ownerEmails,
      danielEmail,
      sevilla: isSevilla({ source_path: sourcePath, page_language: pageLanguage, pickup_location: metadata.pickup_location }),
    });

    if (to.length === 0) {
      console.warn("[stripe-events] No owner recipients configured — nothing sent");
      res.status(200).json({ received: true, warning: "no_recipients" });
      return;
    }

    const lineItems = pickLineItems(full.line_items?.data);
    const paymentIntent = typeof full.payment_intent === "object" && full.payment_intent !== null ? full.payment_intent : null;
    const paymentUrl = paymentIntent?.id ? `https://dashboard.stripe.com/payments/${paymentIntent.id}` : `https://dashboard.stripe.com/payments/${full.id}`;

    const shippingDetails = full.collected_information?.shipping_details ?? (full as any).shipping_details ?? null;

    const fulfillment = metadata.fulfillment === "pickup" || metadata.fulfillment === "shipping"
      ? metadata.fulfillment
      : (shippingDetails ? "shipping" : "pickup");

    const filePaths = metadata.file_paths ? metadata.file_paths.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const fileNames = metadata.file_names ? metadata.file_names.split(",").map((s) => s.trim()).filter(Boolean) : filePaths.map((p) => p.split("/").pop() ?? p);

    const shippingAddress = shippingDetails?.address ?? null;
    const shippingName = shippingDetails?.name ?? null;
    const addressWithName = shippingAddress ? { ...shippingAddress, name: shippingName } : null;

    const { subject, html } = renderOwnerPurchaseEmail({
      sessionId: full.id,
      orderId: metadata.order_id ?? null,
      orderNumber: metadata.order_number ?? null,
      customerName: full.customer_details?.name ?? shippingName ?? null,
      customerEmail: full.customer_details?.email ?? full.customer_email ?? null,
      customerPhone: full.customer_details?.phone ?? null,
      fulfillment,
      shippingAddress: addressWithName,
      shippingCity: (shippingAddress as any)?.city ?? null,
      shippingCountry: (shippingAddress as any)?.country ?? null,
      deliverySpeed: metadata.urgency ?? metadata.delivery_speed ?? null,
      materials: metadata.materials ?? null,
      totalPaidCents: full.amount_total ?? 0,
      shippingCents: full.shipping_cost?.amount_total ?? null,
      currency: full.currency ?? "eur",
      lineItems,
      filePaths,
      fileNames,
      adminUrl: `https://www.dimension3dprints.com/admin${metadata.order_id ? `?order=${encodeURIComponent(metadata.order_id)}` : ""}`,
      paymentUrl,
      sourcePath,
      pageLanguage,
      metadata,
    });

    const resend = new Resend(resendKey);
    const sendResult = await resend.emails.send({ from: SENDER, to, subject, html });
    if ((sendResult as any)?.error) {
      console.error("[stripe-events] Resend send error:", (sendResult as any).error);
      // Return 200 anyway — Stripe retries would just re-send the same email
      res.status(200).json({ received: true, email: "failed", id: null });
      return;
    }
    const emailId = (sendResult as any)?.data?.id ?? null;
    console.log(`[stripe-events] Owner email sent (${emailId}) to`, to.join(","));
    res.status(200).json({ received: true, email: "sent", id: emailId, recipients: to });
  } catch (err: any) {
    console.error("[stripe-events] Unexpected error:", err?.message ?? err, err?.stack);
    // Return 200 so Stripe stops retrying (mail might already have been sent).
    res.status(200).json({ received: true, error: err?.message ?? "unknown" });
  }
}
