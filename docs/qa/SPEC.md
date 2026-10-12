# Prompt 12 — Full-site QA and fix: every page in its own language, every button correct, quotes that really send

Run this file with the /goal line Claude gave you. Branch: qa-fix-12. Never main. This is a long, unattended run; work through every step in order without waiting for me.

## Why this run exists (read first)

The owner opened /de/3d-druck-service and /de/3d-druck-berlin and found, within one minute:
- Header, footer, calculator, cookie banner, WhatsApp bubble and sticky bar in Spanish or English on German pages. The language switcher offers ES / EN / CA on a German page.
- The hub's main button shows the sentence "Richtwert für ein 50-g-Teil in PETG. Ihr genaues Angebot erhalten Sie über den Kalkulator." and the city page's main button just says "Berlin".
- A quote request from the German hub was never sent (PostHog logged `review_blocked_missing_contact` with code `missing`, then nothing), and the customer never receives any confirmation email after a quote request on any page.

Root causes already found in the code (verify each, then fix at the root, not page by page):
1. `pathLanguage()` in `src/contexts/LanguageContext.tsx` (and its mirror in `src/entry-server.tsx`) knows nothing about the `/de/`, `/nl/`, `/fr/`, `/it/`, `/pt/` prefixes, so those pages render with language `es`, and the post-hydration effect can then switch them to the browser language. It also wrongly forces the ENGLISH pages `/3d-printing-delivery-paris|berlin|amsterdam|milan|rome|lisbon` into fr/de/nl/it/pt UI.
2. About 85 hard-coded language ternaries (`isEs ? … : isCa ? … : …`, `X[language] ?? X.en`) in Header, Footer, StlEstimator, BusinessCTA, Hero and others fall back to English or Spanish for de/fr/it/nl/pt.
3. `src/components/LanguageSelector.tsx` only knows ES / EN / CA (plus a special FR/NL case).
4. Content-field mix-ups: `IntlHubPage.tsx` renders `content.priceTableCaption` as the main button label; `IntlCityPage.tsx` renders `content.city` as the main button label. Other fields may be mis-wired the same way.
5. `supabase/functions/send-quote-request/index.ts` only emails the owner. The customer gets no confirmation at all.

The goal: a visitor on ANY page sees ONE language everywhere (content, header, footer, calculator, checkout, dialogs, errors, cookie banner, floating buttons, emails), every button says what it does, and every quote request is sent, confirmed on screen and confirmed by email.

## Branch and git rules
- `git fetch origin && git checkout -b qa-fix-12 origin/main`. Push to this branch only (`git push -u origin qa-fix-12`). Never main, never merge, never a PR.
- Stage only files you changed on purpose (`git add <paths>`). Never `git add -A` or `git add .`. Never commit `.claude/`, `supabase/.temp/`, `.env*`, `dist/`, `qa/screenshots/`.
- Commit and push after every finished step, so a usage-limit pause loses nothing.

## Hard rules
- Do NOT change pricing: the code between `// ESTIMATOR-START/END` and `// CHECKOUT-V3-START/END` in `src/lib/estimator/core.ts`, `src/lib/checkoutV3.ts` and `supabase/functions/create-instant-checkout/index.ts` stays byte-identical (estimator-sync and pricing-sync must pass). Do not touch the `data-xp-*` A/B markup or the experiment assignment.
- The only edge function you may change is `send-quote-request` (Step 7). Report clearly that it needs a Lovable redeploy.
- Hydration rule: the first client frame equals the prerendered HTML for every route.
- No invented facts. Never claim things the business does not do.

## Step 0 — Setup and baseline
1. `npm ci && npm run typecheck && npm test && npm run build` green; report the test count.
2. Create `docs/qa/SPEC.md` = this whole file verbatim, and `docs/qa/PROGRESS.md` with one `- [ ]` line per step and sub-step below. Commit and push.
3. Build the QA crawler (Step 1) and run it on the untouched build. Save the baseline report as `docs/qa/baseline.md` (violations per rule and per page). Commit.

