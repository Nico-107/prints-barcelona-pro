# Dimension3D — Checkpoint build (MASTER PROMPT)

Version 1 · 25 Nov 2026 · for Claude Code (Opus), run with `--dangerously-skip-permissions` under `/goal`.

This file is self-contained. Nico will clear your context before starting, so everything you need
is here and in `docs/checkpoint/AUDIT_2026-11-25.md` (evidence: what is broken, with numbers).
**Read the AUDIT first, completely, then this file, completely, before touching code.**

The machine-readable list of work is `docs/checkpoint/CHECKLIST.json`. Every item there has an ID that
matches a heading in this file and one or more automatic checks. `node scripts/checkpoint/verify.mjs`
evaluates them; test reports only count when `node scripts/checkpoint/run-tests.mjs` produced them for
the current code (§0.5). A Stop hook (`.claude/settings.json` → `scripts/checkpoint/stop-hook.mjs`) will
not let you end your turn while `docs/checkpoint/ACTIVE` exists and items are pending or failing, and the
`/goal` condition (`docs/checkpoint/GOAL.txt`) lists the final proof Nico expects (§12 R6).

---

## §0 How to work during this run

### 0.1 Mission

Get dimension3dprints.com to one stable, correct, professional checkpoint:
- every visitor who wants to pay can pay, on every page, with every reasonable file;
- the price shown is the price charged, to the cent, everywhere;
- Nico learns about every order, every blocked sale and every quote immediately, and has all the
  data (customer, address, files, payment) in one admin;
- shipping with Packlink takes him one click;
- the server half of every change actually exists in the repo and can be deployed in one step.

### 0.2 Autonomy rules (important)

1. **Do not ask Nico anything during the run.** He is not watching. When a choice is needed, use §0.4
   (decisions already made). If something truly new comes up, choose the option that (a) never charges
   a customer more than the price shown, (b) never blocks a purchase, (c) is reversible, and write it to
   `docs/checkpoint/DECISIONS.md` (date, item ID, options, choice, reason). Then continue.
2. **Never stop for intermediate confirmation.** No "should I continue?", no summaries mid-way.
3. **Never skip an item.** If blocked, write the blocker to `docs/checkpoint/BLOCKERS.md` with what
   you tried, move to the next item, and come back. A blocker that needs Nico (Lovable deploy,
   Zapier login, Packlink CSV example) is never a reason to leave code undone: build everything up to
   the point where only his click remains, and make the verify check pass on the prepared artifact.
4. **Never weaken a test or a check.** Do not delete or loosen existing tests, `CHECKLIST.json`
   checks, or the checkpoint tooling (`scripts/checkpoint/{verify,fingerprint,run-tests,stop-hook,install-hook}.mjs`).
   You MAY add items/checks. If a tooling script crashes on this machine, fix only the crash, keep every
   check as strict, and record it in DECISIONS.md (the final proof shows that diff). If an existing test encodes
   behaviour this checkpoint deliberately changes, update that test and record why in DECISIONS.md.
   `verify.mjs` compares every original item's checks against `docs/checkpoint/CHECKLIST.lock.json`;
   tampering fails the run.
5. **Proof, not claims.** After each item: run its tests (reports via `run-tests.mjs`, §0.5), then set its `status` to `"done"` in
   CHECKLIST.json, add `evidence` (commit SHA + the command + its raw last lines), and append the same
   to `docs/checkpoint/PROGRESS.md`. Never mark done without running the check.
6. **Small commits, pushed often.** Commit per item: `CP <ID>: <what>`. Push after every phase.
7. **Use subagents for parallel, independent work** if useful (e.g. translations, screenshots,
   crawl fixes). You own the result: verify their output before marking anything done.
8. **Context management.** The run is long. Keep `PROGRESS.md` and the `status` fields current so that
   after any compaction or restart you can resume by reading CHECKLIST.json + PROGRESS.md. If the
   session restarts, the same `/goal` resumes from the first non-done item.
9. **Time is not a constraint.** If an item takes three hours, it takes three hours. Quality and
   correctness over speed. No placeholder implementations, no TODO stubs counted as done.
10. **Never answer the Stop hook or the goal check with text only.** While a long suite runs in the
   background, work on the next independent item or poll its log with a tool call. Several turns in a
   row without a tool call stop the loop, and Nico may not be there to restart it.
11. **Finishing** means the exact sequence in §12 R6 and the raw proof listed in `docs/checkpoint/GOAL.txt`.

### 0.3 Ground rules (updated for this checkpoint)

- Repo: `~/Projects/prints-barcelona-pro`. Vite + React + TS + Tailwind + shadcn, prerendered SSR,
  8 languages (es, ca, en, de, fr, it, nl, pt), Supabase (Lovable Cloud, project `ssdbkzswqpbgpeirackr`),
  Stripe, Resend, PostHog EU (project 208342), Vercel.
- **CHANGED RULE: edge functions ARE edited in this repo from now on** (`supabase/functions/**`).
  Lovable only deploys them verbatim and applies the SQL. The old "write LOVABLE_TODO instead" rule
  caused the current breakage (see AUDIT §A). Keep all business logic in pure TypeScript files under
  `supabase/functions/_shared/**` (no Deno APIs, no URL imports) so Node/Vitest can import and test the
  exact code the server runs; each function's `index.ts` stays a thin Deno wrapper.
- Never use `routes` in `vercel.json` (only `rewrites`/`redirects`/`headers`). Never proxy PostHog.
- `pathLanguage()` (LanguageContext.tsx) and `urlLanguage()` (entry-server.tsx) must stay mirror
  images; never call `setLanguage` in a hydration `useEffect`.
- Every new user-facing string goes into all 8 languages with a real translation; after adding, print
  the actual values per language into PROGRESS.md (not just keys).
- The Buy button stays the main, most visible element of the price window.
- Prices end in ,90. Minimum order 9,90 €. No setup fee. DIMENSION11 (−10 %) valid until 30 Nov 2026.
- Do not change the price *levels* (rates, multipliers, minimum). You fix *correctness* (geometry,
  rounding, consistency), not tariffs.
- Public inserts use the `supabaseAnon` client; any new public-insert table also needs
  `GRANT INSERT ... TO anon` plus RLS.
- Admin queries must not break when a new column is not yet migrated: use `select("*")` and treat
  missing fields as `undefined`, and show "pendiente de migración" in the admin status page.
- **Printrack is out of scope.** Do not integrate, import, or modify anything Printrack-related.
- **Cybersecurity is the NEXT prompt.** Do not start a security overhaul. Do not add secrets to the
  frontend. Write anything you notice to `docs/checkpoint/SECURITY_BACKLOG.md`.
- **The repo is PUBLIC.** Commits, screenshots, reports, fixtures and docs contain only synthetic data:
  no real customer names, emails, phone numbers, addresses, order contents or files, and no session or
  checkout URLs. Live checks record order numbers only. Admin test data and screenshots use invented
  customers.
- Earlier instructions in the repo (`AGENTS.md`, `LOVABLE_TODO.md`, old prompt files, any `CLAUDE.md`)
  that say not to edit `supabase/functions` or to write LOVABLE_TODO entries instead are superseded by
  this file. Update `AGENTS.md` with rule D-1 and fold `LOVABLE_TODO.md` into `LOVABLE_DEPLOY.md` (R2),
  leaving a one-line pointer.
- While `docs/checkpoint/ACTIVE` exists, the Stop hook keeps every Claude Code session in this repo
  working on the checkpoint; R6 removes the file at the very end.
- `npm run build` must pass before every push (it runs typecheck, prerender and the SEO/link checks).

### 0.4 Decisions already made (do not ask; apply)

