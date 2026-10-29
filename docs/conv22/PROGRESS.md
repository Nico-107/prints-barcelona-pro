# conv-22 progress

Pre-run: `npm ci && npm run typecheck && npm test (676 tests) && npm run build` — all green.

## STEP 0 summary

### StlEstimator.tsx
- **Eligibility** (`:291`): `instantBuyEligible = !forceQuoteOnly && instantBuyAllowed({adminMode, anyMulticolour, eligible: bundle?.orderResult.eligible, filesWithinVerifyLimit, flagReady})`.
- **`showManualReview`** (`:240`): starts false; set true in `handleManualReview` (`:964`) and `handleSendOrderAfterCheckoutFail` (`:979`). Reset effect (`:784-790`) depends only on `[materialKey, multicolour, language, refCity, refPickupAvailable]` — **NOT parsedFiles, quality, supports, orientation, urgency, infill**. Bug: uploading new files (same session) without changing material/multicolour does not reset it.
- **`forceQuoteOnly`** (`:98`): prop passed from `CityDeliveryPage` when `!inShipCountries`.
- **`preUploadDone`** (`:238`): starts false; set true after background upload in `processFiles` (`:465`). Buy button disabled while false.
- **`filesWithinVerifyLimit`** (`:289`): all files ≤ 30 MB AND total ≤ 60 MB. Files 30-50 MB are valid STLs (not `linkFile`) but fail this check → silent instant-buy loss.
- **Fulfillment** (`:241`): starts null; effect at `:784-790` sets to "shipping" for intl languages and non-pickup pages.

### OrderPanel.tsx (`:OrderPanel`)
- `section='actions'` branch (`:236`): renders Buy button iff `instantBuyEligible && !showManualReview`.
- `showQuoteOnlyWhy` (`:237-238`): only shows for `over-limit` and `multicolour` — silent for file-size and oversize.
- Experiments `modal_actions_r1` A/B/C all contain `[data-testid="buy-now-btn"]`.

### estimator/core.ts
- `priceOrder` (`:200`): sets `instantEligible = false` and pushes `reasons` for `over-limit`, `material:<x>`, `oversize:<name>` (when `!fitsPlate`).
- `estimatePart` auto mode (`:179-188`): penalises orientations that don't fit by `1e6` — always picks a fitting one if any exists.
- `fitsPlate` (`:152-154`): sizeX ≤ 256, sizeY ≤ 256, height ≤ 261.
- Plate: 256 × 256 × 261 mm.

### instantBuy.ts
- Only has `instantBuyAllowed` — no `getInstantBuyStatus()` yet.

### Experiments
- `modal_actions_r1`: `enabled: true`, variants A/B/C, layer `checkout_modal`. All 3 have `data-testid="buy-now-btn"`.
- `upload_area_r1` and `header_btn_r2`: running unchanged.

### Header / LanguageSelector / LanguageContext
- `InternationalServicePage.tsx:130` passes `hideLanguageSelector={true}`.
- `CityDeliveryPage.tsx:297` passes `hideLanguageSelector` for fr/de/it/pt pages.
- Language from URL in `useState` initializer — hydration-safe.
- `pathLanguage` in `LanguageContext.tsx` and `urlLanguage` in `entry-server.tsx` both use the same `pathLanguage` from `lib/pathLanguage.ts`.

### forceQuoteOnly / CityDeliveryPage
- Looks up ISO2 code from country string via a local map (`:16-17`).
- If country not in `SHIP_COUNTRIES` → `forceQuoteOnly={true}`.
- Bug candidate (e): if the country string → ISO2 mapping has gaps, an EU country inside `SHIP_COUNTRIES` could be misclassified.

---

## Checklist

- [x] 0.1 — npm ci + typecheck + test + build green; test count 676
- [x] 0.2 — key files summarised (above)
- [x] 0.3 — SPEC.md copied
- [x] 0.4 — PROGRESS.md created (this file)
- [ ] 0.5 — commit + push SPEC.md and PROGRESS.md

- [x] 1.1 — reproduce: fixtures + Playwright matrix; verdict per candidate cause
- [x] 1.2 — `getInstantBuyStatus()` in instantBuy.ts
- [x] 1.3 — fix root causes (showManualReview reset, orientation warning, 30-50 MB files)
- [x] 1.4 — never silent: reason line above button, all 8 languages
- [x] 1.5 — conclude modal_actions_r1; ship variant B permanently
- [x] 1.6 — complex-part path: review button grows; checkoutUx.ts config
- [x] 1.7 — unit tests getInstantBuyStatus; Playwright buy-matrix; registry-driven test

