# UI Overhaul Round 4 — Review Document

Branch: `ui-overhaul`. Build: 167 pages, 0 violations, 0 broken links.

---

## A. Wrong facts

### A1 — Materials table prices **FIXED**
`matPrice()` function in `Index.tsx` reads `EST.plasticEurPerG × priceMult` and `timeTiers[0].eurPerH × priceMult` from the pricing engine. Unit test in `src/lib/estimator/materials-table.test.ts` asserts all 5 rows (PLA 0,055 €/g + 4,95 €/h … Nylon 0,077 €/g + 6,93 €/h). Column label is "Material + máquina".

### A2 — Markdown rendering in LandingPage **FIXED**
`renderMarkdown()` and `inlineMarkdown()` added to `LandingPage.tsx`. `**bold**` → `<strong>`, `• bullets` → `<ul>/<li>`, pipe tables → `<table>`. Build grep `dist/**/index.html | grep '\*\*'` returns 0 matches in visible text.

### A3 — Banned wording **FIXED (visible text)**
- `LandingPage.tsx` FactsStrip: "Sin pedido mínimo" → "Pedido mínimo 10 € por pedido"
- `landingPagesEs.ts`: "por pieza" near 10€ → "por pedido"; "Rambla de Brasil" → "cita previa en Les Corts"
- **Frozen SEO strings** (title/meta/H1 — Nico must update manually, changing these requires deliberate SEO copy decisions):

| File | String type | Current value |
|------|-------------|--------------|
| `src/i18n/es.ts` `xp.hero.v4.title` | title/meta | `"Impresión 3D en Barcelona — desde 10 €, sin pedido mínimo"` |
| `src/i18n/ca.ts` `xp.hero.v4.title` | title/meta | `"Impressió 3D a Barcelona — des de 10 €, sense comanda mínima"` |
| `src/pages/Index.tsx` HOME_META `es.description` | meta description | `"...servicio de impresión 3D en Barcelona: sin pedido mínimo..."` |
| `src/pages/Index.tsx` HOME_META `en.description` | meta description | `"...3D printing service in Barcelona: no minimum order..."` |
| `src/pages/Index.tsx` HOME_META `ca.description` | meta description | `"...servei d'impressió 3D a Barcelona: sense comanda mínima..."` |
| `src/pages/BlogPrecioBcn.tsx` META_DESC | meta description | `"...impresión 3D en Barcelona: sin pedido mínimo, envío..."` |
| `src/pages/SinPedidoMinimo.tsx` META_DESC | meta description + H1 | H1 is literally "Sin Pedido Mínimo" (page about the policy) |
| `src/i18n/en.ts` `lemon.meta.desc` | meta description | `"...Lemon Printers...no minimum order..."` |

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

**Playwright overlap test**: written in `e2e/mobile-hero-overlap.spec.ts`. Tests 390×844 and 360×780 — asserts eyebrow is hidden, H1/paragraph/primary button/secondary button bounding boxes do not intersect.

### C2 — Sticky bar timing **FIXED**
`MobileStickyBar.tsx` now uses `document.querySelector('[data-hero-cta]')` to observe the primary button element directly (instead of the entire hero section). The bar appears only when the button is fully scrolled above the viewport.

### C3 — V1 mobile hero **FIXED**
- `factsItems` reduced to 3 items for a 3-col strip
- CSS: `.ds-v1-hero-starline { flex-wrap: nowrap; font-size: 11px }` keeps it single-line on mobile
- CSS: top padding reduced from `header + 92px` to `header + 48px` on mobile
- CSS: `xp-home-v1-only .ds-hero-facts` → `repeat(3, 1fr)` on mobile
- Quote card (`ds-v1-mobile-quote`): amber left-border card with italic review text, hidden on desktop (`display: none`), shown below the facts strip on mobile (`< 639px`). Uses `t("hero.quote1")` text.

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