| ID | Decision |
|---|---|
| D-1 | Edge functions live and change in the repo (see 0.3). One Lovable deploy at the end ships them. |
| D-2 | Shipping (v5): €4,90; free from €30 parts subtotal after discounts; non-local pages: price includes delivery = `min(charm(parts + 4,90), 30,90)` below €30; local pages run A/B `shipping_r1` (A delivered, B upfront "+4,90 €"). **Only active when the server reports v5 (§D4).** Until then the site runs in **legacy mode** that mirrors the server that is deployed today (€5,90 when the discounted parts subtotal is below €100, else €0) so Buy always equals Stripe. |
| D-3 | Pickup is offered only on: `/`, `/ca/` (and any homepage variant), every path whose slug contains `barcelona` (any language), `/impresion-3d-cerca-de-mi`, `/sobre-nosotros`, `/about` → pickup in **Barcelona (Les Corts)**; `/impresion-3d-sevilla`, `/3d-printing-sevilla` → pickup in **Sevilla**. Every other page is non-local (shipping only). One list in `src/config/pageGroups.ts`. |
| D-4 | Lead times come only from `src/lib/shipDate.ts` (`PRODUCTION_DAYS` standard 3, express 2, urgent 1 working days; 14:00 cutoff). All copy is generated from it. Marketing lines become "Lista en 1–3 días laborables · urgente: al día siguiente" (translated); the urgent tier is "Al día siguiente", never "Mismo día". |
| D-5 | Remove the orientation and supports settings from the UI. The engine always uses `orientation: 'auto'` and `supports: true` (auto supports). Server keeps accepting the old fields. |
| D-6 | No contact fields (email/phone/name) on the Buy path; Stripe collects them. Contact fields stay only on review/quote forms. |
| D-7 | €9,90 entry price stays (see AUDIT §H). No price-level changes in this checkpoint. |
| D-8 | Owner emails go to `011107miko@gmail.com` AND `dimension3dprintsbcn@gmail.com`; Sevilla orders/leads also to `3d.kayda@gmail.com`. One constant: `supabase/functions/_shared/recipients.ts`. |
| D-9 | Trust facts: about 300 orders ("~300 pedidos"), Google: 25 reviews, 24 of them 5★, rating 4,8. `GOOGLE_PROFILE_URL = null` (links hidden while null). No AggregateRating/Review schema. |
| D-10 | Any STL up to 500 MB gets a price in the browser. Uploads: gzip above 5 MB; split into ≤ 45 MB parts if still larger; originals reassembled for Nico. Unpurchased uploads > 20 MB are deleted after 30 days by a scheduled cleanup. |
| D-11 | Instant Buy up to €200 order total (unchanged); above that the review path with "Te confirmo en < 1 h". |
| D-12 | Experiments: `home_proof_r1` (A/C) continues; `shipping_r1` runs only on local pages and only in v5 mode; site design locked to V1 (V2 preview `?xp_home_v2=v2` keeps working). |
| D-13 | Packlink: CSV export (no API dependency) + optional Zapier webhooks (draft creation + status updates). |
| D-14 | Messy meshes are normal (AUDIT B2: 26/27 real files). Never show alarming "errors" copy for them; show neutral "Revisamos tu archivo antes de imprimir" only when the robust path changed the analysis materially. |
| D-15 | Oversize parts: offer (1) scale to fit (buyable), (2) free review/split quote, (3) WhatsApp. Never "imprimible / cabe" when it does not fit. |
| D-16 | Work order: Phase H hotfix directly on `main` (live within the first hours). Everything else on branch `checkpoint/2026-11-25`, pushed after each phase, merged into `main` (R6) only when `node scripts/checkpoint/verify.mjs` on the branch shows every item verified except Q7 and R6 (those two need the merge); `--final` then runs on `main`. |

### 0.5 File and path conventions (verify.mjs checks these exact paths)

- Shared server+client logic: `supabase/functions/_shared/pricing/` (`engine.ts`, `geometry.ts`,
  `robust.ts`, `plateFit.ts`, `units.ts`, `shipping.ts`, `quote.ts`, `index.ts`) and
  `supabase/functions/_shared/checkout/` (`evaluate.ts`, `stripeParams.ts`, `index.ts`),
  `supabase/functions/_shared/version.ts`, `supabase/functions/_shared/recipients.ts`.
- Vite/TS alias `@pricing` → `supabase/functions/_shared/pricing`, `@checkout` → `.../_shared/checkout`.
- New unit tests: `src/__checkpoint__/*.test.ts`. New e2e: `e2e/checkpoint/*.spec.ts`.
- Test reports: produce them ONLY with `node scripts/checkpoint/run-tests.mjs <unit|e2e|full|all>` (read
  the header of that file). `unit` = vitest, all unit tests, + coverage of `_shared` → `reports/vitest.json`
  and `reports/coverage-summary.json` (first install `@vitest/coverage-v8` matching the vitest version);
  `e2e` = Playwright `e2e/checkpoint/` → `reports/playwright.json`; `full` = every spec in `e2e/` →
  `reports/playwright-full.json` (also saved as `reports/playwright.json`); `all` = unit + full.
  Each report gets `reports/<name>.fingerprint.json`, and verify.mjs ignores a report as soon as any
  source file changed after its run (content-based, see `fingerprint.mjs`). So: run the suites again
  after your last code change, and never edit code while a suite runs. Every mode rebuilds `dist/` first
  when it was not built from the current code (some existing unit tests read the prerendered pages),
  so `npm run build` must pass. Arguments after `--` that filter (file names, `-t`, `-g`, `--project`, …)
  mark a report partial: iterate with filters or with plain `npx vitest` / `npx playwright test`, then
  finish with unfiltered runs. Full suites take long: start them in the background and read the log
  file the script names. `reports/` is committed (add it to git; do not gitignore it).
- Specs that touch production or Stripe (`live-hotfix.spec.ts`, the `smoke:live` specs) must start with
  `test.skip(!process.env.LIVE, 'live only')`; `run-tests.mjs` never sets `LIVE`. Run them only for H9
  and Q7, with `LIVE=1`.
- Screenshots go only to `docs/checkpoint/screens/`. Some existing specs rewrite tracked screenshots
  (`tests/screens/`, `docs/pricing-v4-screens/`): commit those after a full run so the tree stays clean.
- No build step may rewrite a tracked file with a value that changes per commit or per run (timestamps,
  git SHAs): the final check needs a clean `git status` after `npm run build` (see D3).
- Docs written during the run: `docs/checkpoint/{STATE_BEFORE,DECISIONS,BLOCKERS,PROGRESS,PAGE_GROUPS,
  QA_MATRIX,CRAWL_REPORT,LOVABLE_DEPLOY,ZAPIER_PACKLINK_SETUP,SECURITY_BACKLOG,FINAL_REPORT}.md`,
  screenshots in `docs/checkpoint/screens/`.
