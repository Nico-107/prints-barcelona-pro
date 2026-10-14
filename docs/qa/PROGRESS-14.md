# Checkout polish – Prompt 14

- [x] Item 1: One clear message per problem, no duplicates
      — section='actions' renders single `actionError`; section='form' shows only field hints; one key for missing contact
- [x] Item 2: Review blocked → focus the email field
      — `handleManualReview` calls `setContactTouched(true)` (ContactFields handles scroll+focus); `handleInstantBuy` calls `fulfillmentPickerRef.current.scrollIntoView()+focus()` when fulfillment is null
- [x] Item 3: Buy now label and default choice
      — `buyNowLabel` uses `calc.instantBuy.buyNow.from` ("from {price}") before selection, exact total after; preselects shipping for intl pages on mount (useEffect)
- [x] Item 4: Readable buttons
      — removed `truncate`, use `.short` key variants (≤22 chars in all 8 langs), `whitespace-nowrap` on compact picker; stacks under 400px
- [x] Item 5: Prices in the local format
      — `formatEUR(value, language)` via `Intl.NumberFormat` with locale map; applied in OrderPanel, PriceBreakdown, PartRow, PartSummaryList, StlEstimator priceDisplay
- [x] Item 6: Exit-intent popup only when someone really leaves
      — sessionStorage flag `dim3d-exit-intent-shown` prevents re-showing; gated on `!isSubmittedQuote && !isCheckingOut && !showManualReview`
- [x] Item 7: Leftover language bugs in the estimator
      — `t("calc.mat.more")` in CheckoutConfigurator; `t("calc.student.discount")` in StlEstimator; success/cancelled banners via `t()`; refCity banner via `t("calc.ref.*.banner")` in all 8 langs; German Sie form (8 keys)
- [x] Item 8: Stripe returns the buyer to the page they came from
      — `returnPath: window.location.pathname` passed in checkoutBody; edge fn validates regex `^\/[a-z0-9\-/]{0,120}$`, uses `${SITE_URL}${validReturnPath}?checkout=success`; SITE_URL → `https://www.dimension3dprints.com`
- [x] Item 9: Language switcher without an equivalent page
      — `LANG_HUB` map in LanguageSelector.tsx; when `landingTopicSlugs[lang]` is missing, navigate to hub (e.g. `/de/3d-druck-service` for de)

## Verification

- `npm run typecheck` — ✅ 0 errors
- `npm test` — ✅ 624/624 pass
- `npm run build` — ✅ 155 pages, 0 violations, 0 broken links
- `npm run qa` — ✅ 0 accessibility violations (600 combos)
- `node scripts/qa/quote-flow.mjs` — ✅ 11/11 tests pass (quote + buy + silent-fail guards)
