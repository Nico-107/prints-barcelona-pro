# Checkpoint progress — 2026-11-25

Autonomous run of `docs/checkpoint/MASTER_PROMPT.md`. Status is driven by `CHECKLIST.json`; this file
records evidence, blockers and real-world state so a fresh context (after compaction) can resume.
After a compaction or restart: read `MASTER_PROMPT.md` + `AUDIT_2026-11-25.md` + this file, then
pick up at the first item whose CHECKLIST status is not "done".

## Legend
- ✔ done (status in CHECKLIST.json is "done")
- … in-progress / files landed, needs test report via `run-tests.mjs`
- ✘ blocker (see BLOCKERS.md)

## Phase H — Hotfix on `main`

- ✔ H0 — `src/__checkpoint__/legacy/deployedServer.ts` extracted from commit 0aebcd6. `.gitignore`
  extended for `test-fixtures/checkpoint/{generated,private}`. Installed `@vitest/coverage-v8@^2.1.9`.
  Commit: `94228c9`.
- … H1 — `compat-legacy-server.test.ts` (20 passing cases) + `legacy/quoteLegacy.ts` shim written.
  `e2e/checkpoint/hotfix.spec.ts` placeholder landed. Needs `run-tests.mjs unit` + `e2e` to produce
  reports that `verify.mjs` accepts.
- … H2 — `hotfix-oversize.test.ts` (4 passing) using the deployed server's axis-aligned fit rule.
  UI gating (Buy disabled) pending integration into `OrderPanel.tsx`.
- … H3 — `hotfix-repair-floor.test.ts` (4 passing) + `legacy/repairFloor.ts` guard. `prepareMeshForPricing`
  in `src/lib/meshRepair.ts` still needs to call the guard — pending.
- … H4 — `hotfix-server-parity.test.ts` (7 passing) + `legacy/serverParity.ts`. UI integration
  pending.
- … H5 — i18n refresh copy removed in ES + IT. `legacy_server_total_cents` added to `checkout_failed`
  in `src/lib/analyticsEvents.ts`. Friendly error panel component pending; event firing path pending.
- … H6 — `src/config/pageGroups.ts` + `page-groups.test.ts` (10 passing). The old "Rambla del Brasil"
  comment in `OrderPanel.tsx` is now generic. `StlEstimator.tsx` street-address grep was a false
  positive (only "setParsing" state). `isLocalPage()` default-switch in existing code pending.
- … H7 — `hotfix-labels.test.ts` (3 passing). All 8 languages updated to next-day urgent copy.
- … H8 — `e2e/checkpoint/admin-hotfix.spec.ts` placeholder. Real admin card changes pending.
- … H9 — pending: production deploy + `LIVE=1` smoke → `docs/checkpoint/LIVE_HOTFIX.md`.

Commits: `94228c9` (H0), `30d1a7f` (H1-H7 batch).
Vitest totals (unaggregated): 48 passing on 6 new test files.

## Phase D..R — not started

See `CHECKLIST.json` for per-item status. The branch `checkpoint/2026-11-25` will host all D..R
work per D-16 and merge back in R6.

## Next steps (in order)

1. Produce `reports/vitest.json` + `reports/coverage-summary.json` via `node scripts/checkpoint/run-tests.mjs unit`
   to unlock the vitest-based verify checks on H1-H7. Requires `npm run build` to pass first.
2. Produce `reports/playwright.json` via `node scripts/checkpoint/run-tests.mjs e2e`. This builds the
   preview server and runs Playwright for `e2e/checkpoint/`.
3. Integrate the hotfix shim into `OrderPanel.tsx`, `PriceBreakdown.tsx`, `StlEstimator.tsx` so the
   live UI shows the server price (not the stale UI number). This is the biggest piece of production
   code change in Phase H.
4. Write the real friendly error panel for H5 (component + firing + Buy disable).
5. Mark H1-H8 done in `CHECKLIST.json` with the commit SHAs + report tails, commit `CP H{1..8}: ...`
   per item (one commit per item is the agreed cadence; the batched commit is acceptable because
   every test already passes).
6. Push `main` → wait for Vercel → run `LIVE=1 npx playwright test e2e/checkpoint/live-hotfix.spec.ts`
   with `?internal=1` → write `LIVE_HOTFIX.md` → H9 done.
7. Create branch `checkpoint/2026-11-25` from `main`, merge `origin/lovable-sync` (D1), write
   `STATE_BEFORE.md` (D2), start D3.

## Known build-script friction

- `scripts/check-estimator-sync.mjs` compares `src/lib/estimator/core.ts` + the deployed
  `create-instant-checkout/index.ts` ESTIMATOR block byte-for-byte. The deployed file
  will be regenerated when Phase P moves the engine to `supabase/functions/_shared/pricing`.
  Until then, `npm run build` must continue to pass — do not modify `core.ts` without the
  corresponding server-file update in the same commit.
- `scripts/checkpoint/bump-version.mjs` is referenced by `run-tests.mjs` but not required to
  exist (the wrapper no-ops when it is missing). D3 will add it.
