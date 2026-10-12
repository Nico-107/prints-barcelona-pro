# QA Fix 12 — Progress

## Step 0 — Setup and baseline
- [ ] 0.1 npm ci && npm run typecheck && npm test && npm run build green
- [ ] 0.2 Create docs/qa/SPEC.md and docs/qa/PROGRESS.md; commit and push
- [ ] 0.3 Build QA crawler (Step 1) and run baseline; save docs/qa/baseline.md; commit

## Step 1 — The QA crawler
- [ ] 1.1 Create scripts/qa/crawl.mjs (Playwright, all routes, R1–R8)
- [ ] 1.2 Add npm run qa script
- [ ] 1.3 Run baseline and save docs/qa/baseline.md

## Step 2 — Language from the URL, everywhere
- [ ] 2.1 Create shared pathLanguage module with all locale prefixes
- [ ] 2.2 Fix pathLanguage() in LanguageContext.tsx
- [ ] 2.3 Fix mirror in entry-server.tsx
- [ ] 2.4 Unit test covering every sitemap route
- [ ] 2.5 Language-prefixed pages forced (no browser override)
- [ ] 2.6 Remove automatic browser-language switch on unprefixed Spanish pages
- [ ] 2.7 Prerendered HTML has right-language header/footer/calculator

## Step 3 — Remove every hard-coded language ternary
- [ ] 3.1 Audit all ES/EN/CA ternaries in Header, Footer, StlEstimator and sub-components
- [ ] 3.2 Replace ternaries with t() keys in all 8 languages
- [ ] 3.3 Write natural copy for DE/NL/FR/IT/PT
- [ ] 3.4 Update scripts/check-i18n-new-keys.mjs
- [ ] 3.5 Add test that every key exists in all 8 files
- [ ] 3.6 Header translated on de/fr/it/nl/pt (nav targets, menus, logo)
- [ ] 3.7 Footer translated on de/fr/it/nl/pt

## Step 4 — Language switcher
- [ ] 4.1 de/fr/it/nl/pt pages show active language + EN + ES with equivalents
- [ ] 4.2 es/en/ca pages keep ES/EN/CA + compact "More" menu with five hubs
- [ ] 4.3 Manual switching always lands on correct language page

## Step 5 — Content wiring audit on all intl pages
- [ ] 5.1 Fix hub main button label (CTA in page language, not priceTableCaption)
- [ ] 5.2 Fix city main button label (CTA in page language, not city name)
- [ ] 5.3 Secondary button: "WhatsApp" + short verb in page language
- [ ] 5.4 Audit all IntlHubPage, IntlCityPage, IntlGuidePage, IntlPartPage fields
- [ ] 5.5 Unit test: main CTA label ≤ 45 chars, differs from city name and table caption
- [ ] 5.6 Replace "2025" in titles/text

## Step 6 — Quote flow works on every page type
- [ ] 6.1 Create tests/fixtures/cube-20mm.stl
- [ ] 6.2 Find and fix review_blocked_missing_contact / missing contact bug
- [ ] 6.3 Error message visible and in page language
- [ ] 6.4 Success state in page language with reference number
- [ ] 6.5 Error state in page language + PostHog event; never fail silently
- [ ] 6.6 Await email call; show success only when request stored
- [ ] 6.7 Add npm run qa:quote Playwright test (6 pages, mocked Supabase)

## Step 7 — Customer confirmation email
- [ ] 7.1 Add customer email in request language to send-quote-request/index.ts
- [ ] 7.2 All 8 languages translated subject and body
- [ ] 7.3 Customer email failure does not block owner email success
- [ ] 7.4 Owner recipients unchanged

## Step 8 — Clean run and live check
- [ ] 8.1 npm run qa reports 0 violations on all routes, both locales, both viewports
- [ ] 8.2 npm run qa:quote passes
- [ ] 8.3 Live end-to-end test: real quote from /de/3d-druck-service

## Step 9 — Final verification
- [ ] 9.1 npm run typecheck exits 0
- [ ] 9.2 npm test exits 0 (counts shown)
- [ ] 9.3 npm run build exits 0 (last 40 lines shown)
- [ ] 9.4 npm run qa summary: 0 violations
- [ ] 9.5 npm run qa:quote passes
- [ ] 9.6 git diff origin/main --stat estimator/checkoutV3/create-instant-checkout prints nothing
- [ ] 9.7 git diff origin/main --stat supabase shows only send-quote-request
- [ ] 9.8 Before/after violations table printed
- [ ] 9.9 PROGRESS.md printed with all items ticked
- [ ] 9.10 git status --short clean
- [ ] 9.11 git log -1 origin/qa-fix-12 equals HEAD
