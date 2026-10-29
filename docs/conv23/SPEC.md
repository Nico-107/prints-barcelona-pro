# Prompt 23 (site v5.23): International landing pages, Buy for big files, configurator and 3D viewer

How to start (owner):
1. Save this file as `prompt-23.md` in the repo root (`~/Projects/prints-barcelona-pro`). Do not commit it; STEP 0 copies it to docs/conv23/SPEC.md.
2. Terminal: `cd ~/Projects/prints-barcelona-pro && git checkout main && git pull --ff-only origin main && claude --dangerously-skip-permissions`
3. Paste:

```
/goal Read ./prompt-23.md and complete every step in it on branch conv-23, ticking docs/conv23/PROGRESS.md as you go, then run STEP 8 and stop.
```

Branch: `conv-23` from `origin/main` (which includes conv-22). Never `main`.

This is a long, unattended run. Do every step in order without waiting. When something is ambiguous, choose what makes it **easier for a visitor to upload, see a price and pay**, write the decision in PROGRESS.md and continue.

---

## WHAT THE OWNER FOUND AFTER v5.22 (fix all of it)

1. **No Buy button for big files.** Two PLA parts priced €16.97 show "Archivo grande: lo revisamos antes de confirmar" and only a quote button.
   - Cause: `V3_VERIFY_MAX_BYTES` = 30 MB (`StlEstimator.tsx:46`), mirroring `create-instant-checkout`, which re-downloads every STL and refuses files > 30 MB / total > 60 MB (`FILE_TOO_LARGE_FOR_INSTANT`).
   - Files > 50 MB can't even upload ("File troppo grande per il caricamento", Supabase cap).
   - Two of two test files on the Italian page failed the same way.
2. **Review button as big as Buy.** On the Italian page the "Revisione gratuita…" button is full-width, the same size as Buy (the conv-22 "review emphasis" rule).
   - The owner wants the old layout back: a big Buy button, and below it **two small side-by-side buttons: Revisión gratuita | WhatsApp**.
3. **The "price saved" exit popup only appears sometimes.**
   - It doesn't appear when the order was quote-only.
   - It didn't appear on the Italian page.
   - It only offers "back to my order".
4. **The 3D viewer overlay is broken.**
   - When the part is rotated, the grid, bounding box, dimension labels and coin do not rotate with it.
   - Labels read "X 92" with no unit.
   - The coin is hard to see.
   - The toggles are two tiny unlabeled squares.
   - On one file the part could not be rotated at all.
5. **The international landing pages (IT, FR, DE, NL, PT) still look bad and glitchy.** The English page `/3d-printing-service` looks good: **use it as the model.**
   - Brand searches like "Dimension 3D Italy" barely find the Italian page.
   - The owner wants a small country flag on these pages.
6. **No scale control.** Visitors need to make a part bigger or smaller.

---

## BRANCH AND GIT

- `git fetch origin && git checkout -b conv-23 origin/main`. Push only to `conv-23`. Never main, never merge, never open a PR.
- Stage only files you changed on purpose. NEVER `git add -A` or `git add .`. Never commit `.claude/`, `supabase/.temp/`, `.env*`, `dist/`, `prompt-*.md` or large test fixtures (generate big fixtures at test time).
- Commit and push after every finished PROGRESS item (`conv23: <id> <short>`).

## HARD RULES

1. **Pricing must stay byte-identical**: `src/lib/estimator/core.ts`, `src/lib/pricing.ts`, `src/lib/checkoutV3.ts`. The prebuild estimator-sync and pricing-sync checks must pass.
2. **Do not touch `supabase/**`.** Everything below is designed to work with the current edge functions. If you still find something that truly needs a server change, write a ready-to-paste Lovable prompt in `docs/conv23/LOVABLE.md` and continue.
3. **Hydration**: the first client frame equals the prerendered HTML. No `Date`, `Math.random`, `window` or `localStorage` at render. Language comes from the URL in the `useState` initializer. `pathLanguage()` and `urlLanguage()` stay mirrored.
4. Never `routes` in `vercel.json`. Never proxy PostHog.
5. **i18n**: every new string in all 8 files (`es ca en de fr it nl pt`), written natively. Do the two-pass check (key exists, and the value is not a copy of `en.ts`).
6. **No invented facts.**
   - No fake reviews, ratings, customer counts or client names.
   - No `AggregateRating`.
   - Minimum order is €10, no setup fee. Never write "no minimum order".
   - Reviews come only from the existing real reviews data, shown in their original language with a language label, never translated and presented as original.
