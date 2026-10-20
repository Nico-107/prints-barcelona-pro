# PROGRESS-20 — Hotfix 20 checklist

## Bugs

- [ ] **BUG 2a** — Probe result documented (live-checkout-probe.mjs)
- [ ] **BUG 2b** — Friendly error + "Send my order" fallback + checkout_failed event
- [ ] **BUG 1a** — mergeMeshes index fix (fileConverters.ts)
- [ ] **BUG 1b** — 3MF fallback parser (Bambu/Orca/Prusa)
- [ ] **BUG 1c** — GLB Draco/Meshopt + unit auto-detect; OBJ index fix
- [ ] **BUG 1d** — Modal always opens; failed-parse card
- [ ] **BUG 1e** — Image/PDF card: ContactFields inside, error handling, 3-step panel
- [ ] **BUG 3**  — Exit popup Send button visible; Enter submits; await send-quote-request

## QA

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run qa`
- [ ] `npm run qa:quote`
- [ ] `scripts/qa/upload-matrix.mjs`
- [ ] `scripts/qa/exit-popup-test.mjs`
- [ ] `scripts/qa/checkout-error-test.mjs`
- [ ] `scripts/qa/mobile-modal.mjs`
- [ ] `scripts/qa/live-checkout-probe.mjs` (final run)

---

## BUG 2a — Probe result

*(filled in after running scripts/qa/live-checkout-probe.mjs)*
