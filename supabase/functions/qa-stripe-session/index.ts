// TEMPORARY QA helper — deleted right after use.
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
Deno.serve(async (req) => {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return new Response("bad id", { status: 400 });
  const s = await stripe.checkout.sessions.retrieve(id);
  const li = await stripe.checkout.sessions.listLineItems(id, { limit: 50 });
  return new Response(JSON.stringify({
    status: s.status, amount_subtotal: s.amount_subtotal, amount_total: s.amount_total,
    line_items: li.data.map(l => ({ description: l.description, quantity: l.quantity, unit: l.price?.unit_amount, amount_total: l.amount_total })),
  }), { headers: { "Content-Type": "application/json" } });
});