7. **The Buy button rule.** For an order ≤ €100, in an instant material (PLA, PETG, ABS, ASA, TPU, Nylon), that fits the bed in some orientation, is not multicolour and ships to an instant country, the Buy button is ALWAYS rendered and enabled. **File size is never a reason to hide Buy** (see STEP 1). Keep and extend the conv-22 buy-matrix e2e test.

## STEP 0: SETUP

1. `npm ci && npm run typecheck && npm test && npm run build` must be green before any change. Report the counts.
2. Read and summarise, with file:line references:
   - `StlEstimator.tsx`: the upload path at ~`:457` and ~`:1035`, `filesWithinVerifyLimit`, the oversize-upload card, the exit-intent / abandon popup, and `mobileModalOpen`.
   - `estimator/OrderPanel.tsx`, `CheckoutDialog.tsx`, `CheckoutConfigurator.tsx`, `DefaultSettings.tsx`, `PartRow.tsx`.
   - `StlViewer.tsx` and the conv-22 overlay helpers (`stlViewerUtils`).
   - `lib/stlAnalysis.ts` (parse and analysis), `lib/fileConverters.ts`, `lib/instantBuy.ts`, `config/checkoutUx.ts`.
   - `supabase/functions/create-instant-checkout/index.ts` lines ~640–760: **read only**. Write down exactly what the server checks (sizes, re-analysis, price comparison, the body fields `validateV3` accepts).
   - `pages/InternationalServicePage.tsx` (the model page), `IntlHubPage.tsx`, `IntlCityPage.tsx`, `data/intlContent_*.ts`, `config/intlMarkets.ts`, `components/Hero.tsx`, `Reviews.tsx`, `seo/entities.ts`.
3. Copy this file verbatim into `docs/conv23/SPEC.md`. Create `docs/conv23/PROGRESS.md` with one `- [ ]` line per item (1.1 … 7.4), and print it.
4. Commit, push, and continue.

---

## STEP 1 (P0): BIG FILES CAN BE BOUGHT

The server re-measures the STL it downloads, so whatever file you upload as the order piece must be ≤ 30 MB (total ≤ 60 MB), and the client price must be computed from **that same file**. Make every file fit, in the browser, before pricing:

**1.1 Lossless first.**
- ASCII STL → binary STL in the browser. This is often 4–5× smaller.
- OBJ/3MF/GLB inputs already convert through `fileConverters.ts`. Make sure their output is a binary STL.
- Analyse and price the binary result, and upload it as the order piece.

**1.2 If the binary STL is still > 28 MB: build a "checkout copy".**
- Simplify the mesh in the browser to stay ≤ 28 MB per file, and ≤ 56 MB total for all files together. Use `meshoptimizer` (WASM, `MeshoptSimplifier`, target error ≈ 0.02 mm relative to size, lock the border); about 550k triangles is the 28 MB limit.
- Run it in a Web Worker with a progress line ("Preparando tu archivo… 40 %").
- Verify the copy: volume within ±0.5 % and bounding box within ±0.1 mm of the original. If it fails, retry with a lower error. If it still fails, fall back to the quote path with the reason "file too complex".
- Price **and** upload the checkout copy as the order piece, so the server's re-measure matches and there is no `PRICE_MISMATCH`.

**1.3 Keep the original for printing.**
- Also upload the original next to it as `<same-folder>/<name>.original.stl.gz`, gzipped in the browser with `CompressionStream` so it fits the 50 MB storage cap far more often.
- Put a line in the order notes / metadata the checkout already carries (check `validateV3` from 0.2 for an accepted notes or field). If no field exists, use only the path convention and document it in `docs/conv23/OWNER.md` ("for big files, print from the `.original.stl.gz` next to the order file").
- If even the gzipped original is > 50 MB, upload only the checkout copy and say so in OWNER.md.

