# Prompt 22: Buy button, international landing pages, consent and session recordings, size preview, SEO

How to start (owner):
1. Save this file as `prompt-22.md` in the repo root (`~/Projects/prints-barcelona-pro`). It stays untracked: never commit it; STEP 0 copies it to docs/conv22/SPEC.md.
2. In Terminal: `cd ~/Projects/prints-barcelona-pro && git fetch origin && claude --dangerously-skip-permissions`
3. Paste:

```
/goal Read ./prompt-22.md and complete every step in it on branch conv-22, ticking docs/conv22/PROGRESS.md as you go, then run STEP 9 and stop.
```

Branch: `conv-22`. Never `main`.

This is a long, unattended run. Work through every step in order without waiting for me. When something is ambiguous, choose the option that makes it **easier for a visitor to upload a file and pay**, write the decision in PROGRESS.md, and continue.

---

## WHY THIS RUN EXISTS (read first)

Facts from PostHog for the last 7 days (23–29 Oct):
- 63 upload batches produced a price.
- 13 Stripe checkout sessions were created.
- 5 orders were paid.
- 9 quote requests were sent.

The owner uploaded two small PLA parts (`carcasa_frontal_v1`, `carcasa_trasera_v1`, total €16.97) and got **no Buy button**, only "Enviar solicitud de presupuesto" and WhatsApp. On a second try in another session the Buy button was there.

- All three variants of experiment `modal_actions_r1` render the Buy button, so the experiment is not the direct cause.
- The quote-only screen appears whenever `instantBuyEligible` is false or `showManualReview` is true (`src/components/StlEstimator.tsx:291`, `src/lib/instantBuy.ts`, `src/lib/estimator/core.ts:237-242`).
- That happens **silently**. `showQuoteOnlyWhy` only explains the over-limit and multicolour cases.

Fixing this is priority #1.

International pages bring real traffic:
- `/it/stampa-3d-online` is the #2 page on the whole site, with 52 visitors in 30 days.
- Italy: 24 estimates, 5 checkouts, 3 paid.
- Portugal: 12 estimates, 0 paid.
- Netherlands: 4 estimates, 2 checkouts, 0 paid.

Those pages convert worse than they should:
- They put a WhatsApp button next to the main CTA.
- They read like articles, not landing pages.
- They hide the language switcher.
- Their logo sends people to the Spanish Barcelona home.

---

## BRANCH AND GIT

- `git fetch origin && git checkout -b conv-22 origin/main`. Push to `conv-22` only (`git push -u origin conv-22`). Never main, never merge, never open a PR.
- Stage only files you changed on purpose (`git add <paths>`). NEVER `git add -A` or `git add .`. Never commit `.claude/`, `supabase/.temp/`, `.env*` or `dist/`.
- Commit and push after every finished PROGRESS item (`conv22: <id> <short>`), so a usage-limit pause loses nothing.

## HARD RULES

1. **Pricing must stay byte-identical.** Do not change any number or formula in `src/lib/estimator/core.ts`, `src/lib/pricing.ts` or `src/lib/checkoutV3.ts`. The prebuild estimator-sync and pricing-sync checks must pass. You MAY read `order.reasons` and pass it through `src/lib/estimate.ts`.
2. **Do not touch `supabase/**`.** Edge functions are changed by the owner in Lovable. If an item needs an edge-function change, write it in `docs/conv22/LOVABLE.md` as a ready-to-paste Lovable prompt and continue.
3. **Hydration rule.** The first client frame equals the prerendered HTML: no `Date`, `Math.random`, `window` or `localStorage` at render. Language is derived from the URL in the `useState` initializer, never via `setLanguage` in an effect. `pathLanguage()` in `LanguageContext.tsx` and `urlLanguage()` in `entry-server.tsx` must mirror each other exactly.
4. **Vercel config.** Never use `routes` in `vercel.json`; use `rewrites` and `redirects` only. Never proxy PostHog through Vercel.
5. **i18n.** Every new string goes into all 8 files (`es ca en de fr it nl pt`) with natural wording in each language, never English copied into another file. Run the two-pass check: key exists AND the value is not identical to `en.ts` (allow-list brand words).
6. **No invented facts.**
   - No fake reviews, ratings, customer counts or client names.
   - No `AggregateRating` or `Review` schema.
   - No "no minimum order": the truth is a €10 minimum and no setup fee.
   - Reviews shown on pages come only from the existing real reviews data.