## Step 1 — The QA crawler (the definition of "done")
Create `scripts/qa/crawl.mjs` (Playwright, chromium at `/opt/pw-browsers/chromium` via executablePath if the default is missing; else the installed Playwright browser). It serves `dist/` locally and visits EVERY route in `public/sitemap.xml` plus `/`, twice: browser locale `en-US` and `es-ES`, viewports 1280x900 and 390x844. For each page it waits for hydration (network idle + 1.5 s) and records violations:
- **R1 language**: `<html lang>` and the language context match the route's expected language (derive the expected language from the route table, one source of truth).
- **R2 foreign UI text**: collect every visible text node in header, footer, calculator section, dialogs it can open without a file, cookie banner, floating WhatsApp, sticky bars. Load all 8 translation files; a node is a violation if its trimmed text exactly equals a translation value of language M for key K while the page language is L (M ≠ L) and translations[L][K] differs. Also flag any hard-coded string from a known ES/EN/CA ternary list that appears on a de/fr/it/nl/pt page.
- **R3 switcher**: the language switcher shows the page's own language as active, and every option links to an existing route whose language is that option (prefer the equivalent page; else that language's hub/home).
- **R4 buttons**: every visible button and button-like link has a label of 2–45 characters, is not just a city name or number, does not end with a full stop, and its text is in the page language.
- **R5 links**: every internal link resolves to a route in dist (no 404, no redirect chain).
- **R6 console**: no console errors, no React hydration warnings ("did not match", "Hydration failed").
- **R7 layout**: no horizontal overflow at 390 px (`scrollWidth > innerWidth`), no element overlapping the main CTA, no floating button covering the sticky bar.
- **R8 meta**: one H1, title ≤ 60 chars, description ≤ 160, canonical present, hreflang targets exist and are reciprocal; no title or text says 2025.
It writes `docs/qa/report.md` (table: rule, page, viewport, locale, detail), saves screenshots to `qa/screenshots/` (gitignored), and exits 1 if any violation remains. Add `npm run qa` for it. Run it after every step.

## Step 2 — Language from the URL, everywhere
- Fix `pathLanguage()` and its mirror in `entry-server.tsx`: `/de/` → de, `/nl/` → nl, `/fr/` → fr, `/it/` → it, `/pt/` → pt; the English `/3d-printing-delivery-*` pages → en; keep `/ca/` → ca and the existing German maker guides → de. Put the mapping in ONE shared module imported by both, with a unit test covering every sitemap route.
- Language-prefixed pages are forced: never overridden by browser language or localStorage (same treatment the code already gives en/fr pages).
- Remove the automatic switch to the browser language on unprefixed Spanish pages: it produces Spanish content with an English header for English-browser visitors. The URL decides the language on first load; only an explicit click on the switcher changes it (and should navigate to the equivalent page when one exists). Report which pages had no equivalent.
- The prerendered HTML must already contain the right-language header, footer and calculator text (no flash of Spanish).

## Step 3 — Remove every hard-coded language ternary
- Replace all ES/EN/CA ternaries and `X[language] ?? X.en` lookups in components that render on any page (Header, Footer, StlEstimator and its sub-components, CheckoutConfigurator, OrderPanel, ContactFields, dialogs, Hero, BusinessCTA, WhatsAppFloat, cookie banner, sticky bars, LaunchOfferBanner, exit-intent, error messages, toasts) by `t()` keys present in all 8 languages. Write natural copy per language (DE "Sie", NL "je", FR "vous", IT "tu", PT European Portuguese). Update `scripts/check-i18n-new-keys.mjs` and add a test that every key exists in all 8 files.
- Header on de/fr/it/nl/pt pages: translated labels. Nav targets that have no native page go to the English equivalent (For business → the English B2B page, Custom design → the English design page). The Services/Resources menus list that language's hub, cities and guides. The logo goes to that language's hub.
- Footer on those pages: translated labels and the "countries we ship to" block.
- Do not change `data-xp-*` markup; only make sure each variant text resolves in all 8 languages through `t()` with a sensible fallback.