**1.4 Files > 50 MB at upload.** Run 1.1–1.2 **before** showing "file too large". Only if the result is still > 50 MB (very rare), show the improved card from STEP 3.3.

**1.5 Remove `file-too-large` as a Buy-blocking reason.** `V3_VERIFY_MAX_BYTES` now applies to the prepared file, which by construction is always within limits.

**1.6 Analytics.** Add a `file_prepared` event with {original_bytes, format, ascii_converted, simplified, triangles_before, triangles_after, final_bytes, ms}.

**1.7 Tests.**
- Unit tests:
  - ASCII→binary gives identical analysis.
  - The simplified copy keeps volume within ±0.5 % on 3 generated meshes (sphere with 2M triangles, a box with holes, a thin-walled shell).
- e2e: generate at test time (do not commit) a 35 MB binary STL and a 45 MB ASCII STL. Upload them on `/`, `/it/stampa-3d-online` and `/fr/impression-3d-en-ligne`. Expect `buy-now-btn` visible and enabled. With the checkout request intercepted, expect every uploaded piece ≤ 30 MB.

## STEP 2 (P0): BUY BUTTON LAYOUT, BACK TO WHAT WORKED

**2.1 Bigger Buy button.**
- Full width, height 56 px desktop and 60 px mobile, text-lg semibold, with the exact total ("Comprar · 16,97 €").
- It is the only orange element in the actions area.

**2.2 Under it, one row of two small, equal buttons:**
- left: "Revisión gratuita" (outline, accent text)
- right: "WhatsApp" (whatsapp-outline)

Each is half width with min-height 40 px, like the old variant A row. Remove the conv-22 "review emphasis" full-width button. Keep `config/checkoutUx.ts`, with emphasis disabled and the comment "owner prefers small review button (v5.23)".

**2.3 Trust lines.** Keep one trust line + payment badges between Buy and the small row, max 2 lines.

**2.4 Quote-only orders.**
- The primary orange button is "Enviar para revisión gratuita" (same size as Buy).
- WhatsApp is a small button under it.
- The one-line reason above stays.

**2.5 Every page and every language uses the same `OrderPanel`.** Check with grep that no international or city page renders a different actions layout.

## STEP 3 (P0): EXIT POPUP ON EVERY PAGE, WITH REAL OPTIONS

**3.1 Trigger.** Closing the calculator modal while at least one file is loaded (priced, quote-only, or failed) opens the popup once per session.
- This applies on every page and language: home, intl hubs, city pages, part pages, landing pages.
- Find why it did not fire on `/it/stampa-3d-online` and fix it at the source (likely the hub mounts the estimator differently or the exit logic is tied to the home page).

**3.2 Contents (localized):**
- **Priced and buyable:**
  - title "Tu precio de 23,98 € queda guardado 24 h"
  - [Volver a mi pedido] (primary orange) reopens the modal with the same files and settings, no re-upload
  - [Prefiero que lo revise una persona] (outline): an inline email/phone field + send, which submits the existing quote request with the files
  - "Ahora no" (text)
- **Quote-only:** title "Tu pedido está casi listo"; [Enviar para revisión gratuita] (primary, inline contact field); [Volver a mi pedido]; "Ahora no".
- **Upload failed / too large:** title "No hemos podido cargar tu archivo"; [Enviar enlace (WeTransfer/Drive)] with inline field; [Enviar por WhatsApp]; "Ahora no".

**3.3 Improve the oversize card in the modal** (now rare) to match:
- a short explanation
- a link field plus an email field
- one button
- WhatsApp as a small secondary

**3.4 Events:** `exit_popup_shown` {variant: priced | quote | failed, page_type, lang} and `exit_popup_action` {action}.

## STEP 4 (P0): 3D VIEWER: OVERLAYS MOVE WITH THE PART, REAL SIZES, SCALE CONTROL