7. **Experiments.** An experiment may change wording, order or size, but **must never remove, hide or disable the primary Buy button for an instant-buy-eligible order.** Add a test that enforces this (STEP 1.6).
8. Every page still prerenders and still passes every existing check script (route coverage, sitemap, internal links, i18n keys, social meta, xp-ssr-text).

## STEP 0: SETUP

1. `npm ci && npm run typecheck && npm test && npm run build` must be green before any change. Report the test count. Fresh clones need placeholder `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_ANON_KEY`.
2. Read and summarise, with file:line references:
   - `StlEstimator.tsx`: eligibility, the `showManualReview` lifecycle, `forceQuoteOnly`, `preUploadDone`, fulfillment state.
   - `estimator/OrderPanel.tsx`, `estimator/CheckoutConfigurator.tsx`, `StlViewer.tsx`.
   - `lib/instantBuy.ts`, `lib/estimate.ts`, `lib/estimator/core.ts` (`priceOrder` reasons, `fitsPlate`, plate size).
   - `lib/experiments/*`, the EXP array in `index.html`, `src/index.css` xp rules.
   - `Header.tsx`, `LanguageSelector.tsx` (`LANG_HUB`), `LanguageContext.tsx`, `entry-server.tsx`.
   - `pages/Index.tsx`, `InternationalServicePage.tsx`, `IntlHubPage.tsx`, `IntlCityPage.tsx`, `CityDeliveryPage.tsx`, `IntlGuidePage.tsx`.
   - `components/Hero.tsx`, `Reviews.tsx`, `CookieConsentBanner.tsx`, `main.tsx`, `lib/analytics.ts`, `Footer.tsx`, `config/intlMarkets.ts`, `src/seo/*`, `public/sitemap.xml`.
3. Copy this file verbatim into `docs/conv22/SPEC.md`, so you can re-read it after any context compaction.
4. Create `docs/conv22/PROGRESS.md` with one `- [ ] <id> — <what>` line per item below (1.1 … 8.4), in order. Print it.
5. Commit SPEC.md and PROGRESS.md, push, and continue straight with STEP 1. After each finished item: tick it, commit, push.

---

## STEP 1 (P0): THE BUY BUTTON MUST ALWAYS BE THERE WHEN IT SHOULD

**1.1 Reproduce.**
- If `qa/fixtures/user-repro/` contains the owner's files (`carcasa_frontal_v1_28-10-2026.stl`, `carcasa_trasera_v1_28-10-2026.stl`), use them.
- Otherwise build fixtures that hit each candidate cause below.
- With Playwright (chromium at `/opt/pw-browsers`), upload them on `/` in Simple and Advanced mode with `?xp=modal_actions_r1:A|B|C` and in the holdout. Record which combination shows the quote-only screen.
- Check every candidate and write the verdict for each in PROGRESS.md:
  - (a) `fitsPlate === false`, because the user picked an orientation in Advanced mode that doesn't fit, or because of a unit/scale problem.
  - (b) A file over 30 MB → `filesWithinVerifyLimit === false`.
  - (c) `showManualReview` surviving a new upload or a settings change. Check the reset effect's dependency list includes the parsed file list and every eligibility driver.
  - (d) `anyMulticolour` true by default, or because of "Cualquier color".
  - (e) `forceQuoteOnly` on `CityDeliveryPage` for an EU country that IS in `SHIP_COUNTRIES` (country→ISO mapping gaps).
  - (f) `CHECKOUT_V3_READY` env.
  - (g) Anything else you find.

