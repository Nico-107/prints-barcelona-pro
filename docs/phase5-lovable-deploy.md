# Phase 5 Deploy Instructions — Reaching Non-Buyers

Deploy instructions for the owner. All migrations and Edge Function updates
must be applied through Lovable's deploy tools, not the CLI.

---

## 1. Database migrations

Apply these four migrations **in order** through **Lovable → Supabase → Migrations**:

### `20261117000001_promo_codes.sql`
Adds the `promo_codes` table with `validate_promo` RPC and an initial seed for
DIMENSION11. Backs discount codes, the student-code email, and the exit-intent
code offer.

### `20261117000002_promo_increment_uses.sql`
Adds the `increment_promo_uses` SECURITY DEFINER function called by the webhook
when a Stripe payment completes with a promo code attached.

### `20261117000003_saved_quotes.sql`
Adds the `saved_quotes` table — opt-in email capture with a 7-day reminder
cycle and an unsubscribe path (`/baja?token=…`).

### `20261117000004_checkout_recoveries.sql`
Adds the `checkout_recoveries` table for abandoned-checkout recovery
deduplication. Tracks sessions that received a recovery email and whether they
converted.

---

## 2. Edge Function updates

Deploy these five functions through **Lovable → Supabase → Edge Functions**:

### `create-instant-checkout`
Now enables Stripe abandoned-checkout recovery:
- Sets `after_expiration[recovery][enabled]=true` (creates a recovery URL)
- Sets `expires_at` to now + 2 hours
- Attempts `consent_collection[promotions]=auto` (retries without it on first
  rejection; not all Stripe accounts support it)

### `stripe-webhook`
Now handles two new Stripe events:
- `checkout.session.expired` — sends a recovery email via Resend, inserts a row
  into `checkout_recoveries`, fires `checkout_expired_server` to PostHog
- `checkout.session.completed` with `recovered_from` — marks the original
  recovery row as converted

Renames the server-side paid event from `order_paid` to `order_paid_server`.

Required env vars (already set in production):
- `RESEND_API_KEY`
- `POSTHOG_KEY`
- `POSTHOG_HOST` (e.g. `https://eu.i.posthog.com`)

**Stripe webhook event registration**: add `checkout.session.expired` to the
subscribed events in **Stripe Dashboard → Developers → Webhooks** if not already
present.

### `issue-promo-code` *(new)*
Issues a personalised single-use promo code by email. Called from:
- Exit-intent card ("Código del 20 %")
- Student discount request

Creates a code row in `promo_codes` and sends it via Resend in the visitor's
language (all 8 languages).

### `save-quote` *(new)*
Persists a saved quote to `saved_quotes` and sends a confirmation email with the
quote link, so the visitor can resume without re-uploading. Called by the
"Guardar presupuesto" button in the estimator and fire-and-forget from the
exit-intent card.

### `send-saved-quote-reminders` *(new)*
Sends one reminder email 24 h after a quote is saved, if the visitor has not
bought and has not unsubscribed. Must be configured as an **hourly** Supabase
cron schedule (the function checks timestamps server-side and skips rows outside
the 24 h window). Configure it in **Lovable → Supabase → Scheduled Functions**
with cron expression `0 * * * *`.

---

## 3. Stripe Webhook subscription

In **Stripe Dashboard → Developers → Webhooks**, add `checkout.session.expired`
to the events your webhook endpoint listens to, if it isn't already there.

---

## 4. What changed in the frontend

The frontend deploy comes from this branch (`main`) automatically on merge.

Key new features (Phase 5):
- **Saved-quote bar** — slim bar above the estimator when a quote was saved in
  IndexedDB from a previous session (fires within 7 days)
- **Lower-price panel** — opened via "¿Podemos bajarlo?"; shows savings options
  (infill, quality, pickup, urgency) and a maximum-budget form
- **Exit-reason card** — bottom bar after the modal has been open ≥5 s and
  dismissed; collects reason + sends a 20 % promo code (v4 only)
- **v4 hero badge** — green line showing the active public promo code and
  expiration date, driven live from the probe response
- **PromoLine** — single-use and public promo codes, student discount sub-flow
- **Buy-label experiment (buy_label_r1)** — 50/50 test of "Comprar" vs
  "Imprimir mi pieza"
- **Trust line under Buy** — "4,8/5 en reseñas · 250+ pedidos · Pago seguro
  con Stripe"

All new strings are translated into all 8 languages (es, ca, en, de, fr, nl, it, pt).

---

## 5. PostHog verification

After deploy, verify these events are arriving in PostHog:

| Event | Source |
|---|---|
| `order_paid_server` | stripe-webhook on completed payment |
| `checkout_expired_server` | stripe-webhook on expired session |
| `saved_quote_bar_shown`, `saved_quote_bar_clicked` | frontend |
| `exit_reason`, `exit_code_requested` | frontend |
| `lower_price_opened`, `lower_price_option_applied`, `budget_sent` | frontend |
| `promo_applied`, `promo_invalid`, `student_code_requested` | frontend |

HogQL queries for all these are in `docs/analytics-questions.md` (questions 13–18).