**4.1 One world for the part and its overlays.**
- Rotation must be a **camera orbit** (`OrbitControls`, damping on, pan off, zoom limited), not a rotation of the mesh alone.
- Put the part, grid, bounding box, dimension labels and comparison object in one scene, in real millimetres, part resting on the grid (z = 0) and centred.
- Then everything moves together. Fix the file where rotation did not work at all; find the cause and note it.

**4.2 Dimension labels.**
- Format: "92 mm", with one decimal below 10 mm.
- Colour-coded per axis: X red-ish, Y green-ish, Z blue-ish, with small matching axis lines along the box edges.
- Placed at the edge midpoints and re-projected every frame (CSS2DRenderer or projected DOM).
- Hide a label when its edge is nearly edge-on to the camera, to avoid overlaps.
- Under the viewer, a text line "92 × 73 × 44 mm · ~42 g" for clarity and screen readers.

**4.3 Grid.** Ground grid in mm (10 mm minor, 50 mm major), sized to the part + margin, and fading at the edges. Show the 256 × 256 mm print bed outline only when the part is > 120 mm.

**4.4 Size comparison.**
- The comparison object stands **on the grid next to the part** (same scale, same orbit): €1 coin (23.25 mm) for parts < 60 mm, a bank card (85.6 × 54 mm) for < 200 mm, an A4 sheet above that.
- Give it a solid light material with an outline so it is visible on the grey background.
- A small caption next to it: "Moneda de 1 €".

**4.5 Toggles.** Replace the two tiny squares with two labelled pill buttons, "Medidas" and "Comparar" (localized), at the top-right of the viewer. Both default ON. Plus a "Vista inicial" reset icon.

**4.6 Scale control (Advanced mode, per part and "all parts").**
- A "Tamaño" control: a % slider (25–400 %, step 5) plus a numeric field and three quick unit fixes:
  - "Está en cm" → ×10
  - "Está en pulgadas" → ×25.4
  - "Original" → 100 %
- Show the new dimensions live.
- Scaling multiplies the parsed geometry before analysis, then re-runs the existing analysis and pricing unchanged.
- The **checkout copy uploaded is the scaled binary STL** (and the gzipped original keeps a `scale=<x>` note in its file name or metadata), so the server re-measure matches.
- In Simple mode, if the part's largest side is < 3 mm or > 600 mm, show the unit-fix chips inline with the warning ("¿Tu archivo está en cm o pulgadas?").

**4.7 Performance.** 60 fps on a mid phone. Dispose geometries and labels on file change. Unit test label formatting, the comparison choice and scale maths (dimensions ×s, volume ×s³ through the analysis).

## STEP 5 (P0): INTERNATIONAL LANDING PAGES = THE ENGLISH PAGE'S QUALITY

The owner likes `/3d-printing-service` (`InternationalServicePage.tsx`). Make the IT, PT, NL, FR and DE hubs (`/it/stampa-3d-online`, `/pt/impressao-3d-online`, `/nl/3d-printen-laten-maken`, `/fr/impression-3d-en-ligne`, `/de/3d-druck-service`) use **the same layout and components**, with native copy from `intlContent_*.ts`. Priority order: IT, PT, NL, FR, DE.

**5.1 Shared layout.** Refactor the English page's sections into reusable components (e.g. `IntlLanding/*`), driven by a content object, and render all six pages (EN + 5) from them. Section order:
1. **Hero:**
   - a small flag + market pill ("🇮🇹 Stampa 3D da Barcellona · Spedizione in Italia")
   - H1 with the main local phrase
   - a one-line promise (price in 1 h / instantly online, from €10, delivery days from `intlMarkets`)
   - **one big orange button that opens the file picker** ("Carica il file e vedi il prezzo")
   - "Senza registrazione · Senza impegno"
   - 4 trust chips (from €10 · price in 1 h · shipping €5.90 tracked · no customs in the EU)
   - No WhatsApp in the hero
2. Real review strip (original language + label).
3. "Come funziona": 3 steps.
4. **The embedded calculator** (`id="calculator"`, same `StlEstimator`).
5. Price examples (from the shared estimator helper, locale-formatted), shipping and delivery per country.
6. What we print (prototypes, spare parts, enclosures, small series, figures) with icons.
7. Materials and colours.
8. FAQ.
9. The long native SEO guide text, moved here under an H2, every word kept.
10. Links: cities, guides, parts, materials, B2B.
11. A final CTA band (orange upload button).