**1.2 One eligibility source with reasons.**
- Add `getInstantBuyStatus()` to `src/lib/instantBuy.ts` returning `{ eligible: boolean, reasons: string[] }`.
- Reason values: `over-limit | material:<x> | oversize:<file> | multicolour | file-too-large | city-not-shipped | manual-review-open | flag-off`.
- Build it from `order.reasons` (pass through `estimate.ts`) plus the UI-side conditions.
- `instantBuyEligible` must come only from this function.

**1.3 Fix the root causes found in 1.1.** Rules:
- Eligibility for size uses the **best fitting orientation** (the auto-orientation logic already prefers fitting orientations). If the user's manual orientation doesn't fit the 256 × 256 × 261 mm bed, show an inline warning on that part ("This orientation doesn't fit our printer, we'll print it in the best orientation") and price/buy with the best fitting one. The order does **not** lose the Buy button.
- Files between 30 MB and 50 MB stay instant-buy if the browser parsed them successfully. If the server verify limit really requires ≤30 MB, keep Buy but write the needed server change to LOVABLE.md. Never fall silently into quote-only.
- `showManualReview` resets whenever files, quantities, material, colour mode, quality, infill, orientation, urgency or fulfillment change.
- Order total ≤ €100 + instant materials (PLA, PETG, ABS, ASA, TPU, Nylon) + every part fits the bed in some orientation + not multicolour + an EU ship country → **the Buy button renders and is enabled.**

**1.4 Never silent.**
- When the order is quote-only, show one short reason line above the button, localized in all 8 languages:
  - over €100: "Pedidos de más de 100 € los revisamos a mano: te enviamos el precio final en menos de 1 h."
  - oversize: "Una pieza es más grande que nuestra impresora (256 mm). La revisamos y te proponemos dividirla."
  - special material: "Este material lo confirmamos a mano."
  - multicolour: "Las piezas multicolor las confirmamos a mano."
  - country not in instant shipping.
- Add `instant_eligible` and `ineligible_reasons` (comma-joined) to the `estimate_shown`, `estimate_generated` and `buy_button_visible` events. Add an `actions_branch: 'buy' | 'quote'` property to `buy_button_visible`.

**1.5 Conclude `modal_actions_r1` and ship variant B (buy-first) permanently.**
- The owner wants the Buy button dominant, with review and WhatsApp as small text links.
- Remove variants A and C from `OrderPanel.tsx`. Set the registry entry to `enabled: false` and add a concluded note. Remove the entry from the `index.html` EXP array and its CSS. Write `docs/experiments/modal-actions-r1-result.md`: early stop, owner decision, sample size too small for a statistical winner.
- `upload_area_r1` and `header_btn_r2` keep running unchanged.

**1.6 Complex-part path (the review button grows only when it helps).**
- Inside the instant-buy branch, the free-review action is a small text link by default.
- It becomes a **full-width outline button directly under Buy**, with copy "Revisión gratuita por un técnico · respuesta en 1 h" (localized), when any of these is true:
  - order total ≥ `REVIEW_EMPHASIS.minTotalEur` (default 60)
  - material is Nylon or TPU
  - `supportHeavy`
  - any part has a dimension > 200 mm
  - quantity of one part ≥ 20
- Put the thresholds in `src/config/checkoutUx.ts` with owner-editable comments.
- Buy stays the primary, bigger, orange button in every case.

**1.7 Tests.**
- Unit tests for `getInstantBuyStatus()`, one per reason, plus the "must be eligible" case.
- Playwright: for `/`, `/3d-printing-service`, `/it/stampa-3d-online`, `/pt/impressao-3d-online`, `/nl/3d-printen-laten-maken`, upload `qa/fixtures` small-cube STL, in Simple and Advanced, in every active experiment variant and the holdout:
  - expect `[data-testid="buy-now-btn"]` visible and enabled within 10 s
  - click it with the checkout request intercepted (never create a real Stripe session); expect the redirect call with the right language
