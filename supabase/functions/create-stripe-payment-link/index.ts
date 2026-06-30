import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const { data: roleData } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) return new Response("Forbidden", { status: 403, headers: corsHeaders });

    const { orderNumber, finalPrice } = await req.json();

    if (!orderNumber || !finalPrice) {
      return new Response(
        JSON.stringify({ error: "orderNumber and finalPrice are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const amountCents = Math.round(finalPrice * 100);

    // Create a one-time price
    const priceRes = await fetch("https://api.stripe.com/v1/prices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "unit_amount": String(amountCents),
        "currency": "eur",
        "product_data[name]": `Impresión 3D — Pedido #${orderNumber}`,
      }),
    });

    if (!priceRes.ok) {
      const err = await priceRes.text();
      console.error("Stripe price creation failed:", err);
      return new Response(
        JSON.stringify({ error: "STRIPE_PRICE_FAILED", details: err }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const price = await priceRes.json();

    // Create the Payment Link
    const linkRes = await fetch("https://api.stripe.com/v1/payment_links", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "line_items[0][price]": price.id,
        "line_items[0][quantity]": "1",
        "metadata[order_number]": String(orderNumber),
        "after_completion[type]": "redirect",
        "after_completion[redirect][url]": "https://dimension3dprints.com/track",
      }),
    });

    if (!linkRes.ok) {
      const err = await linkRes.text();
      console.error("Stripe payment link creation failed:", err);
      return new Response(
        JSON.stringify({ error: "STRIPE_LINK_FAILED", details: err }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const link = await linkRes.json();
    console.log("Stripe payment link created for order #" + orderNumber + ":", link.url);

    return new Response(JSON.stringify({ url: link.url }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("create-stripe-payment-link error:", err?.message);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: err?.message ?? "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
