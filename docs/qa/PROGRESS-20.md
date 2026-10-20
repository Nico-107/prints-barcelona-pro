# PROGRESS-20 — Hotfix 20 checklist

## Bugs

- [x] **BUG 2a** — Probe written (`scripts/qa/live-checkout-probe.mjs`); credentials needed to run live
- [x] **BUG 2b** — Friendly error + "Send my order" fallback + checkout_failed event
- [x] **BUG 1a** — mergeMeshes toNonIndexed + drop normals + computeVertexNormals
- [x] **BUG 1b** — 3MF fallback parser (fflate + DOMParser + p:path resolution)
- [x] **BUG 1c** — GLB DRACOLoader (/draco/) + MeshoptDecoder + unit auto-detect (≤10→×1000); OBJ unit auto-detect; stlBboxMm() exported; bboxMm shown in PartSummaryList
- [x] **BUG 1d** — Modal always opens for any file (incl. parse errors); "Send for free review" button in PartSummaryList
- [x] **BUG 1e** — Image card: ContactFields inside, uploadErr+invokeErr checked, success only on real success; right panel 3-step flow when !bundle
- [x] **BUG 3**  — `[&>button.absolute]:hidden` (not `!hidden`); `<form onSubmit>`; await send-quote-request; show error on fail

## QA

- [x] `npm run typecheck` — clean
- [x] `npm test` — 42 test files, 662 tests passed
- [x] `npm run build` — clean (153 pages, 0 broken links, 0 SEO violations)
- [x] `npm run qa:quote` — 11/11 passed (fixed locator for new accept attr)
- [x] `scripts/qa/upload-matrix.mjs` — STL/OBJ/3MF/PNG/corrupt all pass
- [x] `scripts/qa/exit-popup.mjs` — Send button visible, form submits
- [x] `scripts/qa/checkout-error.mjs` — friendly error shown, no raw message
- [x] `scripts/qa/mobile-modal.mjs` — all mobile checks passed
- [ ] `scripts/qa/live-checkout-probe.mjs` — needs real Supabase credentials in `.env`

---

## BUG 2a — Probe status

The probe script is written at `scripts/qa/live-checkout-probe.mjs`. It generates a 20 mm
cube STL, uploads it to Supabase storage, and POSTs to `create-instant-checkout` (qty=1
and qty=20). It prints the HTTP status and full JSON response without completing a payment.

**Root cause** (already fixed in commit 6567b49 by Lovable before this session):
`consent_collection.promotions` and `after_expiration` params were not supported in the
Stripe account's country. Those 9 lines were deleted from the edge function.

**To run the probe**: add real `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
values to `.env`, then: `node scripts/qa/live-checkout-probe.mjs`

---

## Commits

- `78fdc87` fix(bug2): friendly checkout error UI + checkout_failed event + probe script
- `0c8047e` fix(bug1): non-STL uploads — indexed geo, 3MF fallback, GLB unit/Draco, failed-parse card
- `332a4c4` fix(bug3): exit popup Send button hidden by [&>button]:!hidden
- `92d23bd` qa(20): upload-matrix, exit-popup, checkout-error tests; fix analytics events