- Add a registry-driven test that renders `OrderPanel` for every registered experiment × variant with an eligible order and fails if no visible Buy button exists (hard rule 7).

## STEP 2 (P0): UPLOAD → PAY WITH AS LITTLE FRICTION AS POSSIBLE

**2.1 Pre-select fulfillment so Buy is one click.**
- International pages and every non-Barcelona page: shipping (€5.90) pre-selected.
- Barcelona pages: shipping pre-selected and pickup one click away, unless the page is a pickup page (`refPickupAvailable`).
- The Buy label always shows the exact total ("Comprar · 16,97 €"), never "desde".

**2.2 `preUploadDone`.** While files upload in the background, the Buy button stays orange and clickable:
- If clicked early, show "Preparando tus archivos…" with a spinner and continue automatically when the upload finishes.
- Never show a grey disabled Buy without explanation.

**2.3 Mobile.**
- When the price is ready, the modal shows total + Buy above the fold at 390 × 844.
- Add a sticky bottom bar inside the modal (total + Buy) that appears when the in-flow Buy button scrolls out of view.
- Check 360 × 740 too.

**2.4 Delivery promise next to the price.**
- Show "Llega aprox. el {weekday d month}" (localized, `Intl.DateTimeFormat`). Compute it from business days in `intlMarkets.typicalDeliveryDays` (ES: 1–3 business days after printing; production days from the existing urgency tiers), shown as "aprox."/"usually".
- Compute it client-side after hydration only (hard rule 3).

**2.5 Simple mode is the default.** Advanced is never auto-restored for first-time visitors. If the user switches to Advanced, the choice may persist for the session only.

**2.6 Trust under Buy.** One line of payment logos (card, Apple Pay, Google Pay; plus iDEAL, Bancontact, MB WAY and Klarna as text badges only when the page market matches) and the existing promise line. Keep it compact: max 2 lines under the button.

**2.7 Abandon recovery.** If an eligible visitor closes the modal with a price shown, the existing exit-popup logic may show once per session: "Tu precio de X € queda guardado 24 h — [Volver a mi pedido]". Reopen with the same files from memory, without re-uploading. Do not add email capture to it.

## STEP 3 (P0): A BETTER CONSENT PROMPT, SO SESSION RECORDINGS ACTUALLY HAPPEN

The owner needs **PostHog session recordings**, and good ones. Recordings legally need consent, so the consent prompt stays. It is redesigned to be small, clean, asked at the right moment, and never in the way of the Buy button.

Current facts:
- Recordings fell from about 20 a day (16–20 Oct) to about 9 a day since 21 Oct.
- The banner is a full-width bottom bar.
- The banner is **hidden while the calculator modal is open**, so visitors who go straight to upload are never asked. The most important flow is never recorded.

Legal floor (Spain/EU, not negotiable):
- No recording or cookies before Accept.
- Reject must be as easy as Accept: same size, same step, no pre-ticked boxes.
- No "accept by scrolling".

Everything else is optimised for a high accept rate.

**3.0 Read the docs first.** Run the PostHog docs search, or read node_modules/posthog-js types, for `cookieless_mode`, `opt_in_capturing`, `persistence`, `session_recording` options (`maskAllInputs`, `maskInputOptions`, `maskTextSelector`, `recordCanvas`, `canvasFps`, `minimumDurationMilliseconds`), and `startSessionRecording`. Write in PROGRESS.md the exact behaviour of the version installed: what is captured before a decision, after Accept, and after Reject.

