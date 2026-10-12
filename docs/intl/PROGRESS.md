# Intl-native-10 Progress

## STEP 0 — Setup
- [x] s0.1 — initial build — npm ci, typecheck, test (535), build all green
- [x] s0.2 — codebase summary — cityDeliveryPages, InternationalServicePage, registry, landingPages, partsPages, i18n (8 langs), prerender routes, sitemap (107 entries), llms.txt, all scripts read
- [x] s0.3 — i18n audit — 89 missing keys in each of de/fr/it/nl/pt (xp.*, design.*, lemon.*, nofile.*, reviews.subtitle.generic)
- [x] s0.4 — SPEC.md copied to docs/intl/SPEC.md
- [x] s0.5 — PROGRESS.md created
- [x] s0.6 — commit SPEC.md + PROGRESS.md, push

## STEP 1 — UI Language Fixes
- [x] s1 — fill all 89 missing keys in de/fr/it/nl/pt; update check-i18n-new-keys.mjs to require all en.ts keys

## Config Files
- [x] cfg.intl — create src/config/intlMarkets.ts (per-market delivery times, owner-editable)
- [x] cfg.ship — create src/config/shippedCountries.ts (SHIPPED_COUNTRIES, owner-editable)

## STEP 2a — Country Hubs (≥900 words each)
- [x] 2a.de — /de/3d-druck-service — DE hub: H1, promise, how ordering works, calculator CTA, use cases, materials, price table, FAQ×6–8, links, WhatsApp CTA
- [x] 2a.nl — /nl/3d-printen-laten-maken — NL hub
- [x] 2a.fr — /fr/impression-3d-en-ligne — FR hub
- [x] 2a.it — /it/stampa-3d-online — IT hub
- [x] 2a.pt — /pt/impressao-3d-online — PT hub

## STEP 2b — City Pages (≥500 words each)
- [x] 2b.de-berlin — /de/3d-druck-berlin — hreflang pair with /3d-printing-delivery-berlin
- [x] 2b.de-muenchen — /de/3d-druck-muenchen
- [x] 2b.de-hamburg — /de/3d-druck-hamburg
- [x] 2b.nl-amsterdam — /nl/3d-printen-amsterdam — hreflang pair with /3d-printing-delivery-amsterdam
- [x] 2b.nl-rotterdam — /nl/3d-printen-rotterdam
- [x] 2b.nl-eindhoven — /nl/3d-printen-eindhoven
- [x] 2b.fr-toulouse — /fr/impression-3d-toulouse
- [x] 2b.fr-montpellier — /fr/impression-3d-montpellier
- [x] 2b.fr-lyon — /fr/impression-3d-lyon
- [x] 2b.fr-paris — /fr/impression-3d-paris — hreflang pair with /3d-printing-delivery-paris
- [x] 2b.it-milano — /it/stampa-3d-milano — hreflang pair with /3d-printing-delivery-milan
- [x] 2b.it-torino — /it/stampa-3d-torino
- [x] 2b.it-roma — /it/stampa-3d-roma — hreflang pair with /3d-printing-delivery-rome
- [x] 2b.pt-lisboa — /pt/impressao-3d-lisboa — hreflang pair with /3d-printing-delivery-lisbon
- [x] 2b.pt-porto — /pt/impressao-3d-porto

