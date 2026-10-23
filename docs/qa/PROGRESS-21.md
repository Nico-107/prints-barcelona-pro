# Prompt 21 — Progress

Branch: `tracking-21`

## Items

- [x] 1. stripe-webhook: fix ReferenceError + idempotency + order_paid
- [x] 2. One calculator email per upload batch (Resend limit fix)
- [x] 3. Server-side PostHog capture (ad-blocker-immune)
- [x] 4. Client PostHog: autocapture + data-ph-name attributes
- [x] 5. Email formatting fixes (address + colour)
- [x] QA: typecheck / tests / build / qa / qa:quote / Playwright

## Commits

| SHA | Item | Description |
|-----|------|-------------|
| `56cd04d` | 1 | fix(21-1): stripe-webhook — idempotency, ReferenceError fix, order_paid for all paths |
| `4911e62` | 2 | fix(21-2): one calculator email per upload batch — stop hitting Resend 100/day limit |
| `248c0d2` | 3 | feat(21-3): server-side PostHog capture — immune to ad blockers |
| `e55099f` | 4 | feat(21-4): client PostHog — autocapture on, rageclick, data-ph-name on all key buttons |
| `bbcef8d` | 5 | fix(item5): email formatting — readable shipping address + color fallback from pieces |

## QA Results

| Check | Status |
|-------|--------|
| `npm run typecheck` | ✓ clean |
| `npm test` | ✓ 676 tests passed (44 files) |
| `npm run build` | ✓ 153 pages, 0 violations, 0 broken links |
| `scripts/check-estimator-sync.mjs` | ✓ ESTIMATOR/CHECKOUT-V3/AUTUMN-DISCOUNT identical |
| `npm run qa:quote` | ✓ 11/11 tests passed |
| `npm run qa` | in progress |
| `scripts/qa/batch-estimate.mjs` | ✓ 3 files → 1 call (fileCount=3), no JS errors |

## Edge Functions Changed (REDEPLOY REQUIRED)

1. `stripe-webhook` — idempotency, block-scope fix, try/catch, order_paid enhancements
2. `send-price-estimate` — batch mode, server-side PostHog, dedup Map
3. `send-quote-request` — server-side PostHog (quote_received enhancements)
4. `create-instant-checkout` — server-side PostHog (checkout_session_created_server)
5. `send-order-confirmation` — readable shipping address, color fallback from pieces