**5.2 Flags.**
- Hero pill: 🇮🇹 🇵🇹 🇳🇱 🇫🇷 🇩🇪 🇬🇧.
- Language selector items get small flags (🇪🇸 🇦🇩 for ca, 🇬🇧, 🇩🇪, 🇫🇷, 🇳🇱, 🇮🇹, 🇵🇹).
- The footer's "countries we ship to" already uses flags; keep consistent.
- Use emoji flags in text only, no images, no layout shift.

**5.3 Brand searches** ("Dimension 3D Italy", "Dimension3D Italia", "Dimension 3D Prints Portugal"…).
- Hub titles start with the local phrase and end with "| Dimension3D Italia" (or the local country name). Keep titles ≤ 60 chars (shorten the phrase if needed).
- The hero pill and first paragraph contain "Dimension3D" naturally.
- The `Organization` JSON-LD on each hub: `alternateName` adds "Dimension3D <Country>" and "Dimension 3D Prints <Country>".
- **Also add `Organization` + `WebSite` JSON-LD to the Spanish home `/`.** conv-22 missed it: `dist/index.html` has none. Add a build check that `/` and every hub contain it.

**5.4 Glitches.** At 390 × 844, 768 × 1024 and 1280 × 900, screenshot every hub (top, calculator, FAQ, footer) into `/tmp/conv23-shots/`. Look at each one and fix:
- overlaps
- horizontal scroll
- English UI on native pages
- the CTA below the fold on mobile
- layout shift
- anything that looks worse than the English page

List what you fixed.

**5.5 Analytics.** `international_page_view` and `international_cta_click` keep {market, lang}. Add `section` to CTA clicks (hero | final | sticky).

## STEP 6 (P1): CONFIGURATOR POLISH

**6.1 Default view.** After upload the viewer opens in a 3/4 view, with the part filling ~70 % of the frame.

**6.2 Part list.** Each row shows the dimensions and the per-part price. Clicking a row selects it in the viewer.

**6.3 Shipping/pickup.** Always pre-selected (shipping, or pickup on pickup pages). The two choices are visible as a compact segmented control directly above Buy on every page, including the home (it was missing on the Spanish screenshot).

**6.4 Mobile.** At 390 × 844, the price, the fulfillment choice and Buy are visible without scrolling once a price exists (sticky footer in `CheckoutDialog`). Screenshot proof.

**6.5 Advanced mode.** Group the settings into: Material & colour · Size (scale) · Quality & strength · Orientation & supports. One-line help text each, all localized.

## STEP 7 (P1): CHECKS

**7.1** Extend the conv-22 `e2e/buy-matrix.spec.ts`:
- every hub + `/` + one city page
- Simple and Advanced
- a small file, a 35 MB binary and a 45 MB ASCII (generated)

Buy visible and enabled in every row. Print the table.

**7.2 Exit popup e2e:** priced, quote-only and failed variants on `/` and `/it/stampa-3d-online`.

**7.3 Viewer e2e:**
- rotate by dragging
- assert the label DOM nodes move
- assert the comparison object and grid stay attached (project a known world point before and after the orbit; it must move consistently with the part)

**7.4** `node scripts/check-link-language.mjs` and the meta and JSON-LD checks pass. The `report-inbound-links` numbers for hubs are ≥ conv-22.

## STEP 8: FINAL VERIFICATION (paste raw output)

1. `npm run typecheck` ; `npm test` (counts) ; `npm run build` (last 40 lines, all checks passing).
2. `git diff origin/main --stat -- src/lib/estimator src/lib/pricing.ts src/lib/checkoutV3.ts supabase` must print nothing.
3. Playwright: buy matrix, exit popup and viewer tables, all green.
4. The screenshot list from 5.4 and 6.4.
5. Print `docs/conv23/PROGRESS.md`, `docs/conv23/OWNER.md` (and LOVABLE.md if created) ; `git status --short` ; `git log --oneline origin/main..HEAD | head -60`.

Then STOP. Do not merge.
