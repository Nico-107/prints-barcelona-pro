import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

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
        .select("order_number, product_title, notes, file_paths, fulfillment, shipping_address, customer_phone")
        .maybeSingle();

      if (error) {
        console.error("Failed to mark instant order " + orderId + " as paid:", error);
      } else {
        console.log("Instant order " + orderId + " marked paid + quote_approved");

        // Same customer confirmation email path used for paid orders
        const notes = order?.notes ?? "";
        const materialMatch = /Material: ([^\s/.]+)/.exec(notes);
        const colorMatch = /Material: [^\s/.]+ \/ ([^.]+)\./.exec(notes);
        const infillMatch = /Infill: ([^,]+),/.exec(notes);
        const wallsMatch = /,\s*(\S+) walls/.exec(notes);
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
              material: materialMatch?.[1] ?? "PLA",
              color: colorMatch?.[1]?.trim() ?? null,
              infill: infillMatch?.[1]?.trim() ?? null,
              wallLoops: wallsMatch?.[1] ?? null,
              quantity: qtyMatch ? Number(qtyMatch[1]) : null,
              fulfillment: order?.fulfillment ?? null,
              shippingAddress: shipping ?? order?.shipping_address ?? null,
              filePaths,
              fileNames,
              deliveryDate: null,
              customerName: session.customer_details?.name ?? null,
              paymentMethod: "stripe",
              stripePaymentLink: null,
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
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