- Fixtures: `test-fixtures/checkpoint/` (shipped small synthetic files — the repo is PUBLIC, so never commit a
  customer's file; real customer files go only in `test-fixtures/checkpoint/private/`, which must be gitignored) + generated big ones from
  `scripts/checkpoint/gen-fixtures.mjs` (write generated files to `test-fixtures/checkpoint/generated/`,
  gitignored).

---

## §1 Phase H — Hotfix on `main` (stop the bleeding first)

Goal: within the first hours, the live site stops losing sales, **without any server change** (the
deployed edge functions are the ~18 Nov versions; their exact code is in git at commit `0aebcd6`).

**H0 — Oracle and setup.** Add `test-fixtures/checkpoint/generated/` and `test-fixtures/checkpoint/private/`
to the root `.gitignore` (keep `reports/` tracked), install `@vitest/coverage-v8` matching the vitest
version, then save the deployed server logic as a test fixture:
`git show 0aebcd6:supabase/functions/create-instant-checkout/index.ts` and `.../checkout-policy.ts` →
copy the pure parts (EST, analyzeTriangles, priceOrder, evaluateV4, shippingChargeCents, chargeAllowed,
V3_INSTANT) into `src/__checkpoint__/legacy/deployedServer.ts` (no Deno code). All hotfix tests compare
the UI against this file. This file is the oracle for "what Stripe will charge today".

### H1 — Legacy shipping parity (Buy = Stripe today)
Until `useServerCapabilities()` (§D4) reports v5, every shipping number in the UI follows the deployed
server: shipping 5,90 € when the discounted parts subtotal is below 100,00 €, else 0; no charm rounding
on shipping; total = parts after promo + shipping. This applies to: the fulfillment toggle/cards, the
breakdown, the sticky total, the Buy label, mobile bar, non-local "envío incluido" totals, toasts.
In legacy mode `shipping_r1` is neither assigned nor tagged (show the plain upfront layout).
Note: for H1 you may implement a minimal capability probe now (no endpoint → legacy) and finish §D4 later.
- Test `src/__checkpoint__/compat-legacy-server.test.ts`: ≥ 16 cases (pickup/shipping × local/non-local
  × under/over 100 € × with/without DIMENSION11 × 1/3 parts) → UI amount === `deployedServer` charge.
- E2E `e2e/checkpoint/hotfix.spec.ts`: in the window, toggle label, breakdown total, sticky total and
  Buy label show the same amount, for home (ES), `/madrid`, `/it/stampa-3d-online`.

### H2 — Oversize gate
If the part does not fit the plate under the **deployed server's** rule (axis-aligned, any of the 6
orientations, 256×256×261 mm), Buy is disabled and the window shows the oversize state: real size, the
plate size, and three actions: "Pedir revisión gratis (te propongo dividirla o escalarla)", "WhatsApp",
and (if scale-to-fit is already implemented) "Escalar para que quepa". The green "Archivo imprimible"
badge never appears for such files.
- Tests: `08_maqueta_like_open_shell_348x272x99.stl` (synthetic copy of the student's file: open main shell 347,6 × 271,7 × 99,1 mm + a tiny closed shell) and `05_too_big_300x60x20.stl` → oversize state, no Buy (05 only under the deployed server's axis-aligned rule; after P5 it fits diagonally).

### H3 — Never price from a tiny surviving shell
In `prepareMeshForPricing`, if repair discarded open shells whose summed |signed volume| is > 5 % of the
mesh's total |signed volume|, or the repaired bbox is smaller than 90 % of the raw bbox on any axis,
discard the repair and use the raw analysis.
- Tests: `08_maqueta_like…` and `17_big_open_shell_plus_tiny_closed.stl` no longer price at 9,90 (08 ≥ 20,00 =
  its raw price 22,90 ± rounding; 17 ≥ 90,00, raw 97,90) before oversize/availability rules; all fixtures that were
  correct stay identical.

### H4 — No PRICE_MISMATCH possible against today's server
Before Buy, compute the deployed-server price for the cart (raw `analyzeTriangles` → `priceOrder v4`).
- If it equals the shown price (±2 cents): normal Buy.
- If it differs and is ≤ 1,30 × the shown price: show the server price (it is what Stripe charges) and
  Buy at that price; note "Precio ajustado a tu archivo".
- If it is > 1,30 × the shown price (messy file overpriced by the old server): no instant Buy; primary
  action "Pedir revisión gratis — te confirmo {shown price} en menos de 1 h" which submits a quote request
  with the already-uploaded files and settings, and fires the owner alert (H5).
- Tests: overlapping-shells fixture → Buy at the server price; `overpriced_stamp_22693_shells.stl` →
  review path with the robust price in the text; clean fixtures unaffected.

### H5 — No dead ends, no 26 clicks
Any checkout error (any 4xx/5xx, network error, timeout) shows a friendly localized panel:
"No hemos podido abrir el pago, pero te lo resolvemos en minutos" + [Pedir revisión gratis] (files and
config included, one click) + [WhatsApp con tu presupuesto] (prefilled with files, price, page).
The Buy button is disabled after a failure until something changes in the cart. Never show "Aggiorna la
pagina e riprova"-style messages. 429 shows "Demasiados intentos — espera un minuto" with a countdown.
`checkout_failed` gets: `code`, `http_status`, `client_total_cents`, `legacy_server_total_cents`,
`page_group`, `fulfillment`, `file_count`, `max_file_mb`, `mesh_watertight`, `mesh_shells`.
- E2E (mocked 400 PRICE_MISMATCH, 400 OVERSIZE_PART, 429, network fail) → panel visible, Buy disabled,
  review request sent once.

### H6 — Pickup corrections (frontend only)
Apply D-3 page groups now (`src/config/pageGroups.ts`; replace `isLocalPage` internals). Sevilla pages
show "Recogida gratis en Sevilla (con cita)" and send the marker `[RECOGIDA SEVILLA]` at the start of the
colour/notes text the deployed server stores, so Nico sees it. No street address in any pickup label
(Barcelona: "Recogida gratis en Barcelona (Les Corts), con cita").
- Tests: page-group unit test over all sitemap routes; e2e: Sevilla shows Sevilla pickup, Paris EN page
  shows no pickup, homepage shows Barcelona pickup; grep: no "Rambla del Brasil" / "Parsi" inside
  `src/components/estimator/**` or `src/components/StlEstimator.tsx`.

### H7 — Honest labels
- "Archivo imprimible: cabe en la impresora" only when it fits and the analysis is clean or robust-ok.
- Weight never "~0 g" (use the analysis volume; if truly unknown, hide the weight).
- Urgent tier label "Al día siguiente" (all languages), never "Mismo día".

