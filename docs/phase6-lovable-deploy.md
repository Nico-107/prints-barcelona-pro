# Phase 6 Deploy Instructions — Owner Emails, Zip Downloads & Minimum Price

Deploy instructions for the owner (Nico). All Edge Function updates must be
applied through Lovable's deploy tools, not the CLI.

No new database migrations are required for this phase. All database work from
Phase 5 remains valid.

---

## 1. Edge Function updates

Deploy these functions through **Lovable → Supabase → Edge Functions**:

### `_shared/signedUrl.ts` *(new shared module)*

HMAC-SHA256 helpers for generating and verifying signed download URLs.
Used by both `order-files-zip` and the admin zip button. Must be deployed
alongside any function that imports it.

### `order-files-zip` *(updated)*

Now accepts signed URLs in addition to admin-JWT auth.

A signed URL looks like:
```
/functions/v1/order-files-zip?order_number=123&exp=1700000000&sig=<hex>
```

- `exp` — Unix timestamp (30 days from when the email was sent)
- `sig` — HMAC-SHA256 of `"order.<order_number>.<exp>"` keyed by the
  Supabase service-role key

The admin panel zip button (already in production) generates these URLs
directly in the browser using the service-role key it already holds.

**Important**: until this function is deployed, the zip link in the owner
confirmation email will not work. The admin panel "Descargar ZIP" button
already works (it calls the function directly with the JWT).

Also accepts signed quote zip URLs:
```
/functions/v1/order-files-zip?quote_id=<uuid>&exp=<ts>&sig=<hex>
```
(`sig` is HMAC of `"quote.<quote_id>.<exp>"`)

### `send-order-confirmation` *(updated)*

New owner email design:
- Dimension3D wordmark header
- Gradient accent bar
- Order details table (reference, material, quantity, urgency, fulfillment)
- Payment breakdown (subtotal, shipping if applicable, total)
- **Signed zip download link** (30-day expiry) — requires `order-files-zip`
  to be deployed first; until then the link appears in the email but returns
  an error when clicked

Language of the owner notification is always Spanish (Nico is in Barcelona).

### `send-quote-request` *(updated)*

Same new owner email design with gradient header. No zip link (quote files
are attached to the initial upload, not packaged separately).

Also now includes the payment breakdown block to show quoted price range.

### `create-instant-checkout` *(updated)*

Minimum order raised from **10,00 €** to **9,90 €** (`EST.minimumEur: 9.9`).
The engine constant is shared with the front end via
`scripts/check-estimator-sync.mjs`, which verifies byte-for-byte parity. Both
files were updated together and the build check passes.

### `stripe-webhook` *(updated)*

Minor: now stores the payment breakdown fields (`subtotal_cents`,
`shipping_cents`, `charge_cents`) in the `orders` row on `checkout.session.completed`.
These fields back the payment breakdown panel in the admin order card.

---

## 2. What to test after deploy

### Signed zip link (order email)
1. Place a test order via the estimator (or use the most recent real order).
2. Open the owner confirmation email → click **Descargar archivos ZIP**.
3. The browser should download `order-<number>-files.zip` without prompting
   for a password or showing an auth error.
4. Verify the zip contains the uploaded STL/3MF files.

### Admin panel zip button
Already works pre-deploy. No re-testing needed unless you redeploy the function.

### Minimum order price
1. Upload a tiny file (< 5 g estimated) to the estimator.
2. The price should show **9,90 €** (not 10,00 €).
3. The price breakdown row should read "Piezas 9,90 €".

---

## 3. What stays unchanged until deploy

| Feature | Status without deploy |
|---|---|
| Zip link in owner emails | Link appears but returns error when clicked |
| Signed zip in quote emails | Same — link present, fails until deployed |
| Admin "Descargar ZIP" button | **Works now** (uses direct JWT auth) |
| Minimum price in estimator | Shows 9,90 € (frontend already updated) |
| Minimum price charged in Stripe | Still 10,00 € until `create-instant-checkout` is deployed |

---

## 4. Frontend changes (already live on `main`)

No separate deploy step — Lovable picks up `main` automatically.

Key changes in Phase 6:

- **9,90 € minimum throughout** — all visitor-facing strings updated across
  all 8 languages (es, ca, en, de, fr, nl, it, pt), 27 source files
- **Cutoff line uses first-person singular** — "Imprimo mañana" (not
  "Imprimimos mañana") in the price window, consistent with the rest of the copy
- **Checkout dialog scrollable area** — extra padding prevents the PriceBreakdown
  row from being clipped at the bottom at 1249×779 viewport
- **Admin order detail** — payment breakdown panel (Subtotal, Envío, Total)
  and urgency badge

---

## 5. Env var requirements

No new env vars in Phase 6. All existing vars carry over:

| Var | Used by |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `order-files-zip` (signs + verifies URLs) |
| `RESEND_API_KEY` | `send-order-confirmation`, `send-quote-request` |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook` |

---

## 6. Rollback notes

- Edge functions are stateless — redeploying the previous version of any
  function is safe at any time.
- The minimum-price change (`9,90 €` vs `10,00 €`) is a pure price reduction
  for the customer; rolling back raises prices for affected orders, which is
  not recommended after customers have seen the lower price.
