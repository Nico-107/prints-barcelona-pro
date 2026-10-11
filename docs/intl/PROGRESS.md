# Intl-native-10 Progress

## STEP 0 — Setup
- [x] s0.1 — initial build — npm ci, typecheck, test (535), build all green
- [x] s0.2 — codebase summary — cityDeliveryPages, InternationalServicePage, registry, landingPages, partsPages, i18n (8 langs), prerender routes, sitemap (107 entries), llms.txt, all scripts read
- [x] s0.3 — i18n audit — 89 missing keys in each of de/fr/it/nl/pt (xp.*, design.*, lemon.*, nofile.*, reviews.subtitle.generic)
- [x] s0.4 — SPEC.md copied to docs/intl/SPEC.md
- [x] s0.5 — PROGRESS.md created
- [ ] s0.6 — commit SPEC.md + PROGRESS.md, push

## STEP 1 — UI Language Fixes
- [ ] s1 — fill all 89 missing keys in de/fr/it/nl/pt; update check-i18n-new-keys.mjs to require all en.ts keys

## Config Files
- [ ] cfg.intl — create src/config/intlMarkets.ts (per-market delivery times, owner-editable)
- [ ] cfg.ship — create src/config/shippedCountries.ts (SHIPPED_COUNTRIES, owner-editable)

## STEP 2a — Country Hubs (≥900 words each)
- [ ] 2a.de — /de/3d-druck-service — DE hub: H1, promise, how ordering works, calculator CTA, use cases, materials, price table, FAQ×6–8, links, WhatsApp CTA
- [ ] 2a.nl — /nl/3d-printen-laten-maken — NL hub
- [ ] 2a.fr — /fr/impression-3d-en-ligne — FR hub
- [ ] 2a.it — /it/stampa-3d-online — IT hub
- [ ] 2a.pt — /pt/impressao-3d-online — PT hub

## STEP 2b — City Pages (≥500 words each)
- [ ] 2b.de-berlin — /de/3d-druck-berlin — hreflang pair with /3d-printing-delivery-berlin
- [ ] 2b.de-muenchen — /de/3d-druck-muenchen
- [ ] 2b.de-hamburg — /de/3d-druck-hamburg
- [ ] 2b.nl-amsterdam — /nl/3d-printen-amsterdam — hreflang pair with /3d-printing-delivery-amsterdam
- [ ] 2b.nl-rotterdam — /nl/3d-printen-rotterdam
- [ ] 2b.nl-eindhoven — /nl/3d-printen-eindhoven
- [ ] 2b.fr-toulouse — /fr/impression-3d-toulouse
- [ ] 2b.fr-montpellier — /fr/impression-3d-montpellier
- [ ] 2b.fr-lyon — /fr/impression-3d-lyon
- [ ] 2b.fr-paris — /fr/impression-3d-paris — hreflang pair with /3d-printing-delivery-paris
- [ ] 2b.it-milano — /it/stampa-3d-milano — hreflang pair with /3d-printing-delivery-milan
- [ ] 2b.it-torino — /it/stampa-3d-torino
- [ ] 2b.it-roma — /it/stampa-3d-roma — hreflang pair with /3d-printing-delivery-rome
- [ ] 2b.pt-lisboa — /pt/impressao-3d-lisboa — hreflang pair with /3d-printing-delivery-lisbon
- [ ] 2b.pt-porto — /pt/impressao-3d-porto

