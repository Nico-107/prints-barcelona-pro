# Estimator v3

## What it does
`analyzeTriangles()` reads an STL once and returns, for each of the 6 axis-aligned print orientations: surface split (up / down / side),
height, footprint, and the projected area of faces that would need support. `estimatePart()` turns that into plastic cm3, support cm3,
grams and print time (seconds); `estimatePart(..., orientation: 'auto')` picks the cheapest orientation that fits the plate.
`priceOrder()` prices a whole order: EUR 8 setup once, EUR 0.05 per gram x material factor, print time charged in tiers on the ORDER's
total hours (first 3 h EUR 4.50/h, 3-8 h EUR 3.50/h, beyond 8 h EUR 2.50/h) x material factor, EUR 10 minimum, urgency multiplier on
the total (express x1.25, urgent x1.6), one line per part, lines always add up to the total. Instant buy up to EUR 100.

## The model (all constants live in `EST` in core.ts — one place)
- shell volume = side area x walls x 0.4425 mm + up area x 1.0 mm + down area x 0.6 mm (capped at the part volume)
- plastic = (0.9296 x shell + (volume - shell) x infill x 0.905) / 1000 cm3
- supports = 0.3256 cm3 per cm2 of projected overhang area (faces tilted > ~32 deg past vertical-down, not touching the bed);
  support print time = 783 s per support cm3
- print time (s) = 790.4 + 71.35 x (side area x walls / 1000) + 284.6 x infill_cm3 + 699.1 x infill_cm3 x infill + 2.52 x (height / 0.2 mm)
  then (time - 790.4) x material time factor x quality factor + 790.4 (+ supports). 790.4 s is the fixed per-plate overhead.
- quality factors (measured on 4 parts): fast 0.91, standard 1.00, fine 1.22, high 1.51, ultra 2.19. Material time factors measured
  with the Bambu profiles: TPU 1.29, ABS 1.08, everything else 1.00.
- plates: parts are packed by footprint (37,000 mm2 usable per 256x256 plate); the fixed overhead is charged once per plate.

## Where the numbers come from
Fitted on real OrcaSlicer slices (Bambu Lab X2D 0.4 nozzle, 0.20 mm Standard, Bambu PLA Basic, gyroid, tree supports at 30 deg) of 65
shapes (24 geometric, 14 organic, 14 figurines, 2 Meshy foxes, 2 overhang tests, 9 real customer parts) plus 30 extra slices at
5/30/50% infill with 3-4 walls (95 samples). Print-time coefficients are non-negative least squares on RELATIVE error, with the
owner's real parts weighted x3.
Leave-one-shape-out (every number out-of-sample): plastic 5.1% mean error, print time 21% (16% on the owner's real parts),
price vs a fair price 6.6% mean (54 of 65 within 10%, 60 within 15%, 64 within 25%).
The pricing rates reproduce the prices the owner really charged on 21 completed jobs: median ratio 0.98.

## Known limitations (be honest in the UI and in reviews)
- Print-time error is larger than plastic error (+-15-20% typical, up to +-40% on odd parts). Price error is smaller (~7%).
- Closed hollow bodies with an ENCLOSED internal cavity are over-estimated (+60% on the test box).
- A single STL with many separate small bodies (combs, plates of parts) is under-estimated on time (about -50%).
- Very long complex prints (7 h enclosure) are under-estimated (-24% price).
- Not validated: infill above 50%, more than 4 walls, layer heights outside the 4 measured presets, multi-colour (purge waste).
- Orientation search uses only the 6 axis-aligned orientations. Supports assume tree supports at a 30 deg threshold.

## How to recalibrate
Record the REAL grams and hours of finished jobs (Admin, Prompt 2: "Actual results"), export the calibration CSV, and refit the
constants in `EST` (plastic: 3 numbers, time: 5 numbers, support: 2 numbers). Keep the accuracy gate green.