**3.1 New consent UI** (rewrite `CookieConsentBanner.tsx`; keep the file name).
- **Desktop:** a compact floating card, bottom-left, max-width 360 px, rounded, subtle shadow, matching the site's design tokens. It must not cover the hero CTA or the floating WhatsApp bubble (bottom-right).
- **Mobile:** a slim bottom sheet, max 2 lines of text plus one row with two buttons, ≤ 96 px tall at 390 px wide, safe-area aware.
- Copy is short and benefit-framed, natural in all 8 languages. ES example: "Usamos cookies de análisis para ver qué falla y mejorar la web. Sin anuncios ni venta de datos." Two buttons **of equal size**: "Aceptar" (accent) and "Rechazar" (solid neutral, not a text link), plus a small "Más info" link to the privacy page.
- **Timing:** appears on the first scroll, first click, or after 4 s, whichever comes first. Nothing is recorded meanwhile.
- **Never hidden by the calculator modal.** Remove the `data-estimator-open` hiding. While the modal is open, the prompt docks as a slim bar at the **top** of the viewport above the modal (z-index), so it never covers the price or the Buy button or the mobile sticky Buy bar.
- Keyboard accessible, `role="dialog"` with label, focus not stolen from the page, Esc does nothing (no implicit choice).
- The choice is stored 12 months (`cookie-consent` + date). Re-ask only after it expires. A footer link "Preferencias de cookies" (8 languages) reopens it.

**3.2 Analytics for everyone, recordings for those who accept.**
- **Undecided or rejected:** PostHog runs cookieless (`cookieless_mode: "on_reject"` or the equivalent per 3.0, with `persistence: "memory"`). Pageviews and funnels are still counted without cookies or identifiers, and with no replay.
- Set the gating constant (`COOKIELESS_ENABLED`) to `true`. Write at the top of `main.tsx` and in OWNER.md: **the owner must enable "Cookieless server hash mode" in PostHog project settings BEFORE deploy**, or those events are dropped.
- **Accept:** upgrade persistence to `localStorage+cookie` (existing `upgradeAnalyticsPersistence`), start session recording immediately in the same page (no reload needed), enable heatmaps, and run the GA4 `consent update` (keep). Returning visitors who accepted get recording from the very first pageview (start it in `loaded`).
- **Reject:** stop recording, keep cookieless analytics, no GA4 update.

**3.3 Recording quality** (in `enableHeatmapsAndReplay`):
- Mask: all inputs (`maskAllInputs: true`), but **unmask non-sensitive controls** so replays are useful: material, colour, quality, quantity, fulfillment choice and selects. Keep email, phone, name, address and notes masked, plus anything with `data-ph-mask`.
- Canvas: record the 3D viewer canvas (`recordCanvas: true`, low fps ~2–4, reduced quality) so the owner can see what file the visitor looked at. Measure the bundle and performance impact on a mid phone. If it drops below 50 fps, reduce fps or disable it and note why.
- Capture console errors and network timing for the estimator's own requests (no request or response bodies).
- `minimumDurationMilliseconds: 2000`.
- Every key button keeps its `data-ph-name` (already added in prompt 21). Add any that are missing in the new UI (Buy, review, size toggles, language switcher, consent buttons).

**3.4 Measure consent.**
- New events: `consent_prompt_shown` {placement: 'card' | 'sheet' | 'top-docked', trigger: 'scroll' | 'click' | 'timer'} and `consent_decision` {decision: 'accept' | 'reject', seconds_to_decision, page_type}. These are sent cookieless, so they are counted even on reject.
- Add both to `docs/analytics-events.md`.

**3.5 Privacy page (all 8 languages).**
- Describe exactly:
  - cookieless analytics without consent
  - cookies plus session recordings with masked inputs only after Accept
  - GA4 consent mode
  - Stripe and Supabase as processors
  - how to change the choice (footer link)
- Update the cookie table.

