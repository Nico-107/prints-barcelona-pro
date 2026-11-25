# Q7 / R6 — live smoke after the merge

Runs after `checkpoint/2026-11-25` merges into `main` and Vercel serves the new build.

```sh
# From Nico's Mac:
npm run smoke:live
```

The `smoke:live` script invokes the live specs (`e2e/checkpoint/live-hotfix.spec.ts` and
the LIVE-guarded specs in `tests/`) against production with `LIVE=1`, `?internal=1`, at
most 3 checkout redirects that read the Stripe amount and close.

## Pages

- `/`
- `/impresion-3d-sevilla`
- `/madrid`
- `/it/stampa-3d-online`
- `/3d-printing-delivery-paris`

## Checks

For each page:

1. Home / page renders without console errors.
2. The calculator shows the expected price for a 20 mm cube.
3. Fulfillment labels match the page group (Barcelona pickup, Sevilla pickup, or none).
4. Urgent-tier label says the next-day phrasing in the page language.
5. Three pages open Stripe; the amount matches the Buy label to the cent. The test
   session is closed without paying and its session id is written below.

## Results

(To be filled in by the live run. `RESULT: PASS` is written here only when every line
above succeeds and every created test session is recorded.)

RESULT: pending

## Test orders to delete

(List the created session ids so Nico can hide them from the admin.)
