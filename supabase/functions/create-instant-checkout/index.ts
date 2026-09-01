import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SITE_URL = "https://dimension3dprints.com";

// Anon-callable: same permissive CORS pattern as send-quote-request (no auth required)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_MATERIALS = ["PLA", "PETG", "ABS", "TPU"];
const MAX_PRICE = 56.5;

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = requestCounts.get(ip);
  if (!rec || now > rec.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (rec.count >= MAX_REQUESTS_PER_WINDOW) return true;
  rec.count++;
  return false;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(clientIP)) {
      return json({ error: "Too many requests. Please try again later." }, 429);
    }

    const body = await req.json();
    const {
      material, color, infill, wallLoops, quantity,
      filePaths, fileNames, exactPrice, contactEmail, contactPhone, language,
      fulfillment,
    } = body ?? {};

    const price = Number(exactPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return json({ error: "INVALID_PRICE" }, 400);
    }
    if (price > MAX_PRICE) {
      console.warn(`Rejected instant checkout: price ${price} exceeds ceiling (IP: ${clientIP})`);
      return json({ error: "PRICE_ABOVE_INSTANT_LIMIT" }, 400);
    }
    if (typeof material !== "string" || !ALLOWED_MATERIALS.includes(material)) {
      return json({ error: "INVALID_MATERIAL" }, 400);
    }
    if (fulfillment !== "pickup" && fulfillment !== "shipping") {
      return json({ error: "INVALID_FULFILLMENT" }, 400);
    }
    if (!STRIPE_SECRET_KEY) return json({ error: "STRIPE_NOT_CONFIGURED" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const names: string[] = Array.isArray(fileNames) ? fileNames.map(String) : [];
    const paths: string[] = Array.isArray(filePaths) ? filePaths.map(String) : [];
    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    const notes = [
      "Instant checkout (self-service, ≤ €35).",
      contactEmail ? `Email: ${contactEmail}.` : "",
      `Material: ${material}${color ? ` / ${color}` : ""}.`,
      `Infill: ${infill ?? "n/a"}, ${wallLoops ?? "n/a"} walls, qty ${qty}.`,
      `Total price: €${price.toFixed(2)}.`,
      names.length ? `Files: ${names.join(", ")}.` : "",
      paths.length ? `Paths: ${paths.join(", ")}.` : "",
      language ? `Language: ${language}.` : "",
    ].filter(Boolean).join(" ");

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        product_title: `3D Print — ${material}${color ? ` (${color})` : ""}`,
        customer_phone: (typeof contactPhone === "string" && contactPhone.trim()) || "see notes",
        customer_email:
          (typeof contactEmail === "string" && contactEmail.trim()) || null,
        status: "awaiting_payment",
        fulfillment,
        notes,
        photos: [],
        payment_method: "stripe",
        payment_status: "pending",
        file_paths: paths,
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      console.error("Order insert failed:", orderErr);
      return json({ error: "ORDER_INSERT_FAILED", details: orderErr?.message }, 500);
    }

    const params = new URLSearchParams({
      "mode": "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][unit_amount]": String(Math.round(price * 100)),
      "line_items[0][price_data][product_data][name]":
        `Impresión 3D — Pedido #${order.order_number}`,
      "metadata[order_id]": order.id,
      "metadata[order_number]": String(order.order_number),
      "metadata[fulfillment]": fulfillment,
      "success_url": `${SITE_URL}/?checkout=success`,
      "cancel_url": `${SITE_URL}/?checkout=cancelled`,
    });
    if (fulfillment === "shipping") {
      params.set("shipping_address_collection[allowed_countries][0]", "ES");
      params.set("phone_number_collection[enabled]", "true");
    }
    if (typeof contactEmail === "string" && contactEmail.trim()) {
      params.set("customer_email", contactEmail.trim());
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Stripe checkout session failed:", err);
      return json({ error: "STRIPE_SESSION_FAILED", details: err }, 502);
    }

    const session = await res.json();
    console.log(`Instant checkout session created for order ${order.id} (#${order.order_number})`);

    return json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error("create-instant-checkout error:", err?.message);
    return json({ error: "INTERNAL_ERROR", message: err?.message ?? "unknown" }, 500);
  }
});
