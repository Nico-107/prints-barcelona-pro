# LOVABLE_TODO.md

Edge-function changes that cannot be made in this repo (they live in Lovable).
Each section lists what Lovable needs to do, with the fully-formed code block
to apply. Keep this file in sync with each shipped prompt.

---

## Prompt 1

### 1. `create-instant-checkout` — forward PostHog identity & experiment variants

**Why.** Buyers returning from Stripe currently show up in PostHog as brand-new
people because `checkout_returned` / `instant_checkout_completed` / `order_paid`
fire before PostHog hydrates the original visitor. Prompt 1 Part C threads the
original `distinct_id` / `session_id` (and the active `xp_*` variants) through
Stripe so the frontend can bootstrap PostHog from the URL on return.

**What the frontend already sends** (shipped in `src/lib/checkoutBody.ts`):

```jsonc
{
  "ph_distinct_id": "0194a3f0-...",
  "ph_session_id":  "0194a3f0-...",
  "xp_variants":    { "xp_home_proof_r1": "A" }
  // plus the usual fields (pricingVersion, pieces, etc.)
}
```

**Edge function must:**

1. Read `ph_distinct_id`, `ph_session_id`, and `xp_variants` from the request
   body (treat all three as optional — fall back to `null` / `{}`).
2. Build `success_url` as the current post-payment landing page, but append
   `ph_did=<ph_distinct_id>&ph_sid=<ph_session_id>` as query parameters
   when both are present. `cancel_url` gets the same two params. Do NOT
   include the `xp_variants` in the URL (metadata is enough and keeps URLs
   short).
3. Put `ph_distinct_id`, `ph_session_id`, and a JSON-stringified
   `xp_variants` into the `metadata` object of `stripe.checkout.sessions.create`
   so webhook-side server events (`order_paid_server`) can tag the same
   distinct_id and variant snapshot.

