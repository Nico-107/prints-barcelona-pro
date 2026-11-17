# Phase 5 Final Report — Reaching Non-Buyers

Branch: `reaching-non-buyers` → merged to `main`  
Executed: 2026-11-17

---

## 1. What shipped per item

### Section 4 — Non-buyer capture

| Item | Shipped | Notes |
|---|---|---|
| 4.1 | ✅ | `savedQuoteStore.ts` — IndexedDB, 7-day TTL, `SavedQuoteEntry` interface |
| 4.2 | ✅ | `SavedQuoteBar` — slim dismissible bar; fires `saved_quote_bar_shown` / `saved_quote_bar_clicked` |
| 4.3 | ✅ | Auto-save useEffect in `StlEstimator`; clear on success |
| 4.4 | ✅ | `LowerPricePanel` — 4 savings options; "Dime tu presupuesto" form posts to `quote_requests` |
| 4.5 | ✅ | Stripe abandoned-checkout recovery: `createStripeSession` helper, `checkout_recoveries` migration, recovery email in `stripe-webhook`, mark-recovered on `checkout.session.completed` |
| 4.6 | ✅ | `ExitReasonCard` redesign — phase state machine (chips → code_offer → done); 20% code via `issue-promo-code`; two bugs found and fixed by E2E suite (see §4 below) |

### Section 5 — Layout and UX

| Item | Shipped | Notes |
|---|---|---|
| 5.1 | ✅ | Viewer height capped: `lg:h-[34vh]` / `max-lg:h-[130px]` |
| 5.2 | ✅ | Trust line `calc.trust.single` replaces old review text under Buy |
| 5.3 | ✅ | Viewer expand/collapse button in dialog (`calc.viewer.collapse` / `calc.viewer.expand`) |

### Section 6 — Measurement

| Item | Shipped | Notes |
|---|---|---|
| 6.1 | ✅ | `order_paid_server` replaces `order_paid` as server event; `checkout_expired_server` fires for every expired session with `recovery_sent` boolean |
| 6.2 | ✅ | `docs/analytics-events.md` — all new events documented |
| 6.3 | ✅ | `docs/analytics-questions.md` — queries 13–16 added (price-viewers→buy→paid funnel, exit reasons by bucket, promo usage by kind, recovery rate) |

### Experiment — buy_label_r1

| Item | Shipped | Notes |
|---|---|---|
| Registry entry | ✅ | `buy_label_r1`, layer `checkout_modal`, variants A/B, 50/50, minDays 14, maxDays 60 |
| OrderPanel | ✅ | B variant uses `calc.instantBuy.buyNow.b` / `calc.instantBuy.buyNow.from.b` |
| Test update | ✅ | `OrderPanel.test.tsx` updated to allow `buy_label_r1` as known label-only experiment |
| Experiment doc | ✅ | `docs/experiments/buy-label-r1.md` — decision rule: 300+ price viewers per arm, p < 0.05 |

---

## 2. v3/v4 fixture price table

Prices from unit tests. Fixture: `boxMesh` (box-shaped part, PLA standard, qty 1).

| Engine | Fulfillment | Print | Shipping | Total charged |
|---|---|---|---|---|
| v3 | pickup | 31.42 € | 0.00 € | 31.42 € |
| v3 | shipping | 31.42 € | 5.90 € | 37.32 € |
| v4 | pickup | see `checkoutBody.test.ts` | 0.00 € | varies by material/quality |
| v4 | shipping | see `checkoutBody.test.ts` | 5.90 € | varies by material/quality |

v4 prices are computed by `computeBundleV3` with the `CHECKOUT-V4` ESTIMATOR block.
The exact amounts depend on the part's volume, material, and quality setting.
Run `npm test -- checkoutBody` to see the fixture values for the current engine parameters.

**v4 live in production?** Not confirmed at branch cut. Section 8 of the GOAL was
conditional on v4 being live; it was not executed.

---

## 3. Why exit_reason was not recording

The `ExitReasonCard` from before this build had three shortcut buttons ("Volver al
precio", "Enviarme este presupuesto por email", "Preguntar por WhatsApp"). Each shortcut
called `markExitSurveyShown()` **before** the user tapped a reason chip. Once the shown
flag was set, the card would not re-appear on subsequent visits. Users who tapped a
shortcut never reached the chip phase, so no `exit_reason` event fired.

Additionally, two bugs prevented the survey from ever appearing in production:
1. `modalOpenTimeRef.current` was never set for programmatic dialog opens (file-upload
   path), because Radix Dialog does not fire `onOpenChange(true)` for controlled `open`
   prop changes. The 5-second gate therefore never evaluated. Fixed by seeding the ref
   in the `mobileModalOpen` useEffect.
2. The early `return` in the survey-trigger path skipped `setMobileModalOpen(false)`,
   leaving the checkout dialog open and blocking clicks on the ExitReasonCard chips.
   Fixed by calling `setMobileModalOpen(false)` before the return.

The new design removes the shortcut buttons. The shown flag is only set when a chip is
tapped. The code-offer phase is the natural follow-up after any chip selection.

---

## 4. Things not verified

- **v4 live in production** — section 8 (switch buy button to v4 on v4-live probe) was not
  executed because the production smoke test was not run. Run `npx playwright test e2e/prod-verify.spec.ts`
  against production to check if `pricing_version_resolved` with `version:4` appears.
- **`issue-promo-code` Edge Function** — the function is called from `ExitReasonCard` and
  the student-code flow, but the function body itself was not part of this GOAL file.
  Verify it exists and is deployed in Lovable.
- **`save-quote` Edge Function** — called fire-and-forget from `ExitReasonCard.handleCodeSubmit`.
  Verify it exists in Lovable before shipping.
- **Stripe `checkout.session.expired` webhook registration** — must be manually added in
  the Stripe Dashboard under the webhook endpoint's subscribed events.
- **`consent_collection[promotions]=auto` in production** — Stripe Checkout displays an
  SMS/email opt-in checkbox when this is set. Confirm the owner's Stripe account supports
  it; if not, the `createStripeSession` helper will silently retry without it (logged once).

---

## 5. Code-contradicted decisions

| Decision in GOAL | What the code showed | Resolution |
|---|---|---|
| ExitReasonCard fires `exit_reason` on any chip tap | The old shortcuts (`markExitSurveyShown` without an event) were why exit_reason never fired | Rewrote card; shortcuts removed |
| Viewer sizing 5.1 | Pre-existing CSS used `max-lg:h-[220px]`; GOAL specified `max-lg:h-[130px]` | Used GOAL value (130px) |
| `buy_label_r1` OrderPanel test | Existing test expected 0 enabled checkout_modal experiments | Updated test to allowlist label-only experiments by ID |

---

## 6. Test results

| Suite | Result |
|---|---|
| `npm run build` (typecheck + pre-build checks) | ✅ 0 errors |
| `npm test -- --run` (640 unit tests) | ✅ 639 pass, 1 fail (pre-existing flaky pickup-phone test, 1/640) |
| Playwright `exit-reason-card.spec.ts` (6 tests × 3 browsers) | ✅ 6/6 pass |
| Playwright `section1-bugs.spec.ts` | ✅ all pass |
| Playwright `instant-checkout-redirect.spec.ts` | ❌ pre-existing (requires live Stripe API) |
| Playwright `consent.spec.ts mobile-webkit` | ❌ pre-existing (WebKit-specific timing) |
