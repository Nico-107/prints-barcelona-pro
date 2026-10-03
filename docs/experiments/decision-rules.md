# Experiment Decision Rules

## When a winner can be called

A version wins Version 1 only if **both** conditions hold:

1. **Superiority threshold**: the version's estimated advantage over Version 1 has at least
   90% probability of being a genuine improvement (Bayesian posterior or frequentist p < 0.10
   one-sided), **after correcting for the three-way multiple-comparison** (comparing V2, V3,
   and V4 each against V1 — use a Bonferroni or Holm correction, i.e. require p < 0.033 per
   comparison at the 90% family-wise level).

2. **Guardrail not lower**: the version's guardrail CVR (`quote_submitted` +
   `instant_checkout_initiated` + `design_request_submitted` per exposed session) is not
   meaningfully lower than Version 1's (no statistically significant decrease at p < 0.10).

No winner is called before the `endsOn` date (2026-12-28) regardless of results.

## Checkpoints

| Week | Date | Purpose |
|---|---|---|
| 3 | 2026-10-24 | Safety only: check for guardrail drops and SRM (sample-ratio mismatch). Stop an arm if guardrail is clearly hurt. |
| 6 | 2026-11-14 | Safety + signal: are any versions clearly winning? Do not call a winner yet. |
| 9 | 2026-12-05 | Pre-decision review: estimate power. If no version looks likely to clear the bar, plan to keep Version 1. |
| End | 2026-12-28 | Final decision. endsOn triggers automatically; everyone sees Version 1 until cleanup. |

## What happens if nothing clears the bar

Version 1 stays. The experiment ends on 2026-12-28, all visitors revert to Version 1
automatically (no deploy needed). Schedule cleanup within two weeks of the end date.

## Cleanup plan (after end date)

For each experiment where Version 1 is kept (or after any decision):

1. **Remove losing versions' markup**: delete the `<div data-xp-slot="…" data-xp-v="2|3|4">` blocks from the relevant component. Keep only `data-xp-v="1"` if desired, or unwrap it to a plain element.
2. **Remove winning version's slot wrapper**: if a non-V1 version won, replace V1 markup with the winner's copy as the new plain default, and remove all slot divs.
3. **Remove the experiment from `experimentsConfig.ts`**: delete the entry. The Vite plugin will stop generating its CSS/JS snippet on the next build.
4. **Remove the i18n keys**: delete the `xp.<test>.*` keys from all language files.
5. **Remove the `useExperiment` call** from the component. Remove `wasExposureFired` / `markExposureFired` calls for that experiment.
6. **Rebuild and verify**: confirm the head snippet no longer references the removed experiment, `<h1>` count and layout unchanged, no console errors.
7. **Archive this doc**: move `docs/experiments/README.md` entries for that test to an `## Archived` section with the final result and date.

## Analysis exclusions (always apply)

- Exclude sessions where `is_internal = true`
- Exclude sessions where `xp_forced = true`
- Exclude sessions where `xp_<id> = "n/a"` (unsupported language; no exposure fired)
