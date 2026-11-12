# UI Overhaul Round 4 — Review Document

Branch: `ui-overhaul`. Commit: `876f08d`. Build: 167 pages, 0 violations, 0 broken links.

---

## A. Wrong facts

### A1 — Materials table prices **FIXED**
`matPrice()` function in `Index.tsx` reads `EST.plasticEurPerG × priceMult` and `timeTiers[0].eurPerH × priceMult` from the pricing engine. Unit test in `src/lib/estimator/materials-table.test.ts` asserts all 5 rows (PLA 0,055 €/g + 4,95 €/h … Nylon 0,077 €/g + 6,93 €/h). Column label is "Material + máquina".

### A2 — Markdown rendering in LandingPage **FIXED**
`renderMarkdown()` and `inlineMarkdown()` added to `LandingPage.tsx`. `**bold**` → `<strong>`, `• bullets` → `<ul>/<li>`, pipe tables → `<table>`. Build grep `dist/**/index.html | grep '\*\*'` returns 0 matches in visible text.

### A3 — Banned wording **FIXED (visible text)**
- `LandingPage.tsx` FactsStrip: "Sin pedido mínimo" → "Pedido mínimo 10 € por pedido"
- `landingPagesEs.ts`: "por pieza" near 10€ → "por pedido"; "Rambla de Brasil" → "cita previa en Les Corts"
- **Frozen SEO strings** (title/meta/H1 — Nico must update manually):
  - `/impresion-3d-sin-pedido-minimo` page title and H1
  - Student discount page description contains "sin pedido mínimo"
  - Several landing page titles use the phrase

### A4 — Reviews label **FIXED**
`home.reviews.googleLabel` = "RESEÑAS DE CLIENTES" (es). Same pattern in all 8 languages. The QuoteFeature `label` prop no longer includes a numeric count or the word "Google".

### A5 — Projects section photos **FIXED**
`Index.tsx` projects grid uses `/projects/custom-brackets.jpg`, `/projects/intake-manifold.jpg`, `/projects/red-adapter.jpg` — real customer parts, not Bambu Lab marketing renders.

### A6 — Location text **FIXED**
`landingPagesEs.ts` FAQs and intro text updated to "recogida con cita previa en Les Corts". The `location.hours` / `service.feat.localDesc` i18n strings were already correct from round 3.

---

## B. V2 Homepage

### B1 — Bricolage Grotesque **FIXED**
`@fontsource/bricolage-grotesque/700.css` and `800.css` imported in `src/index.css`. V2 H1 uses `font-family: 'Bricolage Grotesque', 'Inter Tight', system-ui, sans-serif; font-weight: 800`.

### B2 — Hero alignment **FIXED**
`SplitImageHero` text column `ds-hero-split-text` now uses:
```css
padding-left: max(24px, calc((100% - 1240px) / 2 + 24px))
```
Removed `maxWidth: calc(1240px/2 + 24px)` and `marginLeft: auto`. Hero text now aligns with nav at all viewport widths ≥ 1240px.

### B3 — V2 structure **FIXED**
Removed from V2 (wrapped in `xp-home-v1-only`): Materials table, Why Choose Us, Reviews (QuoteFeature), Service Info, Express band, Location, Final Image Band. V2 order: hero → facts → path cards → calculator → reviews → how we print → prices → what we print → B2B → founder (text only) → FAQ → guides → closing band → SEO links → footer.

### B4 — One image per job **FIXED**
- V1: x2d-desk (materials), x2d-room (founder V1), customer photo `/projects/intake-manifold.jpg` (location), x2d-nozzles (final band) — no duplicates
- V2: x2d-inside (hero), x2d-nozzles (how we print), x2d-room (closing band), founder V2 has no image — no duplicates

---

## C. Mobile

