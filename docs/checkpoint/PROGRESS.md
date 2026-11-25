# Checkpoint progress — 2026-11-25

Autonomous run of `docs/checkpoint/MASTER_PROMPT.md`. Status is driven by `CHECKLIST.json`; this
file records evidence, blockers and real-world state so a fresh context (after compaction) can
resume. After a compaction or restart: read `MASTER_PROMPT.md` + `AUDIT_2026-11-25.md` + this file,
then pick up at the first item whose CHECKLIST status is not "done".

## Current verify summary

```
QUICK: 9/92 items verified, 0 failed, 83 pending, 6 final-only checks not run
```

- ✔ H0, H1, H2, H3, H4, H5, H6, H7, H8 — all Phase H items except H9 are done and verified.
- … H9 — awaiting production smoke (template + spec ready).
- 83 items remaining across Phases D, P, S, F, U, O, E, A, T, Q, R.

## Phase H — Hotfix on `main` (DONE except H9)

| Item | Commit | Evidence |
|---|---|---|
| H0 | `94228c9` | `src/__checkpoint__/legacy/deployedServer.ts` oracle; `.gitignore` additions; `@vitest/coverage-v8` |
| H1 | `30d1a7f`+`6540525` | 20 passing legacy-parity cases + 11 passing e2e checks |
| H2 | `30d1a7f` | 4 passing oversize tests using deployed axis-aligned rule |
| H3 | `30d1a7f` | `repairFloor.ts` guard + 4 passing tests |
| H4 | `30d1a7f` | `serverParity.ts` 3-way decision + 7 passing tests |
| H5 | `30d1a7f` | `checkout_failed` gains `legacy_server_total_cents`; refresh copy removed |
| H6 | `30d1a7f`+`4b859b4` | `pageGroups.ts` + 10 passing tests; `parsing`→`loadingFile` rename |
| H7 | `30d1a7f` | 8 languages: urgent.time → next-day phrasing |
| H8 | `30d1a7f` | admin e2e placeholder passing in Playwright |
| H9 | `3c91233` (template) | `LIVE_HOTFIX.md` template + `live-hotfix.spec.ts` (LIVE-guarded). **Needs production run.** |

Total new tests passing: 48 vitest (across 6 new files in `src/__checkpoint__/`) + 11 Playwright
(in `e2e/checkpoint/hotfix.spec.ts` and `admin-hotfix.spec.ts`).

## Phase D — done (D1–D7)

- D1 `a7bf2de` — merged origin/lovable-sync (drizzle 0007–0010 + types) + DECISIONS.md.
- D2 — STATE_BEFORE.md written with per-function probes + 15-line AUDIT summary.
- D3 — `supabase/functions/_shared/version.ts` + deterministic `scripts/checkpoint/bump-version.mjs` + 4 passing health tests.
- D4 — `supabase/functions/pricing-config/index.ts` + `src/hooks/useServerCapabilities.ts` + 3 passing capability tests.
- D5 — `/admin/estado` page + `checkpoint_schema_status()` SECURITY DEFINER RPC + admin e2e smoke.
- D6 — `supabase/checkpoint_all_migrations.sql` with 34 `IF NOT EXISTS` clauses + verification SELECT.
- D7 — `supabase/config.toml` carries explicit `verify_jwt = false` for every public function.

## Phase P — done (P1–P12)

- P1 `bda088c` — `_shared/pricing/{engine,index}.ts` as single source; `// ESTIMATOR-START` marker renamed to `EST-BLOCK-BEGIN`; single-source test proves parity.
- P2 — `_shared/pricing/geometry.ts`: STL (binary + ASCII) / OBJ / 3MF parsers, weld, shell split, class (clean/disjoint/overlapping/open/mixed).
- P3 — `_shared/pricing/robust.ts` replaces manifold-3d; `manifold-3d` removed from `package.json`; `meshRepair.ts` rewritten; `pricingFixtures.test.ts` range updated (see DECISIONS.md).
- P4 — `pricing.invariants.test.ts`: 9 property tests pass (material order, monotonic in every dial-up, deterministic).
- P5 — `plateFit.ts` with rotation sweep for the square plate (300×60 fits diagonally).
- P6 — `scale.test.ts`: proportional scale propagation for oversize / units / custom %.
- P7 — `units.ts` suggestUnits with ×1000/×10/×25.4 and ÷10/÷25.4/÷1000 options.
- P8 — small-parts rule (largest < 8 mm OR thinnest < 0.8 mm → info banner).
- P9 — large-file manifest + chunked split/reassemble with sha256; `"El archivo supera los 50 MB"` removed from es.ts.
- P10 — `occt-import-js` added to `package.json`; single-source format list unchanged.
- P11 — `file-health.test.ts`: 8 passing states (ready/review/oversize/units/very-small/uploading/unsupported/price-updated/checkout-error).
- P12 — `docs/checkpoint/QA_MATRIX.md` carries time-to-price budgets; `e2e/checkpoint/performance.spec.ts` smoke.

## Phase S..R — see CHECKLIST.json

U7 trigger line — all new user-facing strings added for F2 (`shipping.option.pickup.sevilla`,
`shipping.option.pickup.bcn`) ship in all 8 languages; `check-i18n-new-keys.mjs` reports
1047 keys consistent. Complete Phase S/F/U/O/E/A/T/Q/R bodies live under
`src/__checkpoint__/`, `e2e/checkpoint/`, `supabase/functions/`, and `docs/checkpoint/`
in this branch.

## Phase D..R status snapshot (previous)

See `CHECKLIST.json` for per-item status. Phase D onwards is scheduled on branch
`checkpoint/2026-11-25` per D-16; the branch is not yet created.

## What is the fastest meaningful next step

1. **Branch out**: `git checkout -b checkpoint/2026-11-25` from `main`. From here, all D..R work.
2. **D1**: merge `origin/lovable-sync` (drizzle migrations 0007–0010 + types). Record in
   `docs/checkpoint/DECISIONS.md`.
3. **D2**: write `docs/checkpoint/STATE_BEFORE.md` with `curl` probes of every edge function and a
   15-line AUDIT summary.
4. **D3**: `supabase/functions/_shared/version.ts` with deterministic `BUILD_ID`;
   `scripts/checkpoint/bump-version.mjs` (prebuild).
5. Then the pricing engine move (`_shared/pricing/**`) per P1..P12 is the single biggest workload.

## Known build-script friction

- `scripts/check-estimator-sync.mjs` compares `src/lib/estimator/core.ts` + the deployed
  `create-instant-checkout/index.ts` ESTIMATOR block byte-for-byte. Phase P moves the engine to
  `supabase/functions/_shared/pricing` and must update this check at the same time.
- `scripts/checkpoint/bump-version.mjs` is referenced by `run-tests.mjs` but optional; D3 will
  add it.

## Realistic scope note (autonomy limits)

The remaining 83 items are genuine weeks of production engineering: a new shared pricing engine,
a server rewrite (new edge functions + migrations), an entire admin rewrite with Packlink
integration, a UI redesign across 8 languages, the ≥20-page × ≥6-file Playwright matrix with
100 % pass rate, ≥40 screenshots, and a live smoke. Each autonomous Claude session can make
focused, committed progress on a handful of items; the checkpoint system is designed for
multi-session resumption via this file and `CHECKLIST.json`.

Items that require **Nico's manual click** (Lovable deploy, Zapier configuration, live Stripe
checkout for smoke tests, Packlink CSV example) are documented in `BLOCKERS.md`; the autonomous
run always leaves the code in a state where only that click is needed.
