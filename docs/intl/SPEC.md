# Prompt 10 — Native international pages for Dimension3D

Run this file with the /goal line Claude gave you. Branch: intl-native-10. Never main.

You are going to rebuild Dimension3D's international pages so they rank in each country's own language. This is a long, unattended run started with /goal. Work through every step in order without waiting for me.

BRANCH AND GIT
 - git fetch origin && git checkout -b intl-native-10 origin/main. Push to this branch ONLY (git push -u origin intl-native-10). Never main, never merge, never open a PR.
 - Stage only the files you changed on purpose (git add <paths>). NEVER git add -A or git add . — never commit .claude/, supabase/.temp/, .env*, dist/.
 - Commit and push after every finished page ("intl: <slug>"), so a usage-limit pause loses nothing.

HARD RULES
 - Do NOT touch: src/lib/estimator/**, src/lib/checkoutV3.ts, src/components/estimator/**, supabase/**, data-xp-* A/B markup, Admin.tsx, src/components/b2b/**. Pricing must stay byte-identical (prebuild estimator-sync / pricing-sync checks must pass).
 - Hydration rule: the first client frame equals the prerendered HTML (no Date/Math.random/window/localStorage at render).
 - No invented facts. Never claim past customers, orders, reviews, ratings or client names in a country. Never write "we ship there regularly", "thousands of customers", "local pickup" (unless a partner config says so), VAT/IVA/NIF claims, or "no minimum order" (truth: minimum order €10, no setup fee). No AggregateRating/Review schema. No LocalBusiness schema for cities without a real address (use Service + areaServed).
 - Every new page must prerender (dist/<route>/index.html), be in public/sitemap.xml with complete reciprocal hreflang, be in llms.txt, and pass every existing check script (route coverage, sitemap, internal links, i18n keys, social meta).

STEP 0 — SETUP
 1. npm ci && npm run typecheck && npm test && npm run build — must be green before any change; report the test count. (Fresh clones need placeholder VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY.)
 2. Read and summarise how pages are built: src/data/cityDeliveryPages.ts, src/pages/CityDeliveryPage.tsx, src/pages/InternationalServicePage.tsx, src/seo/registry.ts, src/seo/landingPages*.ts, src/data/partsPages.ts, src/i18n/*.ts (languages: es ca en de fr it nl pt), the prerender route list, the sitemap and llms.txt, and every script in scripts/. Report the facts you will rely on (file:line).
 3. Audit the i18n UI strings for de, fr, it, nl, pt: list every key that falls back to English on the calculator, header, footer, checkout and contact UI. A native page must not show English UI.
 4. Copy this whole file verbatim into docs/intl/SPEC.md, so you can re-read it from the repo after any context compaction.
 5. Create docs/intl/PROGRESS.md: one "- [ ] <id> <route> — <what>" line per deliverable listed in STEP 2, in the order given, plus the lines for STEP 1, 3, 4 and 5. Print the file.
 6. Commit SPEC.md and PROGRESS.md and push. Then continue straight with STEP 1. After each finished item, tick its PROGRESS line, commit and push.

DECISIONS ALREADY MADE (follow them)
 Markets and voice (write natively, like a local copywriter would; never translate from English sentence by sentence):
 - DE (Germany, also reads well for AT): formal "Sie". Decimal comma, "10 €". Seed phrases: 3D-Druck Service, 3D-Druck online bestellen, 3D drucken lassen, 3D-Druck Dienstleister, 3D-Druck Kosten, Ersatzteil 3D-Druck.
 - NL (Netherlands, also BE-Flanders): informal "je". "€ 10" with decimal comma. Seed phrases: 3D printen laten maken, 3D print service, 3D printen bestellen, 3D printen kosten, onderdeel laten printen.
 - FR (France, also BE-Wallonia, LU): "vous". "10 €" with decimal comma. Seed phrases: impression 3D en ligne, service d'impression 3D, faire imprimer en 3D, prix impression 3D, pièce de rechange impression 3D.
 - IT (Italy): "tu", modern e-commerce tone. "10 €" with decimal comma. Seed phrases: stampa 3D online, servizio stampa 3D, far stampare in 3D, prezzi stampa 3D, ricambi stampa 3D.
 - PT (Portugal, European Portuguese — NOT Brazilian: ficheiro, registo, equipa, telemóvel). "10 €" with decimal comma. Seed phrases: impressão 3D online, serviço de impressão 3D, imprimir em 3D, preço impressão 3D, peças de substituição impressão 3D.
 Use the seed phrases naturally in title, H1, first paragraph and some H2s. No keyword stuffing. If a phrase sounds unnatural in context, use the natural local wording instead and note it in PROGRESS.md.

 Facts every page may use (read real values from code, never retype prices):
 - Barcelona FDM studio, Bambu Lab X2D (enclosed, heated chamber); quote within 1 hour on business days (Spain time); instant price in the calculator for orders up to €100, manual quote above; minimum order €10, no setup fee; flat shipping €5.90 to the countries in SHIP_COUNTRIES (read it from supabase/functions/create-instant-checkout/index.ts, do not edit that file); materials and colours from the calculator's own option lists; urgency surcharges as the estimator defines them.
 - Create src/config/intlMarkets.ts (owner-editable, commented): per market { code, lang, locale, hubSlug, typicalDeliveryDays: string, carrierNote: string|null } with typicalDeliveryDays seeded as "3–5 business days" for DE, NL, IT, "2–4" for FR and PT, and the comment "owner: adjust to real Sendcloud/Correos times". Pages read delivery times only from here and always say "usually".
 - Create src/config/shippedCountries.ts: SHIPPED_COUNTRIES = [{ code: "ES", orders: null }] with the comment "owner: add every country you have really shipped to". A "Countries we have shipped to" line or map may only list entries from this file.
 - Batch price examples: compute from the shared estimator helper the B2B batch table uses (import it, never hard-code numbers), formatted in the page locale.

STEP 1 — UI LANGUAGE FIXES
 Fill every missing de/fr/it/nl/pt key found in Step 0.3 (all 8 languages must have every key; update scripts/check-i18n-new-keys.mjs). Natural wording, same voice rules as above.

STEP 2 — PAGES (one PROGRESS line each, in this order)
 2a. Country hubs (≥ 900 words of unique body text each):
   DE /de/3d-druck-service · NL /nl/3d-printen-laten-maken · FR /fr/impression-3d-en-ligne · IT /it/stampa-3d-online · PT /pt/impressao-3d-online
   Sections: H1 with the main phrase; short promise; how ordering from Barcelona works for this country (shipping €5.90, usual delivery days, tracking, EU single market so no customs); calculator CTA (mount the same estimator the other landing pages use, id="calculator"); what we print (prototypes, spare parts, enclosures, small series, gifts/figures) with local examples; materials and colours; price examples table from the estimator; file formats and "no file? send a photo"; a 6–8 question FAQ written for that country; links to every city page, the three guides, the part pages of that language, the English B2B page and the materials hub; WhatsApp CTA with a prefilled message in that language.
 2b. City pages (≥ 500 words of unique body text each, genuinely different from each other):
   DE /de/3d-druck-berlin, /de/3d-druck-muenchen, /de/3d-druck-hamburg
   NL /nl/3d-printen-amsterdam, /nl/3d-printen-rotterdam, /nl/3d-printen-eindhoven
   FR /fr/impression-3d-toulouse, /fr/impression-3d-montpellier, /fr/impression-3d-lyon, /fr/impression-3d-paris
   IT /it/stampa-3d-milano, /it/stampa-3d-torino, /it/stampa-3d-roma
   PT /pt/impressao-3d-lisboa, /pt/impressao-3d-porto
   Each: who in that city typically needs FDM parts (true, well-known facts about the city's industries, universities and maker scene; no named companies as clients), 3 example projects described as "examples of what we print" (not past orders), delivery note from Barcelona (from intlMarkets), 4–6 city-specific FAQs, links to the hub, 2 sibling cities, 2 guides and the calculator. Where an English page exists (/3d-printing-delivery-paris, -amsterdam, -berlin, -milan, -rome, -lisbon), the two form an hreflang pair (native ↔ en) with x-default = English, and the language switcher maps between them (altSlug pattern).
 2c. Guides, 3 per language (≥ 900 words each, Article + BreadcrumbList + FAQPage JSON-LD):
   DE /de/3d-druck-kosten, /de/3d-druck-datei-vorbereiten, /de/3d-druck-materialien
   NL /nl/3d-printen-kosten, /nl/3d-printbestand-voorbereiden, /nl/3d-print-materialen
   FR /fr/prix-impression-3d, /fr/preparer-fichier-impression-3d, /fr/materiaux-impression-3d
   IT /it/prezzi-stampa-3d, /it/preparare-file-stampa-3d, /it/materiali-stampa-3d
   PT /pt/preco-impressao-3d, /pt/preparar-ficheiro-impressao-3d, /pt/materiais-impressao-3d
   The price guide explains how FDM price is built (grams, machine hours, material multiplier, urgency) with 3 worked examples computed from the estimator. Link each guide to its hub, 2 cities and the calculator.
 2d. Localized spare-part pages (max 8), built on the existing partsPages.ts structure, only where the product is common in that country: DE versions of the Bosch dishwasher basket wheel, the Gardena hose adapter and the VESA adapter; FR versions of the Bosch wheel and the VESA adapter; IT versions of the 58 mm coffee dosing funnel and the VESA adapter; one more where clearly justified. Each links to its language hub. hreflang pairs with the Spanish original.
 2e. Fix the existing English city pages (all entries in src/data/cityDeliveryPages.ts): remove "no minimum order", "we ship ... regularly" and any other claim that contradicts the facts above; keep slugs, H1 intent and indexability; add a visible link to the native page; London and New York: say clearly that shipping outside the EU is quoted per order, may include customs, and that instant checkout covers EU countries only. Report every changed claim with file:line.
 2f. Internal linking: a footer block "Countries we ship to" (localized label) linking the 5 hubs from every page; /3d-printing-service links to all 5 hubs; the Spanish and English B2B pages link to the hubs in one line; every new page links to at least 4 related pages and receives at least 3 inbound internal links (run scripts/report-inbound-links.mjs and paste the numbers).
 2g. Optional, only if every item above is ticked: NL and FR versions of the "make money with a 3D printer" maker guide, linked from /makers.

STEP 3 — SIMILARITY GUARD
 Create scripts/check-page-similarity.mjs and run it after the build (wire it into the build the same way check-internal-links runs on dist): for every page created in Step 2, take the text inside <main> of dist/<route>/index.html, strip markup, build 5-word shingles, and compute Jaccard similarity for every pair in the same language. Print the 5 highest pairs. Exit 1 if any pair is above 0.35. If a pair fails, rewrite the content until it passes; never raise the threshold.

STEP 4 — SEO DETAILS FOR EVERY NEW PAGE
 Unique title ≤ 60 characters and meta description ≤ 155 in the page language; one H1; correct <html lang> (de-DE, nl-NL, fr-FR, it-IT, pt-PT) and og:locale in the prerendered HTML; canonical to itself; reciprocal hreflang only between true equivalents (never cluster a guide with a Barcelona page); JSON-LD WebPage + BreadcrumbList + Service (areaServed = the country) + FAQPage built from the visible FAQ; images with width/height and localized alt text; no layout shift. Add a test that parses every application/ld+json block of the new pages' prerendered HTML.
 Analytics: reuse the existing page-view events; add props { market, lang } to city_page_view / international_page_view where those events fire. No PII.

STEP 5 — FINAL VERIFICATION (raw output)
 npm run typecheck ; npm test (counts) ; npm run build (last 40 lines, every check passing incl. the similarity check) ;
 git diff origin/main --stat -- src/lib/estimator src/lib/checkoutV3.ts src/components/estimator supabase   (must print nothing) ;
 Playwright screenshots (chromium is preinstalled at /opt/pw-browsers; use executablePath) of the 5 hubs and 3 city pages at 390x844 and 1280x900 into /tmp/intl-shots/ — look at them, fix any English UI left on a native page or broken layout ;
 a table of every new route with language, word count, highest similarity score and inbound links ;
 print docs/intl/PROGRESS.md ; git status --short ; git log --oneline origin/main..HEAD | head -60.
 Then STOP. AFTER MERGE (owner): no Lovable redeploy needed; resubmit the sitemap in Search Console and Bing, run npm run indexnow, request indexing for the 5 hubs first.
