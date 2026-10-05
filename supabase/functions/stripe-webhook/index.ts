import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const POSTHOG_KEY = Deno.env.get("POSTHOG_KEY");
const POSTHOG_HOST = Deno.env.get("POSTHOG_HOST");

// B2: server-side order_paid — idempotent via Stripe session.id as PostHog uuid, 3s timeout
async function captureOrderPaid(
  distinctId: string,
  properties: Record<string, unknown>,
  idempotencyKey: string,
  processPersonProfile: boolean,
): Promise<void> {
  if (!POSTHOG_KEY || !POSTHOG_HOST) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event: "order_paid",
        distinct_id: distinctId,
        uuid: idempotencyKey,
        properties: {
          ...properties,
          ...(processPersonProfile ? {} : { $process_person_profile: false }),
        },
      }),
      signal: controller.signal,
    });
  } catch {
    // timeout or network error — never blocks order processing
  } finally {
    clearTimeout(timer);
  }
}

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(",");
  const tPart = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1Part = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!tPart || !v1Part) return false;

  // Reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(tPart)) > 300) return false;

  const signedPayload = `${tPart}.${body}`;
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(signedPayload));
  const computed = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === v1Part;
}

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const signature = req.headers.get("stripe-signature");
  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing signature or secret", { status: 400 });
  }

  const body = await req.text();

  const valid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    console.error("Invalid Stripe webhook signature");
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);
  console.log("Stripe webhook received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    const orderNumber = session.metadata?.order_number;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (orderId) {
      // Instant self-service checkout flow — paid, ready to print
      // Authoritative contact info comes from the completed Stripe session.
      const stripeEmail =
        session.customer_details?.email ?? session.customer_email ?? null;
      const stripePhone = session.customer_details?.phone ?? null;
      const shipping =
        session.shipping_details ?? session.collected_information?.shipping_details ?? null;

      const updatePayload: Record<string, unknown> = {
        payment_status: "paid",
        status: "quote_approved",
      };
      if (stripeEmail) updatePayload.customer_email = stripeEmail;
      if (stripePhone) updatePayload.customer_phone = stripePhone;
      if (shipping) updatePayload.shipping_address = shipping;

      const { data: order, error } = await adminClient
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId)
        .select("order_number, product_title, notes, file_paths, fulfillment, shipping_address, customer_phone, pieces")
        .maybeSingle();

      if (error) {
        console.error("Failed to mark instant order " + orderId + " as paid:", error);
      } else {
        console.log("Instant order " + orderId + " marked paid + quote_approved");

        // Same customer confirmation email path used for paid orders
        const notes = order?.notes ?? "";
        const orderPieces: Array<Record<string, unknown>> | null =
          Array.isArray(order?.pieces) ? order!.pieces : null;
        const isV2Pieces = orderPieces != null && orderPieces.some((p) => typeof p.material === "string");

        let material: string;
        let color: string | null;
        let infill: string | null;
        let wallLoops: string | null;

        if (isV2Pieces) {
          const mats = [...new Set(orderPieces!.map((p) => String(p.material ?? "")))];
          const infills = [...new Set(orderPieces!.map((p) => String(p.infill ?? "")))];
          const walls = [...new Set(orderPieces!.map((p) => String(p.wallLoops ?? "")))];
          material = mats.length === 1 ? mats[0] : `Mixed (${mats.join(", ")})`;
          color = null;
          infill = infills.length === 1 ? infills[0] : "mixed";
          wallLoops = walls.length === 1 ? walls[0] : "mixed";
        } else {
          const materialMatch = /Material: ([^\s/.]+)/.exec(notes);
          const colorMatch = /Material: [^\s/.]+ \/ ([^.]+)\./.exec(notes);
          const infillMatch = /Infill: ([^,]+),/.exec(notes);
          const wallsMatch = /,\s*(\S+) walls/.exec(notes);
          material = materialMatch?.[1] ?? "PLA";
          color = colorMatch?.[1]?.trim() ?? null;
          infill = infillMatch?.[1]?.trim() ?? null;
          wallLoops = wallsMatch?.[1] ?? null;
        }

        const qtyMatch = /qty (\d+)/.exec(notes);
        const filesMatch = /Files: ([^.]+)\./.exec(notes);
        const filePaths: string[] = Array.isArray(order?.file_paths) ? order!.file_paths : [];
        const fileNames = filesMatch
          ? filesMatch[1].split(",").map((s: string) => s.trim())
          : filePaths.map((p) => p.split("/").pop() ?? p);

        const { error: mailErr } = await adminClient.functions.invoke(
          "send-order-confirmation",
          {
            body: {
              customerEmail: stripeEmail,
              customerPhone: stripePhone ?? order?.customer_phone ?? null,
              orderNumber: order?.order_number,
              finalPrice: (session.amount_total ?? 0) / 100,
              material,
              color,
              infill,
              wallLoops,
              quantity: qtyMatch ? Number(qtyMatch[1]) : null,
              fulfillment: order?.fulfillment ?? null,
              shippingAddress: shipping ?? order?.shipping_address ?? null,
              filePaths,
              fileNames,
              deliveryDate: null,
              customerName: session.customer_details?.name ?? null,
              paymentMethod: "stripe",
              stripePaymentLink: null,
              pieces: orderPieces,
            },
          },
        );
        if (mailErr) console.error("send-order-confirmation failed:", mailErr);
      }
    } else if (orderNumber) {
      const { error } = await adminClient
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("order_number", parseInt(orderNumber));

      if (error) {
        console.error("Failed to update payment_status for order #" + orderNumber + ":", error);
      } else {
        console.log("Marked order #" + orderNumber + " as paid");
      }
    }

    // B2: order_paid — idempotent (Stripe session.id is PostHog event uuid), 3s timeout
    const meta = session.metadata ?? {};
    const rawPHId = typeof meta.ph_distinct_id === "string" ? meta.ph_distinct_id.trim() : "";

    // v2-specific additive properties (safe to add — undefined on legacy orders)
    const pricingVersion = meta.pricing_version ? Number(meta.pricing_version) : null;
    const partCount = meta.part_count ? Number(meta.part_count) : null;
    const materialsStr = typeof meta.materials === "string" ? meta.materials : null;
    const isMixed = materialsStr ? materialsStr.includes(",") : null;

    await captureOrderPaid(
      rawPHId || ("anon_" + session.id),
      {
        order_id: meta.order_id ?? null,
        order_number: meta.order_number ?? null,
        value: (session.amount_total ?? 0) / 100,
        currency: (session.currency ?? "eur").toUpperCase(),
        fulfillment: meta.fulfillment ?? null,
        product_type: meta.product_type ?? null,
        part_slug: meta.part_slug ?? null,
        utm_source: meta.utm_source ?? null,
        utm_medium: meta.utm_medium ?? null,
        utm_content: meta.utm_content ?? null,
        utm_campaign: meta.utm_campaign ?? null,
        customer_ref: meta.customer_ref ?? null,
        $session_id: meta.ph_session_id ?? null,
        ...(pricingVersion != null ? { pricing_version: pricingVersion } : {}),
        ...(partCount != null ? { part_count: partCount } : {}),
        ...(materialsStr != null ? { materials: materialsStr } : {}),
        ...(isMixed != null ? { is_mixed: isMixed } : {}),
      },
      session.id,
      !!rawPHId,
    );
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
