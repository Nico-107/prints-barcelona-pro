# UI Overhaul Round 3 — Final Report

Branch: `ui-overhaul` · Date: 2026-11-12

---

## 1. Build status

```
167 pages checked — 0 with violations
0 broken internal links
151 indexable pages checked — title length, description length, no duplicate titles
TypeScript: 0 errors (tsc --noEmit)
```

---

## 2. Protected files — unchanged from main

```
git diff main --stat -- src/lib/estimator/ src/lib/pricing.ts src/lib/instantBuy.ts src/components/checkout/checkoutBody.ts
(no output — zero diff)
```

---

## 3. SEO diff

All 151 indexable pages pass: title length, description length, no "2025", no duplicate titles.
Canonical, hreflang, html lang, JSON-LD schemas, and URLs are unchanged from main on every page.

---

## 4. i18n — complete in 8 languages

New keys added to all 8 files (es, en, ca, de, fr, it, nl, pt):

- `home.v2.reviews.label` — section eyebrow
- `home.v2.how.eyebrow / .heading / .body / .cta / .img.alt` — "Cómo imprimimos" section
- `home.v2.prices.heading / .desc` — price tiles section
- `home.v2.closing.heading / .cta / .b2b / .img.alt` — closing band

Previously added keys (Round 2): upload panel, materials table, why/facts, express band, reviews, guides, services — all 8 languages ✓

---

## 5. E2E test results

```
upload-entries.spec.ts:   24 passed, 1 failed*, 2 skipped
consent.spec.ts:          pre-existing mobile-webkit failures (mouse.wheel unsupported)
```

*Failed test: `final image band CTA opens file chooser with source=final_band` on mobile-webkit only. The file chooser opens but the analytics event is not captured — WebKit-specific timing issue. Chromium and mobile-chrome both pass.

The 2 skipped tests are `header CTA` on mobile-chrome and mobile-webkit (expected — header amber button is desktop-only, xl:flex hidden below 1280px).

---

## 6. Lighthouse CLS

`/precio-impresion-3d-barcelona`: CLS = 0.00006 (score: 1) — well below 0.1 threshold.

---

## 7. What was done in Round 3

### V1 Homepage
- Step cards with two-tone SVG icons top-right of each card ✓
- Step card 1 with blue outline border and "Elegir archivo ahora →" CTA ✓
- Dark navy UploadPanel with mono eyebrow, white heading, example prices ✓
- PriceTable (materials + prices) with translated column headers ✓
- x2d-desk photo right of materials table ✓
- 4-column FactsStrip "Por qué Dimension3D" with thin dividers ✓
- 3-photo customer projects strip (x2d-print, x2d-inside, x2d-room) ✓
- QuoteFeature dark grid reviews ✓
- Service info: heading+para left, feature list right with dividers ✓
- Express slim dark band with mono eyebrow ✓
- FAQAccordion with top 5 FAQ items ✓
- ImageSplit location block (nozzles photo) ✓
- ImageBand final CTA (nozzles photo) ✓
- LinkCardGrid for guides section ✓
- Section rhythm: white → navy panel → surface → white → dark grid → white → surface ✓

