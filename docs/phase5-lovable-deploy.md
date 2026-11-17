# Phase 5 Deploy Instructions — Reaching Non-Buyers

Deploy instructions for the owner. All migrations and Edge Function updates
must be applied through Lovable's deploy tools, not the CLI.

---

## 1. Database migrations

Apply these migrations in order through **Lovable → Supabase → Migrations**:

### 1a. `20261117000003_promo_codes.sql`
Adds the `promo_codes` table (discount codes), `saved_quotes` table (emailed quotes),
and `increment_promo_uses` RPC. This backs the discount code flow, the student-code
email, and the exit-intent code offer.

### 1b. `20261117000004_checkout_recoveries.sql`
Adds the `checkout_recoveries` table for abandoned-checkout recovery deduplication.
Tracks which sessions received a recovery email and whether they converted.

---

## 2. Edge Function updates

Deploy these functions through **Lovable → Supabase → Edge Functions**:

### `create-instant-checkout`
Now enables Stripe abandoned-checkout recovery:
- Sets `after_expiration[recovery][enabled]=true` (creates recovery URL)
- Sets `expires_at` to now + 2 hours
- Attempts `consent_collection[promotions]=auto` for the recovery email
  (retries without it on first rejection, since not all Stripe accounts support it)

### `stripe-webhook`
Now handles two new Stripe events:
- `checkout.session.expired` — sends a recovery email via Resend, inserts into
  `checkout_recoveries`, fires `checkout_expired_server` to PostHog
- `checkout.session.completed` with `recovered_from` field — marks the original
  recovery row as converted

Renames the server-side paid event from `order_paid` to `order_paid_server`.

Required env vars (already set in production):
- `RESEND_API_KEY` — existing, used by send-order-confirmation
- `POSTHOG_KEY` — existing
- `POSTHOG_HOST` — existing, e.g. `https://eu.i.posthog.com`

**Stripe webhook event registration**: Add `checkout.session.expired` to the
subscribed events in the Stripe Dashboard → Webhooks if not already there.

### `issue-promo-code` (new)
Issues a personalised promo code by email. Called from:
- Exit-intent card ("Código del 20%")
- Student discount request

The function creates a single-use code in `promo_codes` and sends it via Resend.

### `save-quote` (new or existing — verify)
Called fire-and-forget after the exit code is requested, to persist the quote
so the customer can resume from their email link.

---

## 3. Stripe Webhook subscription

In **Stripe Dashboard → Developers → Webhooks**, add `checkout.session.expired`
to the events your webhook endpoint listens to, if it isn't already there.

---

## 4. What changed in the frontend

The frontend deploy comes from this branch (`reaching-non-buyers`) automatically
once it is merged to `main`.

Key new features:
- **Saved-quote bar** — slim bar above the estimator when a quote was saved in
  IndexedDB from a previous session (fires within 7 days)
- **Lower-price panel** — opened via "¿Podemos bajarlo?" link; shows up to 4
  savings options (10% infill, fast quality, pickup, standard urgency) and a
  maximum-budget form
- **Exit-reason card** — bottom fixed bar after the modal has been open ≥5 s
  and dismissed; collects reason + optionally sends a 20% promo code
- **Buy-label experiment (buy_label_r1)** — 50/50 test of "Comprar" vs
  "Imprimir mi pieza" on the buy button
- **Trust line under Buy** — replaces the old review text with a single
  "4,8/5 en reseñas · 250+ pedidos · Pago seguro con Stripe" line
- **Viewer collapse** — mobile collapse/expand button for the STL viewer
  within the dialog

All new strings are translated into all 8 languages (es, ca, en, de, fr, nl, it, pt).

---

## 5. PostHog verification

After deploy, verify in PostHog that these events are arriving:
- `order_paid_server` (replaces `order_paid` from webhook — look for it on the
  next completed order)
- `checkout_expired_server` (fires on every expired checkout session)
- `saved_quote_bar_shown`, `saved_quote_bar_clicked`
- `exit_reason`, `exit_code_requested`
- `lower_price_opened`, `lower_price_option_applied`, `budget_sent`

The HogQL queries for all these are in `docs/analytics-questions.md` (questions 13–16).
