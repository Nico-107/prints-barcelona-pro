# Prompt 16 — SEO Growth Pass: Progress

- [x] Item 1: Only www.dimension3dprints.com may be indexed (noindex script + canonical audit)
  — Script in index.html: `if(location.hostname!=='www.dimension3dprints.com'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'){…noindex…}`. Unit test: 127.0.0.1→noindex:false, lovable.app→noindex:true, www→noindex:false. Grep confirms 0 non-www canonicals in dist: `grep -rh 'rel="canonical"' dist/ | grep -v 'https://www.dimension3dprints.com' | wc -l` → 0.

- [x] Item 2: End Barcelona cannibalisation (KEYWORD-MAP, 301 /impresion-3d-barcelona → /, content merge, intent differentiation)
  — `docs/seo/KEYWORD-MAP.md` created. `/impresion-3d-barcelona` → 301 `/` in vercel.json. `/ca/impressio-3d-barcelona` → 301 `/ca/`. Removed from sitemap. `check-seo-meta` reports 0 duplicate titles across 148 pages.

- [x] Item 3: Titles and descriptions rewritten for clicks (TITLES.md + build check)
  — `docs/seo/TITLES.md` created. `check-seo-meta` decoded HTML entities and passes: `[check-seo-meta] OK: 148 indexable pages checked — title length, description length, no "2025", no duplicate titles.`

- [x] Item 4: Strengthen striking-distance pages (query in content, FAQ, pricing table, internal links)
  — prototipado-rapido-barcelona: new title "Prototipado Rápido Barcelona — Entrega 24–72h, Desde 10€", intro carries "prototipado rápido" in first 100 words, 4 extra FAQs. madrid: new title "Impresión 3D en Madrid — Precios desde 10€, Envío 1–2 Días", 600+ word body, 4 extra FAQs. 3d-printing-barcelona: altSlug="/" for hreflang, title "3D Printing in Barcelona — From €10, Quote in 1 Hour". como-ganar-dinero / how-to-make-money: clear answer + numbered list in first 2 sentences.

- [x] Item 5: Valencia, Sevilla and Madrid local pages (600+ words, JSON-LD, FAQ, calculator)
  — Madrid ES/EN: 600+ word introParagraph (Corredor del Henares, Getafe aerospace, UPM/Carlos III). Sevilla ES/EN: 600+ word body (Airbus Defence and Space, Aerópolis, ETSI). `Service` JSON-LD added to all CityDeliveryPage renderings with `areaServed` + `provider: { "@id": "/#business" }`. `check-page-similarity` passes in build.

- [x] Item 6: "Make money with a 3D printer" cluster (clear answer, list, worked example, FAQPage, Article JSON-LD, interlinks)
  — how-to-make-money, is-3d-printing-business-profitable, how-to-get-3d-printing-customers + ES/DE twins: first 2 sentences updated with direct answer + numbered list. dateModified updated to "2026-10-15". `check-schema`: Article: 98, FAQPage: 135.

- [x] Item 7: Structured data (LocalBusiness JSON-LD, BreadcrumbList, check:schema)
  — `src/seo/entities.ts` rewritten: single `ORGANIZATION_SCHEMA` with `@type: ["LocalBusiness","ProfessionalService"]`, `@id: /#business`, `telephone: "+34 672 051 147"`, full address. Removed aggregateRating/review from all inline schemas. `npm run check:schema` → `[check-schema] OK: all JSON-LD blocks valid. LocalBusiness: 7, BreadcrumbList: 137, FAQPage: 135, Service: 98, Article: 98, TechArticle: 25. Total: 530 blocks.`

- [x] Item 8: hreflang complete everywhere including sitemap (reciprocal pairs, xhtml:link, lastmod)
  — Index.tsx: hreflang en→/3d-printing-barcelona, x-default→/. LandingPage.tsx: fallback hreflang for EN pages with altSlug="/". Sitemap homepage/ca updated: hreflang en→/3d-printing-barcelona, x-default→/. Reciprocal pairs verified: es→en ✓, ca→en ✓, en→es ✓, en→ca ✓ (4/4 OK). Sitemap has xhtml:link entries for all hreflang pairs.

- [x] Item 9: Internal linking (Servicios grid on homepage, hub→city links, orphan check)
  — Index.tsx: "Servicios" link grid with 10 Barcelona intent pages + "Envíos internacionales" row (5 native hubs + city delivery pages). `check-internal-links`: 153 pages, 12253 internal links checked, 0 broken. QA crawl: 148 routes × 2 locales × 2 viewports = 0 violations.

- [x] Item 10: Speed, final checks and owner checklist (bundle size, LCP, OWNER-CHECKLIST.md)
  — Main bundle: index.js 2,135 KB / 650 KB gzip. three.js: 734 KB / 190 KB gzip (already lazy-loaded via Suspense boundary in StlEstimator). All page chunks lazy. `docs/seo/OWNER-CHECKLIST.md` created with weekly Monday routine, 7 money queries, Pages report, URL submission, reviews, backlink targets. `npm run indexnow` is documented (run after production deploy only).

- [x] Item 11 (extra): Email subject → [REVISIÓN] <flag> <LANG> · <sourcePath> — <material> · <price>
  — `supabase/functions/send-quote-request/index.ts`: subject IIFE uses `pageLanguage ?? safeLang` for flag mapping (es/ca→🇪🇸, en→🇬🇧, de→🇩🇪, fr→🇫🇷, it→🇮🇹, nl→🇳🇱, pt→🇵🇹), sourcePath (fallback "web"), priceExact (exact) or priceLow–priceHigh range.