**Concrete patch (Deno / TypeScript, adjust names to the function's style):**

```ts
// Inside supabase/functions/create-instant-checkout/index.ts

const phDid = typeof body.ph_distinct_id === "string" ? body.ph_distinct_id : null;
const phSid = typeof body.ph_session_id === "string" ? body.ph_session_id : null;
const xpVariants: Record<string, string> =
  body.xp_variants && typeof body.xp_variants === "object" ? body.xp_variants : {};

function withPhParams(url: string): string {
  if (!phDid && !phSid) return url;
  const sep = url.includes("?") ? "&" : "?";
  const parts: string[] = [];
  if (phDid) parts.push(`ph_did=${encodeURIComponent(phDid)}`);
  if (phSid) parts.push(`ph_sid=${encodeURIComponent(phSid)}`);
  return url + sep + parts.join("&");
}

const session = await stripe.checkout.sessions.create({
  // ...existing fields...
  success_url: withPhParams(successUrl),
  cancel_url:  withPhParams(cancelUrl),
  metadata: {
    ...(existingMetadata ?? {}),
    ph_distinct_id: phDid ?? "",
    ph_session_id:  phSid ?? "",
    xp_variants:    JSON.stringify(xpVariants),
  },
});
```

4. The webhook handler that fires `order_paid_server` into PostHog should
   read `metadata.ph_distinct_id` and use it as the `distinct_id` of the
   server-side `posthog.capture()` call (and include the parsed
   `metadata.xp_variants` keys as event properties). If `metadata.ph_distinct_id`
   is empty, keep the current behaviour (use customer email / ref).

### 2. `create-stripe-payment-link` — upgrade redirect URL to www

**Why.** Prompt 1 Part F audits the whole repo for non-www URLs. One
remaining non-www URL is inside a Supabase edge function.

**Current (`supabase/functions/create-stripe-payment-link/index.ts` ~line 83):**

```ts
"after_completion[redirect][url]": "https://dimension3dprints.com/track",
```

**Change to:**

```ts
"after_completion[redirect][url]": "https://www.dimension3dprints.com/track",
```

Low risk — Vercel already redirects apex → www, so visitors landed at the
right place after a 301. This just removes the hop.

### 3. Prompt 1 Part F — apex → www redirect confirmation

The apex → www redirect is already configured in this repo in
`vercel.json`:

```json
{
  "source": "/:path*",
  "has": [{ "type": "host", "value": "dimension3dprints.com" }],
  "destination": "https://www.dimension3dprints.com/:path*",
  "permanent": true
}
```

No action needed in the Vercel dashboard. If the apex ever stops redirecting
in production (e.g. DNS change), click path: Vercel → Project → Settings →
Domains → `dimension3dprints.com` → "Redirect to" → select
`www.dimension3dprints.com` → save.

### 4. Nothing else

No other edge functions change in Prompt 1. Prompts 2–5 may add more
sections below.

---

## Prompt 2

### 1. `create-instant-checkout` — server must mirror the mesh-repair + cap

**Why.** The frontend now repairs messy STLs (overlapping shells, duplicate
internal surfaces) with `manifold-3d` and applies a volume-only safety cap
(1.6× the bounding-box estimate) before showing a price. The server still
runs the raw `analyzeTriangles` → `priceOrder` pipeline, so for a messy
file the server price can be €90 while the client price is €11 — and the
checkout returns `PRICE_MISMATCH` because the 2-cent tolerance is blown.

**Shipped on the client** (`src/lib/prepareMeshForPricing.ts`,
`src/lib/meshRepair.ts`, `src/lib/meshQuality.ts`,
`src/lib/meshSafetyCap.ts`, `src/lib/pricingWithCap.ts`,
`src/workers/meshAnalysisWorker.ts`):

- Count shells + detect open edges (watertight?).
- If not clean, split into watertight shells, build a Manifold per shell,
  `Manifold.union(all)`, read back the triangles, re-run
  `analyzeTriangles` on the repaired envelope.
- 8-second repair budget. On timeout / failure fall back to a VOLUME-ONLY
  analysis (synthesised bounding-box mesh with the real signed volume).
- Safety cap: compute the volume-only order price; if the primary order
  price exceeds **1.6× that**, substitute the volume-only price.

**Edge function must ship the same logic, keyed on the same thresholds.**
Pseudocode (Deno — adapt to the function's style):

```ts
// After stlToTriangles(buf) in supabase/functions/create-instant-checkout/index.ts
const raw = analyzeTriangles(tri);
const q = analyzeMeshQuality(tri); // port of src/lib/meshQuality.ts (pure JS)

let analysis = raw;
let usedFallback = false;
if (!(q.watertight && q.shells === 1)) {
  // Deno can host the manifold-3d WASM — see examples/node.
  const repaired = await repairMeshWithBudget(tri, q, 8_000);
  if (repaired) {
    analysis = analyzeTriangles(repaired.repaired);
  } else {
    analysis = volumeOnlyAnalysis(raw.boundsMm, raw.volumeMm3);
    usedFallback = true;
  }
}

// Safety cap: always compute the volume-only price and cap the primary.
const primary = priceOrder(buildInputs(analysis), urgency, flags);
const volOnly = priceOrder(buildInputs(volumeOnlyAnalysis(raw.boundsMm, raw.volumeMm3)), urgency, flags);
const cap = Math.round(volOnly.totalCents * 1.6);
if (primary.totalCents > cap) {
  // Use the volume-only price instead.
  return volOnly;
}
return primary;
```

Port the TWO files below verbatim into the edge function (they have no
external deps beyond the shared estimator block):

- `src/lib/meshQuality.ts`      → `analyzeMeshQuality` + `splitWatertightShells`
- `src/lib/meshSafetyCap.ts`    → `volumeOnlyAnalysis`

And add `import ManifoldModule from "npm:manifold-3d"` for the repair step
(the module runs in Deno — `mod.setup()` works identically there).

Until the edge function ships this, messy-file buyers will see the correct
price in the modal but `create-instant-checkout` will reject the request
with `PRICE_MISMATCH`. Non-messy files are unaffected (deltas stay ≤ €0.01).

### 2. Nothing else for Prompt 2.

---

## Prompt 3

### 1. `create-instant-checkout` — mirror the new shipping config

**Why.** Of 22 visitors who clicked Buy on a quote under €15, only 2 paid.
The old flat shipping surcharge only appeared at Stripe, so a €9.90 part
showed as a bigger total by surprise. The client now shows Stripe's exact
total next to Buy by routing every shipping number through
`src/config/shipping.ts`. The edge function must apply the same rules or
the server rejects the client's price.

**New numbers (shipped on the client in `src/config/shipping.ts`):**

```ts
export const SHIPPING_EUR = 4.90;          // was 5.90
export const SHIPPING_CENTS = 490;
export const FREE_SHIPPING_FROM_EUR = 30;  // was 100 (v3) / 99.90 (v4)
export const FREE_SHIPPING_FROM_CENTS = 3000;
export const DELIVERED_CAP_CENTS = 3090;   // under-€30 delivered total ceiling
```

**Shape of the new request body** (fields the frontend sends; everything
existing stays):

```jsonc
{
  "pricingVersion": 3,
  // ...existing fields...
  "page_group": "local",             // or "non_local"
  "shipping_mode": "delivered",      // or "upfront" (only meaningful on local pages)
  "fulfillment": "shipping",         // or "pickup"
  "parts_subtotal_cents": 990,
  "shipping_cents": 500,             // delivered: 500 after charm, upfront: 490
  "expected_total_cents": 1490       // == parts_subtotal + shipping
}
```

**Edge function must:**

1. **Replace `shippingCents` branch (v3 & v4 priceOrder result)** with a
   call to a shared helper, e.g.

   ```ts
   // At the top of create-instant-checkout/index.ts
   const SHIPPING_CENTS = 490;
   const FREE_SHIPPING_FROM_CENTS = 3000;
   const DELIVERED_CAP_CENTS = 3090;

   function roundToCharm90(cents: number): number {
     return Math.max(990, Math.floor((cents - 90) / 100 + 0.5) * 100 + 90);
   }
   function deliveredTotalCents(subtotal: number): number {
     if (subtotal >= FREE_SHIPPING_FROM_CENTS) return subtotal;
     return Math.min(roundToCharm90(subtotal + SHIPPING_CENTS), DELIVERED_CAP_CENTS);
   }
   function deliveredShippingCents(subtotal: number): number {
     return deliveredTotalCents(subtotal) - subtotal;
   }
   function upfrontShippingCents(subtotal: number): number {
     return subtotal >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
   }
   function serverShippingCents(body: any, subtotalCents: number): number {
     if (body.fulfillment === 'pickup') return 0;
     if (body.page_group === 'non_local') return deliveredShippingCents(subtotalCents);
     return body.shipping_mode === 'delivered'
       ? deliveredShippingCents(subtotalCents)
       : upfrontShippingCents(subtotalCents);
   }
   ```

2. **Replace** the current `const shippingCents = val.fulfillment === 'shipping' ? EST.shippingCents : 0;`
   **with** `const shippingCents = serverShippingCents(val, priced.order.totalCents);`.
   Keep the v4 analogue consistent (drop the hard-coded `< 9990` free
   threshold — the new `FREE_SHIPPING_FROM_CENTS` is the only one).

3. **Reject mismatched `expected_total_cents`** — if present and
   `|expected_total - (subtotal + shippingCents)| > 2`, return
   `PRICE_MISMATCH`.

4. **Stripe line items**: parts as before + one shipping line, labelled
   based on the final amount:
   - `shippingCents > 0, mode === 'delivered'` → "Envío (incluido)"
   - `shippingCents > 0, mode === 'upfront'`  → "Envío"
   - `shippingCents === 0, fulfillment === 'shipping'` → "Envío gratis 0,00 €"
   - `fulfillment === 'pickup'` → omit the shipping line entirely.

5. **Raise `MAX_CHARGE_CENTS`** in `checkout-policy.ts` from `20590` to
   `20000` (max legitimate total is now €200 parts + €0 shipping — free
   above €30 — which never exceeds €200). Update the matching test in
   `src/lib/checkoutEdgePolicy.test.ts` as part of the same Lovable PR.

6. **Stripe metadata**: add

   ```
   page_group:     local | non_local
   shipping_mode:  delivered | upfront
   xp_shipping_r1: A | B | (unset on non_local)
   ```

   alongside the existing `ph_distinct_id` / `xp_variants` metadata.

Until this ships, messy mesh / low-subtotal buyers will see the correct
total in the modal but hit `PRICE_MISMATCH` at checkout (the server still
charges €5.90 and uses the old free-shipping ceiling).

### 2. Order confirmation email / admin view

Grep of the repo turned up zero user-visible "5,90 €" in email templates —
every mention lives in parseable notes ("Shipping: EUR x.xx" strings on
historical orders, parsed by `src/lib/adminPaymentBreakdown.ts`). No
change needed to email copy. Historical order totals continue to render
with their original (old-rate) breakdown; new orders will render with the
new €4.90 shipping line once the edge function ships.

### 3. Nothing else for Prompt 3.