**3.6 Tests (Playwright).**
- Before any choice: no `ph_` or `_ga` cookies; no `/s/` recording requests sent to PostHog.
- The prompt appears after a scroll and stays visible with the calculator modal open, without covering `[data-testid="buy-now-btn"]` (bounding boxes do not intersect) at 390 × 844 and 1280 × 900.
- After Accept: persistence cookie set and recording requests start within 10 s, without reload.
- After Reject: still no cookies, pageview events still sent (cookieless).
- The footer link reopens the prompt.

## STEP 4 (P0): LANGUAGE SWITCHER, LOGO, AND THE OLD LOVABLE COPY

**4.1 The language selector is visible on every page.**
- Remove `hideLanguageSelector` from `InternationalServicePage.tsx` and `CityDeliveryPage.tsx`, and remove the prop if it is now unused.
- On every page the selector maps to the **equivalent page** in the target language using the page's hreflang map, and falls back to that language's hub (`LANG_HUB`).
- Write a table in PROGRESS.md covering the 8 × 8 switch matrix from `/`, `/3d-printing-service`, `/it/stampa-3d-online`, one city page and one guide.

**4.2 The logo goes to the home of the current language** (`LANG_HUB[language]`), not `/`. The same applies to header nav links: each resolves to its same-language equivalent when one exists, otherwise to the English version for non-es/ca languages.

**4.3 Language persistence.** Picking a language sets the preferred language. The `LanguageSuggestionBar` never suggests the language the visitor just left.

**4.4 Old Lovable copy in Google.** A friend searching the brand got the very old site on a `*.lovable.app` URL.
- `index.html` already adds `noindex` on foreign hosts.
- Extend that inline script: if `location.hostname` ends with `.lovable.app`, `.lovableproject.com` or `.lovable.dev`, **immediately** do `location.replace('https://www.dimension3dprints.com' + location.pathname + location.search)`.
- Keep `noindex` without redirect for `*.vercel.app` previews.
- Add an `index.html` unit test for the host logic.
- The fix only reaches the old copy after the owner republishes or unpublishes the Lovable project. Put that first in OWNER.md.

## STEP 5 (P1): INTERNATIONAL PAGES BECOME REAL LANDING PAGES

Priority markets: **Italy, Portugal, Netherlands**, then English, France and Germany. Same structure for all, driven by `src/config/intlMarkets.ts` and the `intlContent_*.ts` files.

**5.1 New hub layout (`IntlHubPage.tsx`; also apply to `InternationalServicePage.tsx` for English).** Match the visual quality and section rhythm of the Spanish home (`Index.tsx` + `Hero.tsx`), reusing its components. Order:

1. **Hero:**
   - market badge ("Stampa 3D da Barcellona · Spedizione in Italia")
   - H1 with the main phrase
   - one-line promise (price in 1 h, from €10, delivery days from intlMarkets)
   - **one big orange primary button that opens the file picker directly** ("Carica il file e vedi il prezzo")
   - under it: "Senza registrazione · Senza impegno" and the 3 trust chips
   - **No WhatsApp button in the hero.** WhatsApp lives only in the floating bubble ("Parla con una persona reale"), localized, with a prefilled message in the page language.
