# Blockers — items that need Nico or a long non-local step

This file lists items where the autonomous run can prepare code, docs or fixtures up to the point
where only Nico's click (or a long external step like a Vercel deploy or a browser suite over
dozens of pages) is needed. For each entry: what is prepared, and what is the manual step.

## Lovable deploy (every edge-function change in Phase D..S..E)
Lovable has been stuck at ~18 Nov (see AUDIT §A). Every new / updated function under
`supabase/functions/` is deployed by Nico using `docs/checkpoint/LOVABLE_DEPLOY.md` (R2). Items D3,
D4, D5, S1..S9, E1..E6 and O1..O3, O7..O9, O12..O14 are all gated on this. The autonomous run keeps
edge-function source in the repo at every step so one Lovable deploy ships everything together.

## Live production smoke (H9, Q7, R6)
Live Playwright tests need a successful Vercel deploy. The run leaves `e2e/checkpoint/*.spec.ts`
and the `LIVE=1`-guarded specs in place. Nico runs them after a deploy by executing
`LIVE=1 npx playwright test e2e/checkpoint/live-hotfix.spec.ts` (and for Q7, `npm run smoke:live`).

## Packlink CSV example (O8)
`src/config/packlinkCsv.ts` + the test expect a tracked example at
`docs/checkpoint/inputs/packlink-example.csv`. Nico downloads it from Packlink PRO (Nuevo envío ▾
→ Importar CSV → descargar ejemplo) once; the autonomous run already generates headers matching
the generic documented format until that file lands.

## Zapier Packlink wiring (O9, R4)
Two Zaps need Nico's Zapier account: Catch Hook → Packlink PRO Create Shipment Draft, and
Packlink PRO Shipment Status Updated → Webhook POST to the `packlink-status-hook`.
`docs/checkpoint/ZAPIER_PACKLINK_SETUP.md` captures the exact mappings; secret is stored in the
admin settings table once Lovable deploys.

## Real customer file fixtures (P3 `08_maqueta_like...` real variant, P10 Bambu 3MF)
The repo is PUBLIC, so only synthetic fixtures ship in `test-fixtures/checkpoint/`. Real customer
files for sharper expectations go in `test-fixtures/checkpoint/private/` (gitignored); autoRUN picks
them up when present.

## Admin `admin-stripe-sync` backfill (O7)
After the Lovable deploy, Nico presses "Sincronizar con Stripe" once in `/admin` to fill customer
fields on orders #250+. The autonomous run writes the function and the button; the backfill itself
needs a live run with STRIPE_SECRET_KEY.

## Business inbox check (recipients.ts verification)
Owner emails (D-8) go to `011107miko@gmail.com` + `dimension3dprintsbcn@gmail.com` (+ Daniel on
Sevilla). Nico confirms the business inbox is being read once Lovable deploys; nothing to do in
code.

## Long browser matrix (Q3 — ≥ 20 pages × ≥ 6 files × 4 projects)
The matrix spec is left in `e2e/checkpoint/matrix.spec.ts`. On a developer laptop this run can
take 30-90 minutes. `run-tests.mjs full` executes it; QA_MATRIX.md is regenerated from the JSON
report. Nothing manual.

## Screenshots (Q6 — ≥ 40 PNGs)
Captured by `e2e/checkpoint/screenshots.spec.ts` as part of the `full` playwright run. If the run
machine cannot render a given project (missing WebKit on headless Linux), that project skips with
a reason in `docs/checkpoint/DECISIONS.md`.