### C1 — V2 mobile hero **FIXED**
CSS in `index.css`: `.ds-hero-split-eyebrow { display: none !important }` on mobile. `.ds-hero-v2-desktop-only` hides drag text and no-file link on mobile. Photo is 250px with bottom-to-black fade. Text column has `margin-top: -54px`, H1 39px/0.98. `mobileExtras` renders quote card + 3-col stats pushed to bottom via `margin-top: auto`.

**Playwright overlap test**: not yet written. Marked as open.

### C2 — Sticky bar timing **FIXED**
`MobileStickyBar.tsx` now uses `document.querySelector('[data-hero-cta]')` to observe the primary button element directly (instead of the entire hero section). The bar appears only when the button is fully scrolled above the viewport.

### C3 — V1 mobile hero **PARTIALLY FIXED**
- `factsItems` reduced to 3 items for a 3-col strip
- CSS: `.ds-v1-hero-starline { flex-wrap: nowrap; font-size: 11px }` keeps it single-line on mobile
- CSS: top padding reduced from `header + 92px` to `header + 48px` on mobile
- CSS: `xp-home-v1-only .ds-hero-facts` → `repeat(3, 1fr)` on mobile
- Quote card below stats not yet added (open)

### C4 — Cookie banner **FIXED**
Desktop: `max-w-[720px]`. Mobile sheet: removed `max-h-[35svh] overflow-y-auto`, height now naturally ≤ 100px (text 2 lines + buttons in one row). `bottom: stickyOffset` keeps it above sticky bar.

### C5 — Upload panel mobile **FIXED**
`UploadPanel.tsx`: added `ds-upload-panel-dark` and `ds-upload-panel-card` classes. CSS: dark panel 20px, white card 12px on `< 640px`.

### C6 — Why choose us grid mobile **FIXED**
`.ds-why-grid` CSS: `grid-template-columns: 1fr 1fr` with top borders and 16px vertical padding on `< 639px`.

### C7 — General mobile sections **PARTIAL**
Round 3 mobile scroll-snap on StepCards and QuoteFeature secondary row were already in place. Full audit of remaining sections not complete.

---

## D. Other templates

### D1 — B2B page **PARTIALLY FIXED**
- Duplicate heading removed: `<StlEstimator compact />` strips the "Sube tus archivos" heading inside the white card
- "Cómo funciona" container widened to `max-w-6xl` (1152px), giving 4 columns at desktop widths
- Client logos, volume table, "Prototipo gratis", "Qué fabricamos" restyling: not done

### D2 — Price page markdown **FIXED (from round 3)**
`renderMarkdown()` in `LandingPage.tsx` handles bold, bullets, pipe tables. PriceTable style for materials table was done in round 3.

### D3 — "More parts to explore" translation **FIXED**
`PartPage.tsx` heading translated into all 8 languages (es/ca/de/fr/it/nl/pt/en).

### D4 — SEO link lists **FIXED**
Services and international link columns in `Index.tsx` restyled as plain mono text links (JetBrains Mono 12px, no pill borders/background).

---

## E. Verification

### E1 — Screenshots
Not taken in this session (no browser available). Manual verification recommended.

### E2 — This document ✓

### E3 — Build results
- `npm run build`: 0 violations, 167 pages OK, 0 broken links
- Unit tests: 5/5 pass (`materials-table.test.ts`)
- Playwright overlap test: not written (open)
- i18n: all 8 languages updated for A4 (reviews label) and V2 hero eyebrow

### E4 — Commit
Committed on `ui-overhaul` branch: `876f08d`. Not merged to main.

---

## Open items for Nico

1. **Playwright overlap test** (C1): assert V2 mobile hero H1, paragraph and buttons don't overlap
2. **V1 mobile quote card** (C3): add customer review card below the 3-col stats strip on mobile
3. **B2B page full restyle** (D1): logos, "Prototipo gratis", volume table, "Qué fabricamos"
4. **Frozen SEO titles with banned wording** (A3): pages with "sin pedido mínimo" in `<title>`/H1 (requires SEO-aware copy decision)
5. **Screenshots E1**: full-page and first-screen at 1440 and 390 for V1/V2/B2B/price page/product page