2. Real review strip: reviews from the existing data in their original language, labelled "Recensione Google · in spagnolo" when not in the page language. Never translate a review and present it as written that way.
3. "Come funziona": 3 steps with icons (upload → price in 1 h / instantly → printed in Barcelona and shipped with tracking).
4. **Embedded calculator** (`id="calculator"`), the same `StlEstimator` as the home.
5. Price examples table (from the shared estimator helper, locale-formatted), shipping €5.90, delivery days, EU: no customs.
6. Materials and colours (from the calculator's option lists).
7. FAQ (existing per-market FAQ).
8. The long SEO body text moves **below** the FAQ under a clear H2 ("Guida: stampa 3D online in Italia"). Keep every word for SEO, but it no longer pushes the calculator down.
9. Links: city pages, guides, part pages, materials hub, B2B.

**5.2 English page** (`/3d-printing-service`): same layout. Remove the hero "Message Us on WhatsApp" button. The orange "Get an Instant Quote" button opens the file picker.

**5.3 Breadcrumb, `<html lang>`, og:locale and hreflang stay correct.** Run the existing hreflang and sitemap checks.

**5.4 Analytics.** Add `market` and `lang` to `international_page_view`, `international_cta_click` and the calculator events on intl pages.

**5.5 Screenshots** at 390 × 844 and 1280 × 900 of the IT, PT, NL, EN, FR and DE hubs into `/tmp/conv22-shots/`. Look at each one and fix:
- English UI on a native page
- broken spacing
- the CTA below the fold on mobile
- anything that looks less professional than the Spanish home

Note what you fixed in PROGRESS.md.

## STEP 6 (P1): FILE PREVIEW WITH REAL SIZE

In `StlViewer.tsx` (desktop modal and mobile expanded viewer):

**6.1 Dimension overlay, on by default.** A thin wireframe bounding box around the part, with **X, Y and Z dimension labels in mm**. Labels are HTML overlays (CSS2DRenderer or projected DOM labels), readable in light and dark backgrounds, and never overlapping on small parts. Show "72 × 48 × 30 mm" also as a text line under the viewer for screen readers.

**6.2 Ground grid under the part:** 10 mm minor and 50 mm major lines, subtle, auto-sized to the part, plus a faint outline of the 256 × 256 mm print bed when the part is larger than 120 mm in X or Y.

**6.3 Size comparison toggle ("Comparar tamaño").** A flat silhouette next to the part, chosen automatically by size:
- €1 coin (23.25 mm) for parts < 60 mm
- a bank card (85.6 × 54 mm) for < 200 mm
- an A4 sheet outline above that

Simple line drawings only, no brand logos.

**6.4 Unit sanity warning.** If the largest dimension is < 3 mm or > 600 mm, show "¿Tamaño correcto? Tu archivo podría estar en cm o pulgadas — lo revisamos gratis" with a link that triggers the free review. Do not rescale (pricing must stay identical).

**6.5 Behaviour.**
- Overlay toggles: "Medidas" and "Comparar".
- Keep 60 fps on a mid phone; dispose geometries.
- No change to parse or pricing.
- Unit test the label formatting and the silhouette choice. Take a screenshot with a small part and a large part.

## STEP 7 (P1): VISUAL POLISH ON THE MAIN PAGES

**7.1 Hero review cards** (`Hero.tsx` / `Reviews.tsx`): the cards are cut off by the white wave at the bottom of the hero. Fix spacing and z-order so every card is fully visible on desktop and mobile. Give them a consistent background that reads on both the dark hero and the white section. On mobile they become a horizontal scroll-snap row.

**7.2 Pass over `/`, `/ca/`, `/3d-printing-service` and the IT hub at 390 and 1280.** Fix:
- inconsistent button sizes and radii
- uneven vertical spacing between sections (use one spacing scale)
- text wider than 70ch
- low-contrast grey text on the dark hero (WCAG AA)
- horizontal overflow
- layout shift from images without width/height

Report before/after screenshots paths.

**7.3 Primary action hierarchy everywhere.** On every page:
- exactly one orange primary CTA per viewport (upload / see price)
- WhatsApp only as the floating bubble or a secondary outline button low on the page
- header orange button keeps the running `header_btn_r2` experiment untouched

## STEP 8 (P1): GOOGLE, SEO AND INTERNAL LINKING

**8.1 Consistent language in Google.** Google picks sitelinks itself, but mixed-language sitelinks come from mixed internal links and weak language signals. Fix the signals:
- Every internal link (header, footer, in-content, related blocks, breadcrumbs) on a page in language L points to the language-L equivalent when it exists.
- Write a script `scripts/check-link-language.mjs` that scans `dist/**/index.html` and reports cross-language internal links. Make it fail the build above an allow-list (language switcher, intentional "English version" links).
- Every page has complete reciprocal hreflang, including `x-default` (English hub for intl clusters, `/` for the Spanish cluster).
- Title pattern per language is consistent and ends with " | Dimension3D".

**8.2 Brand entity.**
- On `/` and every hub, `Organization` + `WebSite` JSON-LD with `name: "Dimension3D"`, `alternateName: ["Dimension 3D Prints", "Dimension3D BCN", "Dimension 3D Barcelona"]`, `url`, `logo`, `sameAs` (Instagram, TikTok, YouTube, Google Maps profile URL from existing config).
- Keep the existing LocalBusiness for Barcelona.
- **No** `AggregateRating` (Google does not show star ratings for a business's own reviews about itself; the stars show in the Google Maps/Business panel instead).

**8.3 Internal linking.**
- Add a "Related" block (3–5 contextual links, same language) to every guide, city page, part page and blog post.
- Every Spanish service page links to at least 2 guides and the calculator.
- Every intl page receives ≥ 3 inbound links.
- Run `scripts/report-inbound-links.mjs` before and after, and paste both tables. No orphan pages.

**8.4 Title and meta audit script** (`scripts/check-meta.mjs`): duplicate titles or descriptions, title > 60 chars, description > 155 chars, missing H1, multiple H1. Fix everything it reports on the main money pages (home, hubs, city pages, B2B, catalogue). List the rest in PROGRESS.md.

---

## STEP 9: FINAL VERIFICATION (paste raw output, do not summarise)

1. `npm run typecheck` ; `npm test` (counts) ; `npm run build` (last 40 lines, every check passing).
2. `git diff origin/main --stat -- src/lib/estimator src/lib/pricing.ts src/lib/checkoutV3.ts supabase` must print nothing.
3. `grep -rn "hideLanguageSelector\|data-estimator-open\|modal_actions_r1" src index.html`: only the concluded registry entry and docs may remain (and `data-estimator-open` only where the modal sets it, not in the consent component).
4. Playwright: the STEP 1.7 Buy-button matrix (table of page × mode × variant → buy visible yes/no), the STEP 3.6 consent and recording tests, the STEP 4.1 language-switch matrix and the logo test, all passing.
5. Screenshots list from 5.5, 6.5 and 7.2.
6. Print `docs/conv22/PROGRESS.md`, `docs/conv22/OWNER.md`, `docs/conv22/LOVABLE.md` ; `git status --short` ; `git log --oneline origin/main..HEAD | head -80`.

Then STOP.

---

## OWNER.md must contain (write it, in this order)

1. **Before merging:** PostHog → Project settings:
   - enable **Cookieless server hash mode** (otherwise visitors who have not accepted are not counted);
   - Session replay: **on**, sample rate **100 %**, minimum duration 2 s, canvas recording allowed, no URL or flag triggers that would limit it.
2. Merge `conv-22` and let Vercel deploy. Hard-refresh and accept cookies, then:
   - check that a recording appears in PostHog → Replay within a few minutes;
   - test one real purchase of a €10 part with pickup, then refund it in Stripe.
   - After 7 days, check the accept rate: `consent_decision` accept ÷ `consent_prompt_shown`.
3. **Lovable:** open the project → republish once (so the old `*.lovable.app` copy redirects to the real domain), or unpublish the Lovable site entirely if it is not used.
4. **Stripe** → Settings → Payment methods: turn on **iDEAL** (NL), **Bancontact** (BE), **MB WAY / Multibanco** (PT), **Klarna**, Apple Pay and Google Pay. Checkout already uses dynamic payment methods and the page language. 2 Dutch visitors started checkout last week and neither paid; iDEAL is the default way to pay in the Netherlands.
5. Search Console and Bing: resubmit the sitemap, `npm run indexnow`, request indexing for `/`, `/3d-printing-service` and the IT, PT and NL hubs.
6. Drop the two files that showed no Buy button into `qa/fixtures/user-repro/` if they were not there, and re-run `npx playwright test buy-matrix`.
