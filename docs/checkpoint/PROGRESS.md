# Checkpoint progress — 2026-11-25

Autonomous run of `docs/checkpoint/MASTER_PROMPT.md`. Status is driven by `CHECKLIST.json`; this file
records evidence, blockers and real-world state so a fresh context (after compaction) can resume.

## Legend
- ✔ done (status in CHECKLIST.json is "done")
- … in-progress (partial work landed; see notes)
- ✘ blocker (see BLOCKERS.md)

## Phase H — Hotfix on `main`

- ✔ H0 — Oracle `src/__checkpoint__/legacy/deployedServer.ts` extracted from commit 0aebcd6 (pure
  parts only). `.gitignore` extended for `test-fixtures/checkpoint/{generated,private}`. Installed
  `@vitest/coverage-v8@^2.1.9` matching vitest.
- … H1 — pending: `src/__checkpoint__/compat-legacy-server.test.ts` + `e2e/checkpoint/hotfix.spec.ts`
  + legacy-mode UI shim in `OrderPanel.tsx`.
- … H2 — pending: `hotfix-oversize.test.ts` + oversize gate in estimator UI.
- … H3 — pending: repair floor in `src/lib/meshRepair.ts` and `hotfix-repair-floor.test.ts`.
- … H4 — pending: server-parity guard before Buy + `hotfix-server-parity.test.ts`.
- … H5 — pending: friendly error panel + `checkout_failed` properties.
- … H6 — pending: `src/config/pageGroups.ts` + remove street addresses.
- … H7 — pending: label fixes (printable badge, grams, urgent).
- … H8 — pending: admin fixes (customer data, total paid, sign-on-click).
- … H9 — pending: `docs/checkpoint/LIVE_HOTFIX.md` after prod smoke.

## Phase D..R — not started

Phases D, P, S, F, U, O, E, A, T, Q, R are scheduled on branch `checkpoint/2026-11-25` per D-16.
See `docs/checkpoint/CHECKLIST.json` for per-item status.

## Running notes

- Repo was clean on `main` at commit `a4ef48a` (kickoff files) when this run started.
- The deployed edge functions remain at commit `0aebcd6` (Lovable has not deployed Prompts 1–3; see
  AUDIT §A). Nothing in this checkpoint has reached the server yet.
- vitest 2.1.9 ships with `@vitest/coverage-v8`; `npm install` added 34 vulnerability warnings
  which are unrelated to coverage.
