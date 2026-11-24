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