### D1 — B2B page **FIXED**
- Duplicate heading removed: `<StlEstimator compact />` strips the "Sube tus archivos" heading inside the white card
- "Cómo funciona" container widened to `max-w-6xl` (1152px), giving 4 columns at desktop widths
- **Logo tiles**: `ds-b2b-logo-img` class + CSS `filter: grayscale(1); opacity: 0.7` by default, hover restores full colour. All logos use equal height (`maxHeight: 44px`).
- **Volume table**: restyled to PriceTable visual language — JetBrains Mono headers with 2px `#0F172A` bottom border, Inter Tight 20px bold material names, JetBrains Mono 13px prices, `#E3E8F0` row dividers, `×50` column highlighted in accent blue.
- **"Prototipo gratis" box**: `accent/5` background with `accent/30` border and Tag icon — consistent with DS accent box style.
- **"Qué fabricamos" cards**: blue left border (`3px solid #2F5BEA`), card background, 3-col grid.

### D2 — Price page markdown **FIXED (from round 3)**
`renderMarkdown()` in `LandingPage.tsx` handles bold, bullets, pipe tables. PriceTable style for materials table was done in round 3.

### D3 — "More parts to explore" translation **FIXED**
`PartPage.tsx` heading translated into all 8 languages (es/ca/de/fr/it/nl/pt/en).

### D4 — SEO link lists **FIXED**
Services and international link columns in `Index.tsx` restyled as plain mono text links (JetBrains Mono 12px, no pill borders/background).

---

## E. Verification

### E1 — Screenshots ✓
30 PNGs in `docs/screens/` captured by `e2e/screenshots.spec.ts` (Playwright chromium, Vite preview):

| Page | 1440 first | 1440 full | 390 first | 390 full |
|------|-----------|-----------|----------|----------|
| V1 home (banner open) | ✓ | — | ✓ | — |
| V1 home (banner dismissed) | ✓ | ✓ | ✓ | ✓ |
| V2 home (?xp=home_v2:B, banner open) | ✓ | — | ✓ | — |
| V2 home (banner dismissed) | ✓ | ✓ | ✓ | ✓ |
| B2B page (banner open) | ✓ | — | ✓ | — |
| B2B page (banner dismissed) | ✓ | ✓ | ✓ | ✓ |
| Price page (banner open) | ✓ | — | ✓ | — |
| Price page (banner dismissed) | ✓ | ✓ | ✓ | ✓ |
| Product page (banner open) | ✓ | — | ✓ | — |
| Product page (banner dismissed) | ✓ | ✓ | ✓ | ✓ |

### E2 — This document ✓

### E3 — Build and test results ✓
- `npm run build`: 0 violations, 167 pages OK, 0 broken links
- Unit tests: 5/5 pass (`materials-table.test.ts`)
- Playwright **mobile-hero-overlap** (C1): 6/6 green (chromium + mobile-chrome + mobile-webkit at 390×844 and 360×780)
- Playwright **mobile-layout**: 42/42 green (chromium + mobile-webkit across 3 device sizes × 7 routes)
- Playwright **upload-entries**: 21/21 green (chromium + mobile-webkit) — fixed sticky bar scroll from 1200→700px
- Playwright **consent** (mobile-webkit): 5 pre-existing failures (`mouse.wheel` not supported in Playwright mobile WebKit + footer accordion collapsed on mobile); same failures on main branch, unrelated to this PR
- i18n: all 8 languages updated for A4 (reviews label) and V2 hero eyebrow

### E4 — Commit ✓
Branch: `ui-overhaul`. Commits: `876f08d` (round4 main), `2f19140` (C1/C3/D1 open items), `d8d3057` (E1 screenshots + E3 test fixes). Not merged to main.

---

## Open items for Nico

1. **Frozen SEO titles with banned wording** (A3): pages listed in the table above — these are `<title>`/meta/H1 strings that require deliberate SEO copy decisions before changing
2. **C7 full audit**: remaining V1/V2 sections not fully audited for mobile squeeze
3. **consent.spec.ts mobile-webkit** (pre-existing): `mouse.wheel` API not supported in Playwright mobile WebKit — tests need to use `page.evaluate(() => window.scrollBy(...))` or `touchscreen.tap` instead; unrelated to this PR