## Step 4 — Language switcher
- On de/fr/it/nl/pt pages show the page language (active) plus EN and ES; each goes to the equivalent page (use the hreflang pairs; else the target language's hub or home). On es/en/ca pages keep ES / EN / CA and add a compact "More" menu listing the five hubs by language name.
- Manual switching never sends the visitor to a page in a different language than the one chosen.

## Step 5 — Content wiring audit on all intl pages (hubs, cities, guides, parts)
- Fix the hub main button (label: the calculator call to action in that language, e.g. DE "Datei hochladen und Preis sehen") and the city main button (same, not the city name). The secondary button says "WhatsApp" plus a short verb in that language.
- Audit every content field rendered by `IntlHubPage`, `IntlCityPage`, `IntlGuidePage`, `IntlPartPage`: each field is rendered where it belongs (captions under tables, notes under prices, labels on buttons). Write a unit test that the main CTA label of every intl page is ≤ 45 characters and differs from the city name and the table caption.
- Replace "2025" in titles and text with the current year only where a year is needed, or remove it.

## Step 6 — The quote flow works on every page type, and the customer sees it worked
- Reproduce on `/`, `/impresion-3d-empresas-barcelona`, `/de/3d-druck-service`, `/de/3d-druck-berlin`, `/fr/impression-3d-en-ligne`, `/3d-printing-delivery-berlin`: upload `tests/fixtures/cube-20mm.stl` (create it), get an estimate, open "request a quote / review", fill email, submit.
- Find why the owner's German attempt was blocked as `missing` contact: check that the contact inputs the user types into are the same state `checkContact()` reads, that the error message is visible and in the page language next to the field, that the button that opens the review dialog and the one that sends the quote are clearly labelled and in the right order, and that a second click after filling the email actually submits. Fix it.
- After a successful submit the customer must see a clear success state in the page language ("Request sent. We reply within 1 hour on business days.") with the reference number. On failure (upload error, insert error, function error) show an error in the page language and capture a PostHog event; never fail silently. Stop treating the email call as fire-and-forget for the UI: await it with a timeout and show success only when the request was stored.
- Add a Playwright test (`npm run qa:quote`) that runs this flow on the six pages above with the Supabase calls intercepted (mocked success and mocked failure), asserting: the insert payload and the `send-quote-request` body are sent, `language` equals the page language, `sourceCity` is set where relevant, and the success or error message appears in the page language.

## Step 7 — Customer confirmation email (edge function change, needs Lovable redeploy)
- In `supabase/functions/send-quote-request/index.ts`, after the owner email succeeds and when `contactEmail` is present, send a second email to the customer in the request's `language` (es, en, ca, de, fr, it, nl, pt; default en): subject "We received your 3D printing request" (translated), the reference, file names, material, quantity, the estimated price if present, "we reply within 1 hour on business days", and the WhatsApp link. Same `from` address. Do not include internal cost data. If the customer email fails, still return success for the owner email but log it.
- Keep the owner recipients exactly as they are (including the Sevilla routing).
- Report at the end, in capitals: "AFTER MERGE: REDEPLOY send-quote-request IN LOVABLE".

## Step 8 — Clean run and live check
- `npm run qa` must report 0 violations on every route, both locales, both viewports. `npm run qa:quote` passes.
- One live end-to-end test after all fixes: run the dev server with the real `.env`, submit ONE real quote from `/de/3d-druck-service` with email `011107miko@gmail.com` and the note "QA TEST, ignore". Print the network response status of the insert and of `send-quote-request`. (The customer confirmation email only arrives after the Lovable redeploy; say so.)

## Step 9 — Final verification (raw output)
`npm run typecheck` ; `npm test` (counts) ; `npm run build` (last 40 lines, all checks passing) ; `npm run qa` (summary: 0 violations) ; `npm run qa:quote` ;
`git diff origin/main --stat -- src/lib/estimator src/lib/checkoutV3.ts src/components/estimator supabase/functions/create-instant-checkout` (must print nothing) ;
`git diff origin/main --stat -- supabase` (only send-quote-request) ;
a before/after table from `docs/qa/baseline.md` vs the final report (violations per rule) ;
print `docs/qa/PROGRESS.md` ; `git status --short` ; `git log --oneline origin/main..HEAD`.
Then STOP.
