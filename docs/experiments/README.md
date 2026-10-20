# Experiment System v2

All experiments run through the engine in `src/lib/experiments/`. The pre-paint inline script in `index.html` assigns variants before React mounts, and CSS attribute selectors hide inactive variants (removing them from the accessibility tree).

## How to add an experiment

1. **Add a registry entry** in `src/lib/experiments/registry.ts`:
   ```ts
   {
     id: 'my_test_r1',
     layer: 'home_body',       // pick one layer
     variants: ['A', 'B'],
     pages: ['/'],             // optional; undefined = all pages
     langs: ['es', 'en'],      // optional; undefined = all langs
     primaryMetric: 'upload_started',
     guardrailMetrics: ['whatsapp_click'],
     startedOn: 'YYYY-MM-DD',
     minDays: 21,
     maxDays: 56,
     enabled: true,
   }
   ```

2. **Add the same entry** to the `EXP` array in the inline pre-paint script in `index.html`. Keep both in sync — mismatch = silent wrong variant on first load.

3. **Add CSS** to `src/index.css`:
   ```css
   /* my_test_r1 */
   html:not([data-xp-my-test-r1]) [data-xp-slot="my_test_r1"][data-xp-v="B"],
   html[data-xp-my-test-r1="A"]  [data-xp-slot="my_test_r1"][data-xp-v="B"],
   html[data-xp-my-test-r1="B"]  [data-xp-slot="my_test_r1"][data-xp-v="A"] { display:none; }
   ```

4. **Add variant markup** in the component:
   ```tsx
   <div data-xp-slot="my_test_r1" data-xp-v="A">...control...</div>
   <div data-xp-slot="my_test_r1" data-xp-v="B">...variant...</div>
   ```
   `display:none` removes elements from the accessibility tree — no screen-reader leak.

5. **Fire exposure** with `useXpExposure(ref, 'my_test_r1')` on the container. Fires `experiment_exposure` once per session when ≥50% visible for ≥1 s.

6. **Add i18n keys** for any new copy in all 8 language files (`src/i18n/*.ts`).

7. **QA override**: `?xp=my_test_r1:B` forces variant B.

8. **Run `npm run build`** — `check-xp-ssr-text.mjs` verifies each variant appears in the prerendered HTML.

---

## Layers

At most one experiment runs per layer per visitor. Assignment uses `hash(visitorId + "::layer::" + layerId)` to pick the experiment, then `hash(visitorId + experimentId)` for the variant. 10% of visitors are in the holdout and see no experiments (`data-xp-holdout="true"` on `<html>`).

| Layer | Current experiment | Notes |
|---|---|---|
| `checkout_modal` | `modal_actions_r1` | Actions in the price estimate modal |
| `home_body` | `home_proof_r1` | Sections on the home page |
| `upload_area` | `upload_area_r1` | The file drop zone |
| `header` | `header_btn_r2` | Navigation header CTA |
| `global_style` | — | Site-wide visual changes |

---

## Decision rule

| Condition | Decision |
|---|---|
| P(beat control) ≥ 95%, days ≥ minDays, ≥ 100 exposed per variant | **WINNER** — ship the winner |
| Days ≥ maxDays | **NO DIFFERENCE** — ship neither, revert to control |
| Otherwise | **KEEP RUNNING** |

Run `npm run xp:report` for current numbers (requires `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_PROJECT_ID` in `.env`).

Statistics: Beta(1+conversions, 1+n−conversions), 20k seeded Monte Carlo draws, expected loss reported alongside probability.

---

## Traffic reality

About **115 sessions per week** (owner traffic excluded). At this volume:

- Each test needs **3–8 weeks** to reach a decision.
- Only **large differences (≥1.5×)** can be detected with confidence.
- Small tweaks — punctuation, a slightly different shade, a word change — **cannot be measured at this traffic**. Ship them as design polish (see Item 8), not tests.

This is why `minDays: 21` and `maxDays: 56`, and why only one experiment runs per layer at a time.

---

## Round 1 results (Oct 3–19 2026)

| Slot | Winner | Evidence |
|---|---|---|
| Homepage hero (`hero_pkg_r1`) | **v4**: "Impresión 3D en Barcelona — desde 10 €, sin pedido mínimo" | 6/8 leads; 11% lead rate vs ≤2% for others |
| Calculator title (`calc_title_r1`) | **v4**: "Precio al instante — desde 10 €" | 6 leads/46 visits vs ≤2 for others |
| Header button (`header_btn_r1`) | **continuing as `header_btn_r2`** | v3 "Precio al instante" vs v4 "Precios desde 10 €" tied — not significant |
| WhatsApp bubble (`float_label_r1`) | **v4**: "Habla con una persona real" | 26% WhatsApp click rate vs ~14% for others |

Full details: `docs/EXPERIMENT-R1-RESULTS.md`. Winning copy promoted to permanent in Prompt 17.