### H8 — Admin quick fixes (frontend only)
In the current admin (`src/pages/Admin.tsx`, until §O replaces it): show customer name (if present),
email, phone and the formatted shipping address on every order card; show "Total pagado" from
`total_paid_cents` or, if null, computed from `notes` ("Shipping: EUR x.xx"), the charm/minimum and
promo; stop signing every file at load — sign one file on click (call `admin-sign-urls` with just that
path) and keep the zip button.
- E2E with mocked Supabase rows (copy the real shape of #285/#287 without personal data).

### H9 — Ship the hotfix
`npm run build` green, all existing tests green (or updated with reasons), commit, push to `main`.
Wait for Vercel (poll the live JS bundle until it contains the new build id from §D3 or a hotfix marker),
then run `e2e/checkpoint/live-hotfix.spec.ts` (with `LIVE=1`) against production with `?internal=1`: homepage, `/madrid`,
`/it/stampa-3d-online`, `/impresion-3d-sevilla`, `/3d-printing-delivery-paris` — check labels and
numbers. Allowed: at most 3 real checkout redirects in total (cube 20 mm) to read the Stripe page amount
and confirm it equals the Buy label; close the Stripe page without paying; write the created order
numbers to PROGRESS.md as TEST ORDERS so Nico can delete them. Write the results to
`docs/checkpoint/LIVE_HOTFIX.md` (page, check, expected, live value, pass/fail; no personal data), ending
with the line `RESULT: PASS` once everything matches.

---

## §2 Phase D — Deploy infrastructure (branch `checkpoint/2026-11-25` from here on)

### D1 — Merge `lovable-sync`
`git fetch origin lovable-sync` and merge it into the branch (it holds Lovable's drizzle migrations
0007–0010 and generated types). Keep main's behaviour on conflicts; keep Lovable's migrations and types.
Explain in DECISIONS.md.

### D2 — State before
Write `docs/checkpoint/STATE_BEFORE.md`: git SHAs (main, lovable-sync), every edge function with what is
deployed (probe each with `curl` — e.g. `order-files-zip?order_number=1&exp=9999999999&sig=00` returns
401 JSON on the old version), migrations present in `types.ts` vs files in `supabase/migrations`, live
bundle markers, and the AUDIT summary in 15 lines.

### D3 — Versioning & health
`supabase/functions/_shared/version.ts` exports `BUILD_ID` (`'v5-'` + the first 10 hex characters of a
sha256 over the paths and contents of every file under `supabase/functions/` except `_shared/version.ts`;
written by `scripts/checkpoint/bump-version.mjs`, which runs in `prebuild` and is also called by
`run-tests.mjs`; deterministic, and it rewrites `version.ts` only when the value changes — never a date or
a git SHA, which would leave the tree dirty after every build), `PRICING_VERSION = 5`, `CAPABILITIES`
(string array: `quote_v5`, `shipping_v5`, `price_updated`, `scale`, `chunked_upload`, `pickup_sevilla`,
`test_orders`, `owner_email_v2`, …). Every function responds to `GET ?health=1` (before any other logic,
with CORS) with `{ fn, build, pricingVersion, capabilities }`. The frontend embeds the same `BUILD_ID`
as `EXPECTED_SERVER_BUILD`.
- Test `src/__checkpoint__/health.test.ts`: every folder in `supabase/functions/*/index.ts` (except
  `_shared`) contains the health handler (static check) and `version.ts` is imported.

### D4 — `pricing-config` + capability-based frontend
New public function `pricing-config` (GET): returns `{ build, pricingVersion, capabilities, shipping:
{…rules}, estHash }`. Frontend hook `useServerCapabilities()` (cached per session, 3 s timeout): if the
endpoint is missing/older → `legacy` mode (Phase H behaviour); if it reports `quote_v5` → `v5` mode.
Every v5 behaviour (4,90 shipping, delivered prices, A/B, PRICE_UPDATED flow, scale, chunked upload,
Sevilla pickup field, test orders) is gated on the capability, not on a build flag.
- Test `src/__checkpoint__/capabilities.test.ts`: legacy and v5 produce consistent UI numbers against
  `deployedServer.ts` and against the new server logic respectively.

### D5 — Admin "Estado del sistema"
`/admin/estado`: frontend build, each function's health build vs `EXPECTED_SERVER_BUILD` (green/red),
DB schema status via RPC `checkpoint_schema_status()` (SECURITY DEFINER; returns each expected
table/column and whether it exists), last Stripe webhook received (`webhook_events`), last owner email
status (`email_log`), checkout failures last 24 h (`checkout_failures`), storage usage of
`print-requests`. A red banner on every admin page when anything is red ("Despliegue pendiente en
Lovable — ver LOVABLE_DEPLOY.md").

### D6 — Migrations
One migration per concern under `supabase/migrations/20261125xxxxxx_*.sql`, all idempotent
(`IF NOT EXISTS`, `CREATE OR REPLACE`), re-including the never-applied `20261118000001/2` idempotently.
Plus `supabase/checkpoint_all_migrations.sql` = all of them in order, safe to run twice, ending with a
verification `SELECT` that returns one row per expected column/table. Mirror them in `drizzle/` only if
Lovable's drizzle setup requires it (follow what `lovable-sync` did).

### D7 — Function config
`supabase/config.toml`: explicit `verify_jwt = false` for `stripe-webhook`, `pricing-config`,
`order-files-zip` (signed links), `packlink-status-hook`, and any function called without a user JWT;
keep `true` for admin functions (they check the admin role inside).

---

## §3 Phase P — One pricing core, robust geometry

### P1 — Single source of truth
Move the estimator (`EST`, `EST_V4`, `analyzeTriangles`, `estimatePart`, `priceOrder`, `charmCents`,
tiers), shipping rules and quote building into `supabase/functions/_shared/pricing/`. The frontend
imports via `@pricing`; `create-instant-checkout` imports the same files. Delete the duplicated
`ESTIMATOR-START…END` copy; replace `scripts/check-estimator-sync.mjs` with a check that exactly one
engine exists. Admin calculator uses the same quote function.
- Test `src/__checkpoint__/single-source.test.ts` (no second copy of `export const EST` anywhere; admin
  and customer calculators produce identical quotes for all fixtures).

### P2 — Geometry pipeline
`geometry.ts`: parse binary/ASCII STL, OBJ, 3MF (all objects, components, transforms, Bambu build
items), GLB → triangles; weld vertices (tolerance relative to bbox, ≥ 1e-4 mm); split shells by shared
edges; per shell: closed/open, signed volume, bbox, inverted (negative volume → flip); classify the mesh:
`clean` (1 closed shell), `disjoint` (closed shells, bboxes or volumes do not overlap), `overlapping`,
`open`, `mixed`.

### P3 — Robust analysis for messy meshes (replaces manifold repair)
`robust.ts`, pure TypeScript, deterministic, same code on client (Web Worker) and server:
- For `clean` and `disjoint`: the raw analysis (sum is correct) — no behaviour change for clean files.
- Otherwise: union-aware solid by column ray casting on an XY grid (cell size chosen so columns ≤ 250 k,
  never smaller than 0.2 mm), counting signed crossings with per-shell orientation fixed (winding > 0 =
  inside; tolerant to open shells by closing intervals at the last crossing). From the solid compute:
  union volume, bbox, and per-orientation `aUp/aDown/aSide` (projected areas of the solid's boundary,
  which is what skins and walls depend on), producing a `MeshAnalysis` the engine prices unchanged.
- Budgets: client ≤ 2 s for 1 M triangles in a worker; server ≤ 1 s CPU for 600 k triangles (measure in
  Node as proxy and record in PROGRESS.md). Above budget → §S3 verified-summary path.
- Remove the `manifold-3d` dependency and `meshRepair.ts` once P3 passes (record bundle-size change).
- Test `src/__checkpoint__/pricing.fixtures.test.ts` with these expectations (PLA, 15 %, 2 walls,
  standard, v4 rounding):

| Fixture | Expected |
|---|---|
| `01_cube_20mm.stl` | 9,90 (unchanged) |
| `02_bracket_80x40x40.stl` | 9,90 (unchanged) |
| `03_organic_82k_tris.stl` | 16,90 (unchanged) |
| `control_stamp_clean.stl` | 10,90 (unchanged) |
| `control_cutter_clean.stl` | 9,90 (unchanged) |
| `ai_staircase_cutter_365k_tris.stl` | 10,90 – 12,90 |
| `overpriced_stamp_22693_shells.stl` | 10,90 – 12,90; analysis ≤ 2 s |
| `09_plate_9_separate_cubes.stl` | identical to raw price |
| `10_overlapping_shells_sphere_box.stl` | ≥ 9,90 and ≤ raw price (12,90); union volume within 5 % of the analytic union |
| `08_maqueta_like_open_shell_348x272x99.stl` | union volume 215–240 cm³; price ≥ 20,00 at 100 % scale; flagged oversize (the real student file, if Nico drops it in `test-fixtures/checkpoint/private/`, must give 200–235 cm³ and ≥ 40,00) |
| `17_big_open_shell_plus_tiny_closed.stl` | volume ≥ 1 500 cm³; price ≥ 80,00 |
| `07_open_box_missing_top.stl` | volume 28–32 cm³ (treated as the closed box) |
| `11_inverted_normals_cube25.stl` | same price as a correct 25 mm cube |

### P4 — Floors, caps, monotonicity
- Floor: price ≥ 0,9 × volume-only price with `V = max(union volume, largest single-shell |V|)`.
- Cap (messy meshes only): `min(primary, charm(1,6 × volume-only))` — continuous; never swap to the
  volume-only price.
- Property tests `src/__checkpoint__/pricing.invariants.test.ts` over all fixtures: material order
  never inverted (PLA ≤ PETG ≤ ABS/ASA ≤ TPU ≤ Nylon by `priceMult`); quantity, infill, walls, quality,
  urgency monotonic non-decreasing; deterministic (same input twice → same cents); clean files
  unchanged versus the current engine (record before/after table in PROGRESS.md).

### P5 — Plate fit with rotation
`plateFit.ts`: for each of the 6 orientations compute the XY convex hull and its minimum-width/
minimum-area enclosing rectangle (rotating calipers); fits if the rectangle fits 256×256 mm with 2 mm
margin and height ≤ 261 mm. Return best orientation, rotation angle, and the scale factor needed to fit.
- Test `src/__checkpoint__/plate-fit.test.ts`: 300×60×20 fits diagonally; the maqueta-like file does not fit;
  20×20×250 fits; 260×10×10 fits diagonally; 270×270×10 does not.

### P6 — Scale to fit / custom scale
UI "Escalar para que quepa (xx %)" and a custom "Escala %" (10–100 %, Advanced). Scale is applied to the
geometry before analysis on client and server (`scale` per piece in the checkout body), stored on the
order and shown to Nico in admin and emails.
- Test `src/__checkpoint__/scale.test.ts`; E2E: maqueta-like → scale-to-fit → priced → Buy enabled (mock).

### P7 — Units detection
If the largest dimension < 5 mm: banner "¿Tu archivo está en metros, centímetros o pulgadas?" with
buttons ×1000, ×10, ×25,4 (show the resulting size on each). If the largest dimension > 1000 mm: ÷10,
÷25,4, ÷1000. Applying uses the scale mechanism (P6).
- Test `src/__checkpoint__/units.test.ts` with the metres and inches fixtures.

### P8 — Very small parts
Largest dimension < 8 mm or thinnest bbox dimension < 0,8 mm: info note (no block) "Pieza muy pequeña:
los detalles muy finos pueden no imprimirse".

### P9 — Large files (remove the 50 MB dead end)
- Parse up to 500 MB in a worker with streaming; above 6 M triangles analyse a vertex-clustered copy.
- Upload: gzip with `CompressionStream` above 5 MB; if the gzip is still > 45 MB, split into ≤ 45 MB
  parts `name.stl.gz.partNNN` + `name.manifest.json` (sha256 of the original, part list, sizes). Show
  upload progress (%). `order-files-zip`, admin downloads and the server reassemble/decompress.
- Remove the "El archivo supera los 50 MB — envíanos un enlace" dead end; keep "send a link" only as a
  secondary option.
- Scheduled cleanup (D-10) for unpurchased uploads > 20 MB after 30 days (cron with the existing
  `cron-auth` pattern); never deletes files referenced by orders or quotes.
- Tests `src/__checkpoint__/large-file.test.ts` (gzip round-trip, split/reassemble, manifest hash) and
  E2E with in-page generated 60 MB and 160 MB STLs → price shown, Buy enabled (mock server).

### P10 — Formats
- STEP/STP/IGES/IGS: convert in the browser with `occt-import-js` (lazy-loaded, self-hosted WASM in
  `public/`), then the normal pipeline; on conversion failure → review path with the file uploaded.
- 3MF: all objects and components with transforms; Bambu project 3MF with painted objects must price
  (use real files only if Nico put them in the gitignored `test-fixtures/checkpoint/private/`).
- Unsupported (3DM, BLEND, FBX, SCAD, ZIP, DWG, SKP, F3D, …): friendly per-format message with the
  exact export steps ("Blender: Archivo → Exportar → STL"), the file is still uploaded to the free
  review path, plus WhatsApp.
- One source for every format list on the site: `src/lib/fileFormats.ts`. Grep test: no hard-coded
  format lists elsewhere (no "STL, OBJ, 3MF" literals in i18n or components outside that file's output).
- Tests `src/__checkpoint__/formats.test.ts`.

### P11 — File health panel
States: "Listo para imprimir" (fits, clean), "Lo revisamos antes de imprimir" (messy, robust), "No cabe
— opciones" (oversize), "¿Unidades?" (units), "Pieza muy pequeña", "Archivo grande — subiendo x %",
"Formato no compatible — cómo exportar". Exactly one primary state at a time; grams always shown as
"≈ N g" with N > 0 when the volume is known.

### P12 — Performance
Analysis always in a worker; main-thread long tasks < 200 ms during upload/price (measure with
PerformanceObserver in e2e); time-to-price recorded per file in QA_MATRIX.md (≤ 2 s up to 50 MB on the
CI machine; ≤ 10 s at 160 MB).

---

## §4 Phase S — Checkout server v5 (in the repo)

### S1 — Pure server logic
`supabase/functions/_shared/checkout/evaluate.ts`: validate body → load files (with reassembly/gunzip)
→ analyze with the shared pipeline → quote with the shared function → compare → decide. The Deno
`index.ts` only does HTTP, storage, Stripe and DB calls. Node tests import `evaluate.ts` directly.

### S2 — Quote contract and PRICE_UPDATED (no dead end ever)
Request adds: `client_quote { parts_subtotal_cents, shipping_cents, total_cents, pricing_version }`,
`pieces[].scale`, `pieces[].analysis_summary { sha256, tris, bbox, union_volume, shells, class }`,
`page_group`, `shipping_mode`, `fulfillment`, `pickup_location`, `promo_code`, `is_test`.
Server recomputes. If `|server − client| ≤ 2` cents → create the session. If server < client → create
the session at the server total (the customer pays less) and return it. If server > client → HTTP 409
`{ error: "PRICE_UPDATED", quote: {…full breakdown…} }`; the client shows "Precio actualizado para tu
archivo: X € (antes Y €)" with one-click Buy. Never return PRICE_MISMATCH to the UI.
- Test `src/__checkpoint__/server-quote-parity.test.ts`: for every fixture × materials × fulfillment ×
  page group, client quote === server evaluate quote (exact cents).
- Test `src/__checkpoint__/price-updated.test.ts`.

### S3 — Heavy files: verified client summary
If a file exceeds the server budget (size > 30 MB or analysis > budget), the server verifies the
client's `analysis_summary` with cheap checks on the stored bytes (sha256, triangle count, bbox, per-shell
signed volume bounds: `max|V_shell| ≤ union ≤ Σ|V_shell|`) and prices from the verified summary with the
same engine. Tampered summaries (wrong sha, impossible volume, areas outside bounds) → server prices from
its own fast raw/volume-only analysis and answers PRICE_UPDATED.
- Tests with tampered summaries.

### S4 — Shipping v5 server rules
Same `shipping.ts` as the client (D-2). Stripe line items: one per piece + one shipping line labelled
"Envío (incluido)" (delivered), "Envío" (upfront), "Envío gratis" (0); none for pickup. Metadata:
`page_group`, `shipping_mode`, `fulfillment`, `pickup_location`, `pricing_version`, `client_total_cents`,
`server_total_cents`, `ph_distinct_id`, `ph_session_id`, `xp_variants`, `is_test`. `MAX_CHARGE_CENTS`
stays 20590.
- Test `src/__checkpoint__/shipping-matrix.test.ts`: ≥ 40 cases (pickup BCN / pickup Sevilla / shipping ×
  local A / local B / non-local × parts 9,90 / 25,00 / 29,95 / 30,00 / 34,90 / 150,00 × with/without
  DIMENSION11 × qty 1/3) — UI total === Stripe params total === expected.

### S5 — Oversize and scale on the server
Server uses `plateFit.ts` (rotation-aware) and applies `scale`; OVERSIZE only when no orientation fits
after scale.

### S6 — Rate limiting that cannot trap a buyer
Keep the per-IP limit but return `Retry-After`; identical retried requests within 10 s return the same
result without counting; the client never auto-retries in a loop.

### S7 — Prompt 1 server parts
`ph_did`/`ph_sid` appended to success/cancel URLs and stored in metadata; `create-stripe-payment-link`
redirect to `https://www.dimension3dprints.com/track`.

### S8 — Test orders
`is_test: true` (sent when the visitor has `?internal=1` / the internal flag) → `orders.is_test = true`
and Stripe metadata `test=1`. Admin hides test orders by default (toggle to show). Owner email subject
starts with "[TEST]".

### S9 — Regression
Promo codes (DIMENSION11, student), abandoned-checkout recovery, quote-link payments (Phase 3) and
pickup-only flows keep working (existing tests + new cases).

---

## §5 Phase F — Page groups, fulfillment, consistency

### F1 — Page groups
`src/config/pageGroups.ts` (D-3) is the only classifier; it returns `{ group: 'local'|'non_local',
pickupLocation: 'bcn'|'sevilla'|null }`. Generate `docs/checkpoint/PAGE_GROUPS.md` with every sitemap
route and its group (test regenerates and diffs it). London and New York stay quote-only.

### F2 — Pickup locations without addresses
Labels: "Recogida gratis en Barcelona (Les Corts), con cita" / "Recogida gratis en Sevilla, con cita"
(8 languages). Pickup instructions with the exact address are sent only in the confirmation email.
The order stores `pickup_location`.

### F3 — Fulfillment UI (v5 mode)
Two equal-size cards, each with its own final total: "Envío a domicilio — 14,90 € (envío incluido)" or,
in variant B, "9,90 € + 4,90 € envío = 14,80 €"; and "Recogida gratis en {ciudad} — 9,90 €". Non-local
pages: no cards, one line "Envío incluido · gratis desde 30 €". Buy label "Comprar · {total}". The
same number appears in the card, the total, the Buy label, the mobile bar, the breakdown and Stripe.
- Test `src/__checkpoint__/fulfillment-ui.test.tsx` (component tests) + e2e numbers check.

### F4 — Sevilla routing
`pickup_location = 'sevilla'` → owner email also to Daniel (D-8), admin badge "Sevilla (Daniel)",
confirmation email with Sevilla pickup instructions.

### F5 — Experiment hygiene
`shipping_r1` assigned, tagged and exposed only on local pages in v5 mode; `site_language` equals the
page language; `page_type` correct for EN city pages.
- Test `src/__checkpoint__/analytics-props.test.ts`.

### F6 — Lead times everywhere (D-4)
All delivery-time copy (calculator tiers, hero, home blocks, express blocks, SEO landing pages, FAQ,
schema, `llms.txt`, `llms-full.txt`, emails) is generated from `shipDate.ts` in 8 languages.
- Grep checks: no "Mismo día"/"Same day"/equivalents for the urgent tier; no standard-tier "24–48 h"
  promise; calculator tier labels come from the config.

### F7 — Price claims per page group
Local pages: "Desde 9,90 €". Non-local pages (v5): "Desde 14,90 € con envío incluido · envío gratis
desde 30 €"; SSR renders the v5 text, and the client swaps to the legacy wording ("Desde 9,90 € +
5,90 € de envío") after hydration if the server is still legacy. 8 languages.

---

## §6 Phase U — The price window (Nico: "simple is not simple")

Design goal: Simple = choose material and colour, see one honest total, press Buy. Everything else is
optional and compact. Use the current visual language (colours, fonts, radii) of the site.

### U1 — Desktop layout (≥ 1024 px)
Left column: viewer (max 360 px tall, grows to fill when there is space), file health (P11), parts list
with per-part quantity and remove. No empty block taller than 120 px at 1280×800 with one part (fill with
a compact "Qué pasa después: revisamos tu archivo · imprimimos · enviamos/recoges" strip if needed).
Right column: options area + fixed footer (total, fulfillment, ship date, Buy, trust line, secondary
actions). **In Simple mode at 1280×800 and 1440×900 the right column has no internal scroll**
(`scrollHeight ≤ clientHeight + 2`). Breakdown lives behind "Ver desglose" under the total (never cut off).

### U2 — Simple mode
Material (6 compact cards), Colour (dropdown), "+ Añadir nota" (collapsed). Nothing else.

### U3 — Advanced mode
Material + colour, Calidad (4-option segmented control), Resistencia (4-option segmented control with a
one-line hint), Velocidad (3 options with the ship date from F6), Escala % (P6), Nota. Height ≤ 1,5
viewport heights at 1440×900. No orientation, no supports (D-5), no second fulfillment selector, no
contact fields (D-6).

### U4 — Footer
Fulfillment (F3), "Pide antes de las 14:00 · sale el {fecha}" from F6, Buy, quiet trust row (T2),
secondary actions (Guardar presupuesto · Revisión gratis · ⋯). The Buy button stays the most prominent
element.

### U5 — Mobile (390×844 and 360×740)
After a file is priced: viewer collapses to ≤ 160 px, the total + Buy sit in a sticky bottom bar and are
visible without scrolling; options open in a bottom sheet; WhatsApp link (T3).
- E2E `e2e/checkpoint/modal-layout.spec.ts` asserts U1–U5 geometry at all four viewports, ES and IT,
  Simple and Advanced, legacy and v5.

### U6 — Special states designed
Oversize (with scale), units, small, messy, large upload progress, unsupported format, price updated,
checkout error (H5), quote-only city (London/NY). One component each, translated, screenshotted (Q6).

### U7 — Copy
All new strings in 8 languages (print values to PROGRESS.md). The orientation label bug and any
run-together labels are gone. Same verbs everywhere ("Comprar · {precio}").

### U8 — Accessibility basics
Cards and segmented controls are buttons with `aria-pressed`, the window traps focus, every control has
an accessible name; axe-core scan of the open window has no serious/critical violations.

### U9 — Dead code
Remove v3-only paths, orientation/supports UI, the old toggle, and any component no longer rendered,
without breaking legacy-mode compatibility with the deployed server.

---

## §7 Phase O — Orders, admin, Packlink (one system; Printrack stays separate)

### O1 — Webhook stores everything
On `checkout.session.completed` (and async success): store `customer_name`, `customer_email`,
`customer_phone`, normalized `shipping_address` (`name, line1, line2, postal_code, city, state, country`),
`total_paid_cents = amount_total`, `currency`, `stripe_session_id`, `stripe_payment_intent`,
`parts_subtotal_cents`, `shipping_cents`, `min_adj_cents`, `express_cents`, `promo_code`, `promo_pct`,
`promo_discount_cents`, `urgency`, `ship_by_date`, `page_group`, `shipping_mode`, `pickup_location`,
`language`, `source_path`, `xp_variants`, `is_test`. Idempotent per session. Insert a row in
`webhook_events` for every webhook received (type, id, status, error).
- Test `src/__checkpoint__/webhook-store.test.ts` with recorded Stripe payload shapes (old
  `shipping_details` and new `collected_information.shipping_details`).

### O2 — Owner order email, guaranteed
Sent by the webhook itself (not only via function-to-function invoke), to D-8 recipients, with up to 3
retries and an `email_log` row per attempt (kind, to, subject, order_id, resend_id, status, error).
Subject: `🧾 Pedido #287 · 14,81 € · 🇪🇸 Envío · Estándar (sale vie 27 nov) · {nombre}` (urgent orders
start with `⚡ URGENTE`). Body: customer block, address (copyable), payment breakdown equal to Stripe,
pieces with all settings and scale, per-file download links (30 days) and the zip link, ship-by date,
notes, page/language/variant, admin deep link. Failure → red banner in admin + next digest.

### O3 — Customer emails
Confirmation (8 languages) with the tracking page link; status emails (in production, ready for pickup
with location instructions, shipped with tracking link, delivered). All logged in `email_log`.

### O4 — One admin
Single admin shell at `/admin` with tabs: **Pedidos · Revisiones · Clientes potenciales · Envíos ·
Estado · Códigos**. The old card UI and the separate "Nuevo panel" pages are replaced (old URLs redirect).
Professional, consistent design (status chips, clean tables, responsive — Nico uses Safari on Mac and his
phone). Remove the old orders UI only after the new one covers everything it did.

### O5 — Order list
Search (number, name, email, phone, file name); filters (status, fulfillment, paid/unpaid, test, date);
columns: #, date, customer, country flag, total paid, fulfillment (Envío / Recogida BCN / Recogida
Sevilla), urgency + ship-by (red when due today or late), status. A separate "Pagos no completados" list
(sessions created, not paid) with contact data when Stripe has it.

### O6 — Order detail
Customer (name, email mailto, phone tel + WhatsApp link, address with copy button), payment (parts,
minimum adjustment, urgency, promo, shipping, **Total pagado = Stripe** with a link to the Stripe
payment), pieces table (file + download, qty, material, colour, quality, infill, walls, scale, dims,
≈ grams, ≈ hours), files (sign on click; zip), notes (customer + editable internal), status timeline with
one-click actions that send the right customer email, tracking fields, Packlink block (O8), email log,
"Sincronizar con Stripe" (O7).
- E2E `e2e/checkpoint/admin.spec.ts` (mocked Supabase auth + rows).

### O7 — `admin-stripe-sync`
Admin-JWT function: for one order or for all orders missing data, fetch the Stripe checkout session (+
payment intent) and fill missing customer/address/amount fields. Idempotent. Button in admin; document
running it once for recent orders (#250+) after deploy.

### O8 — Envíos (Packlink)
List paid shipping orders not yet shipped. Per order: parcel suggestion (box = bbox of the packed parts
+ 20 mm padding, rounded up to whole cm; weight = Σ grams × qty × 1,15 + 150 g packaging, rounded up to
0,1 kg; both editable), "Copiar datos" (formatted text), "Exportar CSV para Packlink" for the selected
orders via `src/config/packlinkCsv.ts`. If `docs/checkpoint/inputs/packlink-example.csv` exists, the
export header must equal its header row exactly (test); otherwise use the documented generic headers and
show "Sube el CSV de ejemplo de Packlink (Nuevo envío ▾ → Importar CSV → descargar ejemplo) para que las
columnas coincidan" in the tab. Postcodes keep leading zeros; decimals with a point; insurance "no".
"Enviar a Packlink (Zapier)" POSTs the order JSON to the hook URL saved in admin settings (if set).
"Marcar enviado" (carrier + tracking number → tracking URL template → status shipped → customer email).
- Test `src/__checkpoint__/packlink-csv.test.ts`.

### O9 — `packlink-status-hook`
`verify_jwt = false`, shared secret (query or header) stored in a private settings table. Accepts the
Zapier "Shipment Status Updated" payload (map fields defensively: order reference, tracking number,
carrier, status), updates the order, sends the customer email on shipped/delivered, logs everything.
Write `docs/checkpoint/ZAPIER_PACKLINK_SETUP.md` with the exact two Zaps (Catch Hook → Packlink PRO
"Create Shipment Draft"; Packlink PRO "Shipment Status Updated" → Webhooks POST to the hook URL).

### O10 — Revisiones (quote requests)
Everything about the request, files, settings, contact, reply with a price (existing
`send-customer-quote` + quote payment links), status.

### O11 — Clientes potenciales (calculator uses)
Per session: files, price shown, page, country, device, language, whether checkout started/failed/paid
and the failure code; contact if known. Blocked sales highlighted at the top.

### O12 — Lost-sale capture
Any checkout failure, oversize, units problem, unsupported format or large-file problem creates/updates
a lead row and sends at most one owner alert per session per code: `⚠️ Venta bloqueada · {código} · {precio}
· {página}` with files, settings and contact if known.

### O13 — Daily digest
21:00 Europe/Madrid (cron with the existing `cron-auth` pattern): orders and revenue today, unpaid
sessions, blocked sales (with files), calculator uses, top pages, emails that failed.

### O14 — Customer tracking
`/pedido/<token>` shows the timeline, ship-by or pickup date, tracking link, contact. `/track` looks up
by order number + email (primary) or last 3 phone digits (fallback) and redirects to `/pedido/<token>`.
Localized titles (fix "Track Your Order Barcelona" on Spanish pages), brand colours.

---

## §8 Phase E — Emails

### E1 — One email design system
`_shared/emailLayout.ts` used by every owner and customer email. Render previews to
`docs/email-previews/` and PNG screenshots to `docs/checkpoint/screens/email-*.png` (owner emails ES;
customer emails ES + IT at least).

### E2 — Calculator email redesign (`send-price-estimate`)
At most two emails per session: "🧮 Nuevo presupuesto" (first priced cart; updated content if the cart
changes within 10 min is merged by the server via the lead row) and, if relevant, the O12 alert.
Subject `[Calculadora] 2 piezas · 10,90 € · 🇮🇹 · /it/stampa-3d-online`. The total is the exact site
total from the shared quote (fixes the €19,80 bug: per-order minimum, unit step, promo, shipping for the
page group). Content: files with dims, ≈ grams, ≈ hours, material, qty, scale, health state, download
links + zip, page, language, country, device, A/B variants, admin lead link.
- Test `src/__checkpoint__/emails.test.ts` (recipients, totals equal the site quote, all fields render).

### E3 — Owner order email = O2. E4 — Quote/design request emails use the same layout.
### E5 — Recipients in one file (D-8).
### E6 — Email log + "Reenviar" button in the order detail.

---

## §9 Phase A — Analytics

- A1: events and properties from H5, P6–P11, S2: `price_updated_shown`, `price_updated_accepted`,
  `oversize_shown`, `scale_applied`, `units_applied`, `large_file_upload {mb, parts, ms}`,
  `unsupported_format {ext}`, `checkout_failed {code, http_status, client_total_cents,
  server_total_cents, page_group, …}`.
- A2: F5 hygiene.
- A3: `$exception` events carry message and stack (enable exception capture properly; ErrorBoundary
  reports with context).
- A4: `docs/analytics/checkpoint-queries.md` with HogQL for: funnel by page group, failures by code,
  success rate by file type, time-to-price, messy share, Buy = Stripe audit (server vs client totals).
- A5: `?internal=1` still tags internal traffic and makes orders `is_test`.

---

## §10 Phase T — Trust and content (the old Prompt 4, adjusted)

- T1: "~300 pedidos" replaces every "250+"; rating strip "4,8 · 25 reseñas en Google" (24 de 5★ where
  space allows) in 8 languages; `GOOGLE_PROFILE_URL = null` hides links; no review schema.
- T2: quiet trust row under the total: "★ 4,8 · 25 reseñas en Google · ~300 pedidos · Impreso en
  Barcelona" + 3 thumbnails (≤ 56 px) of real finished parts already in the repo's client-projects images.
- T3: mobile hero primary "Sube una foto o archivo"; secondary "Envíanos una foto por WhatsApp"
  (prefilled "Hola Nico, quiero imprimir esto:"); in the mobile window a text link "¿Tienes dudas?
  Envíanos una foto por WhatsApp"; event `mobile_whatsapp_click {location}`.
- T4: keep the WhatsApp bubble bottom-right on every page.
- T5: price claims per F7.

---

## §11 Phase Q — Prove it

### Q1 — Unit tests
All `src/__checkpoint__/*.test.ts` green; coverage of `_shared/pricing` and `_shared/checkout` ≥ 85 %
lines (`node scripts/checkpoint/run-tests.mjs unit` writes `reports/coverage-summary.json`).

### Q2 — Fixtures
`test-fixtures/checkpoint/` (shipped) + `scripts/checkpoint/gen-fixtures.mjs` generating: a part priced
18–25 € (find dimensions that land in range and lock them), 30 MB, 60 MB and 160 MB high-poly STLs,
duplicated-shells box, overlapping spheres, a 3MF with 3 objects, an OBJ with groups, a STEP cube
(write a minimal valid AP214 STEP for a box, or generate with occt in Node), ASCII STL. `README.md` in the
fixtures folder lists each file and its expected outcome.

### Q3 — The big matrix (e2e, local build, mocked backend running the REAL server logic)
Playwright route handlers for Supabase functions/storage/REST and Stripe call the pure `_shared` code,
so client and server logic are both exercised. Pages (≥ 20): `/`, `/ca/`, `/3d-printing-barcelona`,
`/impresion-3d-urgente-barcelona`, `/impresion-3d-sevilla`, `/3d-printing-sevilla`, `/madrid`,
`/impresion-3d-con-entrega-a-valencia`, `/impresion-3d-online`, `/3d-printing-service`,
`/3d-printing-delivery-paris`, `/3d-printing-delivery-london` (quote-only), `/it/stampa-3d-online`,
`/it/stampa-3d-milano`, `/de/3d-druck-service`, `/de/3d-druck-berlin`, `/fr/impression-3d-en-ligne`,
`/nl/3d-printen-laten-maken`, `/pt/impressao-3d-online`, `/catalogo/soporte-telefono`, the B2B page.
Each page ≥ 6 file tests: cube (9,90), the 18–25 € part, 82k-triangle organic, 30 MB generated, the
maqueta-like file (oversize → scale → buy), messy duplicate; plus on ≥ 6 pages: 160 MB, metres, STEP, 3MF, OBJ,
unsupported `.blend`. Materials PLA/PETG/ABS/ASA/TPU/Nylon on ≥ 3 pages. Local pages: v5 variant A and
B and legacy mode. Homepage: site design V1 and V2 (`?xp_home_v2=v2`). Projects: desktop Chrome and
Pixel 5 for all; WebKit desktop + iPhone 13 for the homepage and one non-local page.
Per test assert: price within budget; health state correct; fulfillment options correct for the page;
the same total in card/total/Buy/mobile bar/breakdown; checkout request accepted by the real server
logic (no PRICE_MISMATCH; PRICE_UPDATED only in the tampered test); mocked Stripe amount === Buy label.
Write `docs/checkpoint/QA_MATRIX.md`: page × file table, success rate per file type and per page
(**100 % required for supported cases**), time-to-price per file.

### Q4 — Admin e2e (O4–O9) with mocked Supabase.

### Q5 — Site crawl
Every sitemap route: HTTP 200; `<html lang>` matches the page language; `<title>`/H1 language matches
(no English titles on non-English pages); canonical `https://www.…`; valid hreflang cluster; no broken
internal links; no console errors; calculator present where expected; price and lead-time claims match
F6/F7. Fix everything found. `docs/checkpoint/CRAWL_REPORT.md` must end with `ERRORS: 0`.

### Q6 — Screenshots
≥ 40 PNGs in `docs/checkpoint/screens/`: window Simple/Advanced (desktop + mobile, ES + IT, legacy + v5,
A + B), every special state (U6), Sevilla/BCN/non-local fulfillment, admin list/detail/envíos/estado,
emails.

### Q7 — Live smoke (after the merge to main)
`npm run smoke:live` (Playwright against production with `LIVE=1` set by the script, `?internal=1`,
read-only except ≤ 3 checkout redirects that read the Stripe amount and close). Pages: `/`, `/impresion-3d-sevilla`, `/madrid`,
`/it/stampa-3d-online`, `/3d-printing-delivery-paris`. Result in
`docs/checkpoint/LIVE_SMOKE.md`, ending with `RESULT: PASS` (before the Lovable deploy the site must be
correct in legacy mode).

### Q8 — Regression
All pre-existing unit and e2e suites green (or updated with reasons in DECISIONS.md). Proof: an
unfiltered `node scripts/checkpoint/run-tests.mjs all` with 0 failures in `reports/vitest.json` and
`reports/playwright-full.json`. Install browsers with `npx playwright install`. Keep the four projects of
`playwright.config.ts`; a spec that is truly browser-specific skips inside the spec (reason in DECISIONS.md).

---

## §12 Phase R — Release package

- R1 `docs/checkpoint/SECURITY_BACKLOG.md` — findings only (next prompt).
- R2 `docs/checkpoint/LOVABLE_DEPLOY.md` — paste-ready Lovable prompt:
  1) check the GitHub connection uses branch `main` (switch from `lovable-sync` if needed) and pull;
  2) run `supabase/checkpoint_all_migrations.sql` (or apply the listed migrations in order) and paste the
     verification query result;
  3) deploy **every** edge function from `main` exactly as in the repo, with the `config.toml` JWT
     settings, no code changes;
  4) confirm secrets exist: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY`, `POSTHOG_KEY`, `POSTHOG_HOST`, `PACKLINK_HOOK_SECRET` (new; generate);
  5) call `GET …/functions/v1/<fn>?health=1` for every function and paste the build ids.
  Plus a manual fallback section (SQL editor + per-function deploy list) and what to do if a function
  fails to deploy.
- R3 `npm run verify:deploy` (`scripts/checkpoint/verify-deploy.mjs`): calls every health endpoint and
  `pricing-config` from Nico's Mac and prints a table (expected vs live build; capability list); exits
  non-zero if anything is behind.
- R4 `docs/checkpoint/ZAPIER_PACKLINK_SETUP.md` (O9).
- R5 `docs/checkpoint/FINAL_REPORT.md` — one row per checklist item (ID, status, commit, evidence), the
  traceability table (§13) fully mapped, known limitations, and Nico's to-do list in order (deploy in
  Lovable, run verify:deploy, run admin-stripe-sync, set up Zapier if wanted, export the Packlink CSV
  example, check the business inbox).
- R6 Release, in this order:
  1) on the branch, `node scripts/checkpoint/verify.mjs` shows every item verified except Q7 and R6;
  2) merge `checkpoint/2026-11-25` into `main` with a normal merge (never delete the branch, never
     force-push); if verify then reports stale test reports, run `node scripts/checkpoint/run-tests.mjs all`
     on `main`; `npm run build`; commit; push; wait until Vercel serves the new build;
  3) Q7 live smoke → `LIVE_SMOKE.md` ending with `RESULT: PASS`; set Q7 and R6 to done with evidence;
     commit; push;
  4) `node scripts/checkpoint/verify.mjs --final` must print `CHECKPOINT VERIFIED` (it needs a clean,
     pushed tree); fix and repeat until it does;
  5) delete `docs/checkpoint/ACTIVE`, commit "CP R6: checkpoint complete", push;
  6) print the final proof listed in `docs/checkpoint/GOAL.txt` (raw command output) and a short summary
     for Nico (items, QA success rates, test orders to delete, his to-do list).

---

## §13 Traceability (Nico's words → items)

| # | Nico said | Items |
|---|---|---|
| 1 | Paid orders, no email to me | O2, E5, E6, D5, O13 |
| 2 | Admin: can't download files, no customer data | H8, O1, O4–O7 |
| 3 | Probably many customers can't buy | H1–H5, P3–P12, S2–S6, Q3, O12 |
| 4 | Lovable deploy failed; find a way around | D1–D7, R2, R3 |
| 5 | Did the last prompts even push? | D2, STATE_BEFORE.md, FINAL_REPORT.md |
| 6 | Calculator emails old and funky | E1, E2 |
| 7 | Admin old/unprofessional; tracking one-sided; one system; Printrack out | O4–O14 |
| 8 | Get the address automatically; Packlink one click | O1, O8, O9, R4 |
| 9 | Architecture student: price too cheap | H2, H3, P3, P4, P5, P6 |
| 10 | Test 5+ files of all kinds on every page; success rate | Q2, Q3, QA_MATRIX.md |
| 11 | Remove blockers like the file size limit | P9, P10, H5 |
| 12 | Sevilla page has no Sevilla pickup | H6, F1, F2, F4 |
| 13 | Check A and B versions | F5, Q3 (V1/V2 and shipping A/B), Q6 |
| 14 | Market research on 9,90 € and delivery display | AUDIT §H, D-2, D-7, F3, F7 |
| 15 | Simple not simple; cut-off; blank left; advanced too long; supports/rotation useless | U1–U9 |
| 16 | Don't know if an order is urgent | O2, O5, O6 |
| 17 | Security is next | R1 only |
| 18 | /goal must not skip or stop early | §0.2, CHECKLIST.json, verify.mjs, stop hook |

---

## §14 Reference

- Plate: Bambu Lab X2D, 256 × 256 × 261 mm (`EST.plate`).
- Instant-buy countries: ES PT FR DE IT NL BE LU AT IE PL DK SE FI (`SHIP_COUNTRIES`).
- Deployed server (oracle for legacy mode): commit `0aebcd6`, `supabase/functions/create-instant-checkout/{index.ts,checkout-policy.ts}`.
- Real data to keep in mind (AUDIT §F): 24 Nov — 18 people priced files, 3 clicked Buy, 2 were blocked,
  1 paid. 30 days — 32 files over 50 MB, 26/27 real files messy since 24 Nov.
- Nico's email inboxes: `011107miko@gmail.com` (personal, reads it), `dimension3dprintsbcn@gmail.com`
  (business). Sevilla maker: Daniel, `3d.kayda@gmail.com`.
- Sender: `Dimension3D <noreply@dimension3dprints.com>` (verified in Resend; calculator emails use it).