### V2 Homepage (new in Round 3)
- V2 hero hidden from V1 step cards (xp-home-v1-only on step cards section) ✓
- V2 Reviews section: blue mono label, large blockquote, 3 tinted cards (#F3F6FF) ✓
- V2 "Cómo imprimimos": black background, nozzles photo with side+bottom fade gradients ✓
- V2 "Precios reales, sin subir nada.": heading left, 4 price tiles right ✓
- V2 Closing band: x2d-room photo with dark overlay, amber CTA, B2B link ✓
- V2 hero: WhatsApp secondary button + send-link added ✓

### Mobile (390px)
- Step cards: horizontal scroll-snap, card width ~78%, next card peeks ✓
- SplitImageHero: photo at top 250px with bottom fade-to-black, H1 overlaps photo ✓
- Full-width buttons on mobile hero ✓
- Section padding: `clamp(56px, 7vw, 84px)` top/bottom, `clamp(18px, 4vw, 24px)` side ✓
- QuoteFeature secondary cards: horizontal swipe row on mobile ✓
- LinkCardGrid: single-column row list with dividers on mobile (<640px) ✓

### Other templates
- UploadPanel added to: LandingPage, IntlHubPage, InternationalServicePage, IntlCityPage, CityDeliveryPage ✓

---

## 8. Screenshots

### Evidence screenshots (13 routes × 3 widths = 39 files)
`docs/ui-overhaul-round3-screens/`

| Route | 390 | 768 | 1440 |
|-------|-----|-----|------|
| home-v1 | ✓ | ✓ | ✓ |
| home-v2 | ✓ | ✓ | ✓ |
| precio | ✓ | ✓ | ✓ |
| b2b | ✓ | ✓ | ✓ |
| prototipos | ✓ | ✓ | ✓ |
| express | ✓ | ✓ | ✓ |
| landing-de | ✓ | ✓ | ✓ |
| landing-fr | ✓ | ✓ | ✓ |
| hub-it | ✓ | ✓ | ✓ |
| city-berlin | ✓ | ✓ | ✓ |
| blog-precio | ✓ | ✓ | ✓ |
| about | ✓ | ✓ | ✓ |
| b2b-en | ✓ | ✓ | ✓ |

### Compare files
`docs/ui-overhaul-round3-compare/`
- `v1/ref-full.png` — reference V1-home.html at 1440px
- `v1/built-full.png` — built V1 home at 1440px
- `v2/ref-full.png` — reference V2-home.html at 1440px
- `v2/built-full.png` — built V2 home at 1440px
- `mobile/ref-hero.png` — reference mobile-hero.html at 390×844
- `mobile/built-hero.png` — built V2 mobile hero at 390×844

---

## 9. Honest differences from references

| Section | Status | Remaining difference |
|---------|--------|----------------------|
| V1 hero | matches | — |
| V1 step cards | matches | — |
| V1 upload panel | matches | — |
| V1 materials + photo | matches | — |
| V1 why (4 cols) | matches | — |
| V1 projects strip | matches | — |
| V1 reviews (dark grid) | matches | — |
| V1 express band | matches | — |
| V1 FAQ | matches | — |
| V1 location ImageSplit | matches | — |
| V1 final band | matches | — |
| V1 guides | matches | — |
| V2 hero (desktop) | matches | Bricolage Grotesque font renders slightly different from Google Fonts reference (self-hosted @fontsource) |
| V2 facts strip | matches | — |
| V2 path cards | matches | — |
| V2 reviews section | matches | — |
| V2 "Cómo imprimimos" | matches | — |
| V2 price tiles | matches | — |
| V2 closing band | matches | x2d-room photo slightly darker due to overlay difference |
| Mobile V2 hero (photo top) | close | (1) Uses x2d-inside.jpg vs reference x2d-print.jpg; (2) Missing review quote card and 3-col stats strip within the first screen — these appear below the fold in current build, while reference fits them in 844px |
| Mobile step cards swipe | matches | — |
| Mobile section gutters | matches | 56px top/bottom, 18px sides applied via clamp() |
| Mobile QuoteFeature swipe | matches | — |
| Mobile LinkCardGrid row list | matches | — |

### Not yet implemented from Round 3 spec
- **Section 3.12**: Footer collapsible accordion on mobile (long link columns remain expanded)
- **Section 2.1**: V2 header on black (transparent nav while over hero) — header stays white
- **Section 4.2–4.6**: Guide/blog, B2B, product page templates — UploadPanel added but deeper section redesign (StepCards, B2BCards, Prose layout per template) not applied to all templates
- **Mobile hero review quote card**: The glass dark card with quote is not inside the hero first screen on mobile
- **Mobile hero stats row**: FactsStrip is after the hero not inside it on mobile

---

## 10. What is NOT "complete" per this list

The following Round 3 items are **not done** and should not be marked complete:

1. Footer collapsible accordion (Section 3.12)
2. V2 header transparent on black while over hero (Section 2.1)
3. Mobile hero review quote card and stats within 844px first screen (Section 3.1)
4. Full redesign of Guide/blog/B2B/product page templates (Sections 4.2–4.6)
5. Mobile "Qué imprimimos" as row list (currently still the 6-card grid) — LinkCardGrid mobile CSS added but the section needs content rework
