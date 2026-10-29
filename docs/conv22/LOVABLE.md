# conv-22 Lovable prompts

Items below require changes to Supabase edge functions.
Paste each block into Lovable as a single prompt.

---

## LV-1: Allow 30–50 MB files for instant buy (server verify limit)

Context: the browser estimator marks files between 30–50 MB as instant-buy
eligible (they parsed successfully client-side). The server-side STL verify
step currently rejects files > 30 MB and converts the order to quote-only,
silently. The UI now shows "Buy" for these files; the edge function must honour it.

**Change needed in `supabase/functions/verify-stl/index.ts` (or equivalent):**

```
Raise the file size limit accepted by the STL verify function from 30 MB to
50 MB. If a file between 30–50 MB fails geometry checks, return a structured
error JSON { ok: false, reason: "geometry" } rather than rejecting based on
size alone. The client already handles the error JSON and will fall back to
quote-only with a user-visible reason line.
```

---

## LV-2: Stripe — expose `language` metadata on PaymentIntent

Context: `PaymentBadges.tsx` shows iDEAL for NL, MB WAY for PT, Klarna for DE.
The Stripe checkout session is created in the edge function. It currently does
not set `metadata.language`, so we can't filter payment methods server-side.

**Change needed in the checkout edge function (create-checkout-session or
equivalent):**

```
Add the `language` field from the incoming request body to the PaymentIntent
metadata:
  metadata: { ..., language: body.language ?? "es" }

Also add it to payment_method_options so that Klarna localisation works:
  payment_method_options: {
    klarna: { preferred_locale: body.language ?? "es" }
  }
```

---

## LV-3: Webhook — fire `purchase_completed` PostHog server event

Context: the client fires `purchase_completed` via PostHog JS after Stripe
redirects. If the user closes the tab before the redirect, the event is lost.
We want a server-side duplicate from the webhook for reliability.

**Change needed in the Stripe webhook edge function:**

```
On `payment_intent.succeeded` and `checkout.session.completed`, POST to
PostHog's HTTP capture endpoint:
  POST https://eu.posthog.com/capture/
  {
    "api_key": Deno.env.get("POSTHOG_PROJECT_API_KEY"),
    "event": "purchase_completed",
    "distinct_id": session.metadata?.userId ?? session.customer_email ?? "anonymous",
    "properties": {
      "order_id": session.id,
      "amount_eur": session.amount_total / 100,
      "currency": session.currency,
      "source": "webhook"
    }
  }

POSTHOG_PROJECT_API_KEY must be added to Supabase secrets. Value:
find it in PostHog → Project Settings → Project API Key.
```
