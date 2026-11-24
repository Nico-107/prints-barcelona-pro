GROUND RULES (read before doing anything)
- Repo: ~/Projects/prints-barcelona-pro. Vite + React + TS + Tailwind + shadcn, prerendered SSR (~99 routes), 8 languages (en, es, ca, de, fr, it, nl, pt), Supabase, Stripe, PostHog EU (project 208342), Vercel.
- Supabase edge functions are NOT edited here (they are managed in Lovable). If a task needs an edge-function change, write the exact change into LOVABLE_TODO.md and tell me.
- Never use `routes` in vercel.json (only `rewrites`). Never proxy PostHog through Vercel; keep the direct eu.i.posthog.com connection.
- pathLanguage() in LanguageContext.tsx and urlLanguage() in entry-server.tsx must stay mirror images; never call setLanguage in a hydration useEffect.
- Every new user-facing string goes into ALL 8 languages with a real translation (no English copied into other languages). After adding, print the actual values of each new key in every language file, not just the key names.
- The Buy button stays the main, most visible element in the price modal. Keep the modal uncluttered.
- Prices always end in .90. The minimum order is €9.90. No setup fee anywhere.
- Do not change the price calculator maths except where a prompt says so explicitly.
- Do not change the site's look or layout beyond what a prompt asks.
- Work on main, run `npm run build` and fix every error before committing, then push to main (Vercel previews don't work for me).
- PROOF, NOT SUMMARIES: at the end, paste raw `git diff --stat`, the raw output of the greps I ask for, and the build result. Do not claim anything is done without the raw output that shows it. If something could not be done, say so plainly.

PROBLEM: messy meshes get wildly overpriced. Real case: a stamp worth ~€10.90 was quoted €93.90 on the live site. Other users hit the same thing. This loses orders and makes the site look like a scam. Fixtures are in test-fixtures/:
- overpriced_stamp_22693_shells.stl — 185,000 triangles, 22,693 separate shells (18,662 watertight, the rest open), overlapping. Raw surface area 8,772 cm², but the REAL outer surface is ~430–510 cm²; real volume ~87 cm³. Correct PLA price ≈ €10–12 (49 g, ~1.6 h).
- control_stamp_clean.stl — the same part cleaned (1 shell, 427 cm², 86.8 cm³). Must price ≈ €10–12.
- ai_staircase_cutter_365k_tris.stl — AI-made, 1 watertight shell but 365k triangles with stair-stepped walls (494 cm² vs 402 cm² clean). Must price ≈ €10–12.90.
- control_cutter_clean.stl — 1,364 triangles. Must price ≈ €10–11.

ROOT CAUSE (verify it in the code): the estimator charges wall time and shell plastic from TOTAL triangle surface area. Overlapping/duplicate/internal shells add thousands of cm² of surface that will never be printed, so time and price explode.

BUILD
1. Find the estimator (StlEstimator.tsx and whatever module computes grams/hours/price) and the Admin calculator. Both must use ONE shared function after this change.
2. Add mesh analysis before pricing (in a Web Worker so the page never freezes): triangle count, shell count, watertight yes/no, total area, signed volume.
3. If the mesh is not a single watertight shell (shells > 1 OR open edges): repair with the npm package `manifold-3d` (WASM): build a Manifold from each watertight shell, batch-union them, and measure area + volume of the result. Ignore open shells that can't form a manifold, but log their count. Use the repaired area/volume for pricing.
4. Time budget: if repair takes > 8 s or fails, fall back to a VOLUME-ONLY safe estimate (grams from volume with the normal infill assumptions, hours from grams with the normal machine rate). Never fall back to raw total area.
5. Safety net (applies to every file): compute a volume-based upper bound (generous: 1.6× the volume-only estimate). If the area-based price exceeds that bound, use the bound. This makes a €20 print showing as €230+ impossible.
6. Buy stays available for every price up to the instant-buy cap (€200). Do NOT replace Buy with a quote button for big prices. If the safety net or fallback was used, show a small neutral line under the price: "Nico revisará tu archivo antes de imprimir" (translated) — no alarm wording.
7. Monitoring: add to estimate_shown and buy_clicked: mesh_tris, mesh_shells, mesh_watertight, mesh_area_cm2, mesh_volume_cm3, mesh_repaired (bool), price_capped (bool), estimate_ms.
8. Add a test script (npm run test:pricing or a vitest file) that loads the 4 fixtures through the SAME pricing function in PLA, 0.4 nozzle, default settings, and asserts each price is within the ranges above. Print a table: file | tris | shells | repaired | area used | volume | grams | hours | price.
9. Make sure the multi-part order total, quantity pricing, .90 rounding and €9.90 minimum still behave exactly as before for clean files (run the test on 3 other clean STLs from the repo or test-fixtures controls and show before/after prices are identical within €0.10).

PROOF TO PASTE: git diff --stat; the full pricing test table output (before your change and after); grep -rn "manifold-3d" package.json src; npm run build tail.
