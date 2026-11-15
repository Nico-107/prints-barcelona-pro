# Phase 3 — what to deploy in Lovable

## Migrations

1. `supabase/migrations/20261115122852_phase3_quote_accept_pay.sql`
   - Adds `quote_token`, `quote_price_cents`, `quote_shipping_cents`,
     `quote_production_days`, `quote_message`, `quote_sent_at`,
     `quote_expires_at`, `quote_fulfillment`, `quote_stripe_link`,
     `quote_paid_at`, `quote_reminder_sent_at` on `quote_requests`.
   - Backfills tokens for existing rows; `quote_token` becomes `UNIQUE
     NOT NULL DEFAULT`.
   - Creates RPC `public.get_quote_by_token(_token text)` — security
     definer, returns only safe fields for the public `/presupuesto/<token>`
     page. No phone, no admin internals.

## Edge functions

1. `send-customer-quote` *(new)* — owner-only. Creates the Stripe payment
   link for the total, writes the quote settings on the row, and emails
   the customer the quote in their language. Uses
   `FREE_SHIPPING_FROM_EUR = 100` for the shipping-free rule.
2. `send-quote-reminders` *(new)* — service-role or scheduled. Picks up
   quotes sent > 3 days ago that are still unpaid and have no
   `quote_reminder_sent_at`, sends the reminder, stamps the column so it
   only ever fires once.
3. `stripe-webhook` *(updated)* — recognises the new `quote_id` metadata
   on a paid session, converts the quote into an order (idempotent via
   `quote_paid_at` / `converted_order_id`), then calls the existing
   `send-order-confirmation` so the owner gets `[PEDIDO]` and the
   customer gets the confirmation in their language.

Schedule `send-quote-reminders` once/day via Supabase scheduled functions
or a cron (no new secret needed).

## Site build

Redeploy so the new customer page and admin UI ship:

- `/presupuesto/:token` — customer page with the quote, "Aceptar y
  pagar" (opens `quote_stripe_link`), "Tengo una pregunta"
  (email/WhatsApp fallbacks), expiry date.
- `/admin/quotes-inbox` — now includes the owner "Enviar presupuesto"
  form (price, days, pickup/shipping with the free-shipping flag) and
  three reply templates (Necesito más datos · Pieza no imprimible tal
  cual · Presupuesto enviado) that open mail / WhatsApp pre-filled.

## Secrets

None new. Reuses `STRIPE_SECRET_KEY` and `RESEND_API_KEY`.

## Follow-up

- Instant checkout keeps its own shipping policy (`EST.shippingCents`).
  Aligning both to `FREE_SHIPPING_FROM_EUR` is tracked as a follow-up;
  the owner asked for this constant to be applied in the quote path only
  for Phase 3.

## Verification done

- `src/lib/customerQuoteTemplate.test.ts` renders the customer quote
  email in every language, asserts the Stripe link + filename show up,
  no `undefined` leak, and the free-shipping note only appears on
  shipping orders with zero shipping.
- Preview renderer now bundles a customer-quote template; the full set
  is 80 HTML files + 160 PNG screens at 600 + 360 px.
