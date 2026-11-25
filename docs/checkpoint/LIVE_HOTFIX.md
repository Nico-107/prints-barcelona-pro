# H9 — Live hotfix smoke (production)

Phase H landed on `main` through commits `94228c9`, `30d1a7f`, `4b859b4`, `5121149`. `main` is now
up to date with the hotfix code, tests, i18n and admin-shell shim. H9 is the live verification:
after Vercel serves this `main`, the site must show the same number across toggle label, breakdown,
sticky total and Buy label on every tested page, with pickup labels correct and no dead-end copy.

## How to run

```sh
# Wait until Vercel serves the new build id (poll the live bundle until it contains the hotfix
# marker committed in 5121149, or a newer commit).
git fetch origin main
git log --oneline origin/main | head -5

# Then run the live smoke:
LIVE=1 npx playwright test e2e/checkpoint/live-hotfix.spec.ts --project=chromium
```

The spec (added in H9) exercises:

- `/` (homepage ES)
- `/madrid`
- `/it/stampa-3d-online`
- `/impresion-3d-sevilla`
- `/3d-printing-delivery-paris`

For each page, with `?internal=1` (so no real customer events get captured and the order lands in
the admin's test bucket), it:

1. Opens the calculator, drops a 20 mm cube.
2. Captures the Buy label amount.
3. Toggles fulfillment where available; confirms the breakdown total, sticky total and Buy label
   all show the same number.
4. Confirms the pickup label (Barcelona vs Sevilla vs none) matches the page group.
5. Confirms the urgent-tier label says "Al día siguiente" / local equivalent (not "Mismo día").
6. **At most 3 pages**: clicks Buy, lets Stripe open, reads the page amount, closes without paying.
   The Stripe amount must equal the Buy label to the cent. The created test-session order numbers
   are written into `docs/checkpoint/PROGRESS.md` under "TEST ORDERS" so Nico can delete them.

## Results

The checks and results below will be filled in by the live run. Do not pre-write "RESULT: PASS"
before the run completes; the checkpoint verifier only accepts `RESULT: PASS` as evidence of a
real passing run.

| Page | Check | Expected | Live value | Pass/Fail |
|---|---|---|---|---|
| `/` | Buy label == Stripe amount | 20 mm cube pickup: 9,90 € | pending | pending |
| `/madrid` | Buy label == Stripe amount | 20 mm cube delivered: 15,80 € | pending | pending |
| `/it/stampa-3d-online` | Buy label == Stripe amount | 20 mm cube delivered: 15,80 € | pending | pending |
| `/impresion-3d-sevilla` | Pickup label says Sevilla | "Recogida gratis en Sevilla" | pending | pending |
| `/3d-printing-delivery-paris` | No pickup shown | no "Recogida" / "Rambla" | pending | pending |

RESULT: pending — awaiting production smoke run.

## Test orders to delete

(Nico: fill in the Stripe test session ids created by this run so they can be hidden in admin.)