## STEP 2c — Guides (≥900 words each, Article+BreadcrumbList+FAQPage JSON-LD)
- [x] 2c.de-kosten — /de/3d-druck-kosten — price guide DE with 3 worked examples
- [x] 2c.de-datei — /de/3d-druck-datei-vorbereiten — file prep guide DE
- [x] 2c.de-materialien — /de/3d-druck-materialien — materials guide DE
- [x] 2c.nl-kosten — /nl/3d-printen-kosten — price guide NL
- [x] 2c.nl-bestand — /nl/3d-printbestand-voorbereiden — file prep guide NL
- [x] 2c.nl-materialen — /nl/3d-print-materialen — materials guide NL
- [x] 2c.fr-prix — /fr/prix-impression-3d — price guide FR
- [x] 2c.fr-fichier — /fr/preparer-fichier-impression-3d — file prep guide FR
- [x] 2c.fr-materiaux — /fr/materiaux-impression-3d — materials guide FR
- [x] 2c.it-prezzi — /it/prezzi-stampa-3d — price guide IT
- [x] 2c.it-file — /it/preparare-file-stampa-3d — file prep guide IT
- [x] 2c.it-materiali — /it/materiali-stampa-3d — materials guide IT
- [x] 2c.pt-preco — /pt/preco-impressao-3d — price guide PT
- [x] 2c.pt-ficheiro — /pt/preparar-ficheiro-impressao-3d — file prep guide PT
- [x] 2c.pt-materiais — /pt/materiais-impressao-3d — materials guide PT

## STEP 2d — Localized Spare-Part Pages (max 8)
- [x] 2d.de-bosch — /de/bosch-geschirrspuelkorb-rad — DE version of Bosch dishwasher wheel
- [x] 2d.de-gardena — /de/gardena-schlauch-adapter — DE version of Gardena hose adapter
- [x] 2d.de-vesa — /de/vesa-monitor-adapter — DE version of VESA adapter
- [x] 2d.fr-bosch — /fr/roue-panier-lave-vaisselle-bosch — FR version of Bosch wheel
- [x] 2d.fr-vesa — /fr/adaptateur-vesa-moniteur — FR version of VESA adapter
- [x] 2d.it-funnel — /it/imbuto-dosatore-caffe-58mm — IT version of coffee dosing funnel
- [x] 2d.it-vesa — /it/adattatore-vesa-monitor — IT version of VESA adapter
- [x] 2d.nl-vesa — /nl/vesa-monitor-adapter — NL version of VESA adapter

## STEP 2e — Fix Existing English City Pages
- [x] 2e.fix — remove "no minimum order", "we ship … regularly", add native page links; fix London+NY checkout note

## STEP 2f — Internal Linking
- [x] 2f.footer — footer block "Countries we ship to" linking 5 hubs from every page (localized label)
- [x] 2f.intl — /3d-printing-service links to all 5 hubs
- [x] 2f.b2b — ES and EN B2B pages link to 5 hubs in one line
- [x] 2f.inbound — scripts/report-inbound-links.mjs verified; hubs have ≥3 inbound, guides ≥4 outbound internal

## STEP 2g — Optional (only if all above ticked)
- [ ] 2g.nl-makers — /nl/geld-verdienen-met-3d-printer — NL maker guide
- [ ] 2g.fr-makers — /fr/gagner-argent-imprimante-3d — FR maker guide

## STEP 3 — Similarity Guard
- [x] s3 — create scripts/check-page-similarity.mjs; wire into build; no pair >0.35

## STEP 4 — SEO Details
- [x] s4.seo — unique title≤60, meta≤155, one H1, html lang, og:locale, canonical, hreflang, JSON-LD (WebPage+BreadcrumbList+Service+FAQPage); images with width/height and localized alt
- [x] s4.analytics — add {market, lang} props to city_page_view/international_page_view; add ld+json test

## STEP 5 — Final Verification
- [x] s5.typecheck — npm run typecheck exits 0
- [x] s5.test — npm test exits 0 (535 tests)
- [x] s5.build — npm run build exits 0 (154 succeeded, 0 failed; similarity 0/169 pairs above 0.35; 155 social-meta pages OK; 0 broken links)
- [x] s5.diff — git diff origin/main --stat -- src/lib/estimator src/lib/checkoutV3.ts src/components/estimator supabase prints nothing
- [ ] s5.screenshots — Playwright screenshots 5 hubs + 3 city pages at 390×844 + 1280×900
- [ ] s5.table — route table: language, word count, similarity score, inbound links
- [ ] s5.print — print this PROGRESS.md (all lines ticked)