## STEP 2c — Guides (≥900 words each, Article+BreadcrumbList+FAQPage JSON-LD)
- [ ] 2c.de-kosten — /de/3d-druck-kosten — price guide DE with 3 worked examples
- [ ] 2c.de-datei — /de/3d-druck-datei-vorbereiten — file prep guide DE
- [ ] 2c.de-materialien — /de/3d-druck-materialien — materials guide DE
- [ ] 2c.nl-kosten — /nl/3d-printen-kosten — price guide NL
- [ ] 2c.nl-bestand — /nl/3d-printbestand-voorbereiden — file prep guide NL
- [ ] 2c.nl-materialen — /nl/3d-print-materialen — materials guide NL
- [ ] 2c.fr-prix — /fr/prix-impression-3d — price guide FR
- [ ] 2c.fr-fichier — /fr/preparer-fichier-impression-3d — file prep guide FR
- [ ] 2c.fr-materiaux — /fr/materiaux-impression-3d — materials guide FR
- [ ] 2c.it-prezzi — /it/prezzi-stampa-3d — price guide IT
- [ ] 2c.it-file — /it/preparare-file-stampa-3d — file prep guide IT
- [ ] 2c.it-materiali — /it/materiali-stampa-3d — materials guide IT
- [ ] 2c.pt-preco — /pt/preco-impressao-3d — price guide PT
- [ ] 2c.pt-ficheiro — /pt/preparar-ficheiro-impressao-3d — file prep guide PT
- [ ] 2c.pt-materiais — /pt/materiais-impressao-3d — materials guide PT

## STEP 2d — Localized Spare-Part Pages (max 8)
- [ ] 2d.de-bosch — /de/geschirrspueler-rad-bosch — DE version of Bosch dishwasher wheel
- [ ] 2d.de-gardena — /de/gardena-schlauch-adapter — DE version of Gardena hose adapter
- [ ] 2d.de-vesa — /de/vesa-monitor-adapter — DE version of VESA adapter
- [ ] 2d.fr-bosch — /fr/roue-panier-lave-vaisselle-bosch — FR version of Bosch wheel
- [ ] 2d.fr-vesa — /fr/adaptateur-vesa-moniteur — FR version of VESA adapter
- [ ] 2d.it-funnel — /it/dosatore-caffe-58mm — IT version of coffee dosing funnel
- [ ] 2d.it-vesa — /it/adattatore-vesa-monitor — IT version of VESA adapter
- [ ] 2d.nl-vesa — /nl/vesa-monitor-adapter — NL version of VESA adapter (justified: popular home-office product in NL)

## STEP 2e — Fix Existing English City Pages
- [ ] 2e.fix — remove "no minimum order", "we ship … regularly", add native page links; fix London+NY checkout note

## STEP 2f — Internal Linking
- [ ] 2f.footer — footer block "Countries we ship to" linking 5 hubs from every page (localized label)
- [ ] 2f.intl — /3d-printing-service links to all 5 hubs
- [ ] 2f.b2b — ES and EN B2B pages link to 5 hubs in one line
- [ ] 2f.inbound — run scripts/report-inbound-links.mjs; every new page ≥3 inbound, ≥4 outbound internal

## STEP 2g — Optional (only if all above ticked)
- [ ] 2g.nl-makers — /nl/geld-verdienen-met-3d-printer — NL maker guide
- [ ] 2g.fr-makers — /fr/gagner-argent-imprimante-3d — FR maker guide

## STEP 3 — Similarity Guard
- [ ] s3 — create scripts/check-page-similarity.mjs; wire into build; no pair >0.35

## STEP 4 — SEO Details
- [ ] s4.seo — unique title≤60, meta≤155, one H1, html lang, og:locale, canonical, hreflang, JSON-LD (WebPage+BreadcrumbList+Service+FAQPage); images with width/height and localized alt
- [ ] s4.analytics — add {market, lang} props to city_page_view/international_page_view; add ld+json test

## STEP 5 — Final Verification
- [ ] s5.typecheck — npm run typecheck exits 0
- [ ] s5.test — npm test exits 0 (show counts)
- [ ] s5.build — npm run build exits 0 (last 40 lines, similarity check passing)
- [ ] s5.diff — git diff origin/main --stat -- src/lib/estimator src/lib/checkoutV3.ts src/components/estimator supabase prints nothing
- [ ] s5.screenshots — Playwright screenshots 5 hubs + 3 city pages at 390×844 + 1280×900
- [ ] s5.table — route table: language, word count, similarity score, inbound links
- [ ] s5.print — print this PROGRESS.md (all lines ticked)
