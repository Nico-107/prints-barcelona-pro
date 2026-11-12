# UI Overhaul Plan — Dimension3D

Branch: `ui-overhaul` from `main`

## Templates found

| Template | File | Used by |
|---|---|---|
| Homepage | `pages/Index.tsx` | /, /ca/, /3d-printing-barcelona |
| Landing/Service | `pages/LandingPage.tsx` | ~60 service pages (all languages) |
| B2B | `pages/B2BPage.tsx` | business pages |
| International Hub | `pages/IntlHubPage.tsx` | /de/, /fr/, /it/, /nl/, /pt/ |
| International City | `pages/IntlCityPage.tsx` | city-delivery pages by intl lang |
| International Guide | `pages/IntlGuidePage.tsx` | material/guide pages by intl lang |
| International Part | `pages/IntlPartPage.tsx` | part pages by intl lang |
| City Delivery | `pages/CityDeliveryPage.tsx` | Barcelona-to-* pages |
| Blog Index | `pages/Blog.tsx` | /blog |
| Blog Posts | `pages/Blog*.tsx` | /blog/* |
| Catalog | `pages/Catalog.tsx` | /catalogo |
| Catalog Product | `pages/CatalogProduct.tsx` | /catalogo/* |
| Part | `pages/PartPage.tsx` | /piezas/* |
| Design Request | `pages/DesignRequest.tsx` | /disena-tu-pieza-3d etc. |
| Track | `pages/Track.tsx` | /track |
| File Checker | `pages/FileChecker.tsx` | /verificador-archivo-3d |
| Lemon | `pages/Lemon.tsx` | /lemon (noindex) |
| Privacy/Legal | `pages/Privacy.tsx` | /privacidad |
| 404 | `pages/NotFound.tsx` | * |
| Students | `pages/StudentsBcn.tsx` | /impresion-3d-estudiantes |
| Sin Pedido Mínimo | `pages/SinPedidoMinimo.tsx` | /impresion-3d-sin-pedido-minimo |
| Repuesto | `pages/RepuestoDescatalogado.tsx` | /repuesto-descatalogado |
| EmpresasBcn | `pages/EmpresasBcn.tsx` | /impresion-3d-empresas-barcelona |
| Maker Guide | `pages/MakerGuide.tsx` | /guia-para-makers |

## Shared components

| Existing | New DS mapping |
|---|---|
| `components/Hero.tsx` | `ds/Hero` centered variant (V1); split-image variant (V2 only) |
| `components/HowItWorks.tsx` | `ds/StepCards` (card 1 is CTA) |
| `components/StlEstimator.tsx` | wrapped by `ds/UploadPanel` (outer styling only) |
| `components/Materials.tsx` | `ds/PriceTable` + `ds/ImageSplit` |
| `components/Reviews.tsx` | `ds/QuoteFeature` |
| `components/BusinessCTA.tsx` | `ds/B2BCards` |
| `components/WhatCanWePrint.tsx` | `ds/LinkCardGrid` |
| `components/CallToAction.tsx` | `ds/FinalCta` |
| `components/Header.tsx` | restyled in place |
| `components/Footer.tsx` | restyled in place |
| `components/FAQ.tsx` | `ds/FAQ` accordion |
| `components/WhyChooseUs.tsx` | `ds/FounderSection` + prose |

## New DS components to build (src/components/ds/)

1. `tokens.ts` — re-exports token values as JS constants for use in inline styles
2. `Hero.tsx` — `centered` (V1) and `split-image` (V2) variants
3. `FactsStrip.tsx` — 3–4 number/label cells
4. `StepCards.tsx` — numbered step cards, card 1 is a CTA
5. `UploadPanel.tsx` — dark panel wrapper; content slot for the estimator
6. `LinkCardGrid.tsx` — full-link cards with arrow
7. `PriceTable.tsx` — materials table, mono price column
8. `PriceTiles.tsx` — example-price tiles (V2)
9. `ImageSplit.tsx` — image left/right, text other side
10. `ImageBand.tsx` — full-width dark image with text + button, fade overlays
11. `QuoteFeature.tsx` — 1 large quote + up to 3 small
12. `PathCards.tsx` — 3 large coloured choice cards (V2)
13. `B2BCards.tsx` — 2 business cards
14. `FounderSection.tsx` — Nico section
15. `FinalCta.tsx` — final band CTA
16. `Breadcrumbs.tsx` — breadcrumb nav
17. `FAQAccordion.tsx` — FAQ accordion with schema
18. `Prose.tsx` — long-text styles
19. `Badge.tsx` — mono label
20. `SectionReveal.tsx` — fade/slide 12 px on enter viewport

## Homepage V1 section order

1. Header
2. Hero (centered, dark grid, no image)
3. StepCards ("Cómo funciona", card 1 = upload CTA)
4. UploadPanel (dark panel, estimator inside)
5. LinkCardGrid ("Qué imprimimos", 6 service cards)
6. PriceTable + ImageSplit (materials table + x2d-desk.jpg)
7. QuoteFeature (dark grid, reviews)
8. B2BCards ("Para empresas")
9. FounderSection ("Hola soy Nico")
10. Keep existing: FAQ, LocationMap, SEO grids (restyled)
11. FinalCta (ImageBand, x2d-nozzles.jpg)
12. Footer

## Homepage V2 section order

1. Header (on black background)
2. Hero split-image (black, x2d-inside.jpg right)
3. FactsStrip (navy background)
4. PathCards ("¿Por dónde empezamos?")
5. UploadPanel (calculator)
6. QuoteFeature (light tinted cards)
7. ImageBand ("Cómo imprimimos", black, x2d-nozzles.jpg)
8. PriceTiles ("Precios reales")
9. Keep existing: FAQ, SEO grids (restyled)
10. FinalCta (ImageBand, x2d-room.jpg)
11. Footer

## Experiment: xp_home_v2

- Layer: `home_body` (new layer: `home_hero`)
- Variants: `control` / `v2`
- Pages: /, /ca/, /3d-printing-barcelona, all language hubs (/)
- Assignment: pre-paint script (same as other experiments)
- CSS: `html[data-xp-home-v2="v2"] .xp-v1-only { display:none }` etc.
- Canonical, title, meta: identical in both variants

## Risky items

1. **Upload entry point** — `openFilePicker(source)` must reuse the existing file input from StlEstimator. Need to identify how to trigger it from outside the component.
2. **Font preload** — Inter (already loaded from Google), Inter Tight and JetBrains Mono now self-hosted. Need to remove Google Fonts runtime load and preload the two key weights.
3. **Image AVIF/WebP** — Need to generate responsive images for x2d-* files. Will use `vite-imagetools` or manual conversion.
4. **i18n for 8 languages** — All new strings must be added to all 8 language files.
5. **SEO diff** — Must verify that prerendered HTML head is byte-identical on the branch vs main for 20 URLs.

## Build order

1. ✅ Create branch
2. ✅ Copy reference images to public/img/x2d/
3. ✅ Install @fontsource packages
4. Update Tailwind config (new ds-* tokens)
5. Update index.css (font imports, token updates)
6. Update index.html (color-scheme meta, font preloads)
7. Build DS components
8. Restyle Header + Footer
9. Build Homepage V1 (Index.tsx refactor)
10. Add V2 experiment + Homepage V2
11. Roll out to other templates
12. Mobile hero + sticky bar
13. QoL fixes
14. Analytics additions
15. Build + test
16. Screenshots + Lighthouse
