// D4 — pricing-config edge function. Public GET returning the capability manifest so the
// frontend hook `useServerCapabilities()` can switch between legacy and v5 modes without a
// build flag. Deployed via Lovable (verify_jwt=false in supabase/config.toml).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { BUILD_ID, PRICING_VERSION, CAPABILITIES } from "../_shared/version.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// Delivered shipping rules (D-2): 4,90 € per order, free from 30 € parts subtotal after
// discounts; charm cap at 30,90 € for non-local pages so the delivered price never flips
// above the free threshold.
const SHIPPING = {
  flatCents: 490,
  freeFromCents: 3000,
  charmCapCents: 3090,
};

// A single integer fingerprint of the shipping + capability payload so the client can
// cheaply invalidate caches when the server changes.
function estHash(): string {
  const payload = JSON.stringify({ BUILD_ID, PRICING_VERSION, CAPABILITIES, SHIPPING });
  let h = 0;
  for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload.charCodeAt(i)) | 0;
  return "h" + (h >>> 0).toString(16);
}

serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  if (url.searchParams.has("health")) {
    return new Response(
      JSON.stringify({ fn: "pricing-config", build: BUILD_ID, pricingVersion: PRICING_VERSION, capabilities: CAPABILITIES }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  const body = {
    build: BUILD_ID,
    pricingVersion: PRICING_VERSION,
    capabilities: CAPABILITIES,
    shipping: SHIPPING,
    estHash: estHash(),
  };
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60", ...corsHeaders },
  });
});