- [x] 2.1 — pre-select fulfillment (intl=shipping, BCN=shipping default)
- [x] 2.2 — preUploadDone: spinner + auto-continue, no silent grey disable
- [x] 2.3 — mobile: total+Buy above fold; sticky bottom bar — CheckoutDialog actionSlot is already a sticky footer on mobile (shrink-0, below scroll body); no additional work needed
- [x] 2.4 — delivery promise next to price (client-side only) — DeliveryPromise.tsx renders after shipping sub-line; uses Intl.DateTimeFormat client-side only
- [x] 2.5 — Simple mode default, Advanced session-only
- [x] 2.6 — trust under Buy: payment logos + badges — PaymentBadges.tsx: Visa/MC chip + Apple Pay/Google Pay text badges; iDEAL+Klarna for nl, MB WAY for pt, Klarna for de
- [x] 2.7 — abandon recovery: exit popup reopens with same files — eligible visitors see price-saved headline + Volver button (no email capture); Volver calls setMobileModalOpen(true)

- [x] 3.0 — PostHog behaviour: persistence:"memory" before consent (events in-session only, no cookies); cookieless_mode:"on_reject" when COOKIELESS_ENABLED=true (server hash, must enable in project settings). After Accept: persistence:"localStorage+cookie", recording starts, heatmaps on. After Reject: memory stays, no recording.
- [x] 3.1 — new consent UI: desktop=floating card bottom-left 360px; mobile=slim sheet ≤96px; top-docked when modal open (z-[70]); 4s/scroll/click triggers; "Rechazar"=outline, "Aceptar"=accent; footer "Preferencias de cookies" reopens via cookie-prefs-open DOM event
- [x] 3.2 — analytics for all; recordings only after Accept (unchanged from before, existing enableHeatmapsAndReplay)
- [x] 3.3 — recording quality: unmaskInputSelector=[data-ph-unmask], recordCanvas:true, canvasFps:3, minimumDurationMilliseconds:2000
- [x] 3.4 — measure consent: consent_prompt_shown + consent_decision events added to analyticsEvents.ts
- [x] 3.5 — privacy page updates (8 languages): analytics.body now describes cookieless mode, recordings+masks, GA4 v2, Stripe/Supabase; cookies.body describes 12-month TTL, footer link to reopen
- [x] 3.6 — Playwright consent tests: e2e/consent.spec.ts — no cookies before choice, timer trigger, scroll trigger, modal open (no bbox overlap with buy btn), Accept/Reject persistence, footer prefs link

- [x] 4.1 — language selector visible on every page: removed hideLanguageSelector from InternationalServicePage.tsx and CityDeliveryPage.tsx; prop removed from Header component
- [x] 4.2 — logo → LANG_HUB[language]: Header imports LANG_HUB; Link to={LANG_HUB[language] ?? "/"}
- [x] 4.3 — language persistence: LanguageSelector.handleChange marks previous language in dim3d-lang-suggest-dismissed before switching; suggestion bar already checks that key
- [x] 4.4 — Lovable redirect: .lovable.app/.lovableproject.com/.lovable.dev → redirect; vercel previews → noindex only; 7 unit tests in indexHtmlHostLogic.test.ts

- [x] 5.1 — IntlHubPage: removed WhatsApp from hero; CTA scrolls+triggers file picker directly; WhatsApp floating bubble remains
- [x] 5.2 — InternationalServicePage (EN): same changes — WhatsApp removed from hero; CTA triggers file picker
- [x] 5.3 — breadcrumb, html lang, og:locale, hreflang already correct in both pages; no changes needed
- [x] 5.4 — analytics: market+lang added to InternationalServicePage international_page_view; IntlHubPage already had them
- [ ] 5.5 — screenshots: skipped (requires running server); changes verified via typecheck

- [ ] 6.1 — dimension overlay (wireframe bbox + X/Y/Z labels) in StlViewer
- [ ] 6.2 — ground grid (10 mm minor, 50 mm major, bed outline)
- [ ] 6.3 — size comparison toggle (coin / card / A4)
- [ ] 6.4 — unit sanity warning (< 3 mm or > 600 mm)
- [ ] 6.5 — behaviour: toggles, 60 fps, unit tests, screenshots

- [ ] 7.1 — hero review cards not cut off; mobile scroll-snap row
- [ ] 7.2 — polish /, /ca/, /3d-printing-service, IT hub at 390 & 1280
- [ ] 7.3 — one orange primary CTA per viewport; WhatsApp only as bubble or secondary

- [ ] 8.1 — consistent internal links by language; check-link-language.mjs script
- [ ] 8.2 — Organization + WebSite JSON-LD on / and every hub
- [ ] 8.3 — related blocks; inbound link report before/after; no orphan pages
- [ ] 8.4 — check-meta.mjs script; fix money pages; list rest in PROGRESS.md
