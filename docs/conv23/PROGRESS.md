# Conv-23 Progress

## STEP 0: Setup
- [x] 0.1 npm ci && typecheck && test && build green (46 test files, 705 tests, 153 pages, 0 violations)
- [x] 0.2 Key files read and summarised (see below)
- [x] 0.3 SPEC.md and PROGRESS.md created

### File summary (STEP 0.2)

**StlEstimator.tsx**
- `:42` `MAX_BYTES = 50MB` — Supabase Free plan hard upload cap; files > this are `oversizedFiles`
- `:46` `V3_VERIFY_MAX_BYTES = 30MB` — client-side gate that feeds `filesWithinVerifyLimit`
- `:290` `filesWithinVerifyLimit = validFiles.every(f => f.sizeBytes <= V3_VERIFY_MAX_BYTES) && validFiles.length > 0`
- `:461` pre-upload loop skips files where `f.sizeBytes > MAX_BYTES`
- `:2184` exit-intent only fires when `instantBuyEligible && !showManualReview && !isSubmittedQuote` → **broken for quote-only orders and intl pages that always go quote-only**
- `:2162` `mobileModalOpen` state drives `CheckoutDialog`; the exit timer is in its `onOpenChange` handler

**estimator/OrderPanel.tsx (section='actions')**
- `:212–226` `showEmphasisReview` — full-width review button when price ≥ €60, Nylon/TPU, dim > 200 mm, heavy supports, or qty ≥ 20
- `:420–445` instant-buy branch: when `showEmphasisReview=true` renders full-width outline button; otherwise renders a tiny text link
- `:716–795` section='all' branch: full-width outline `Review` button + WhatsApp — **this is the conv-22 emphasis layout that needs reverting to small side-by-side**

**CheckoutDialog.tsx**
- Presentational shell: left (viewer+parts+actionSlot pinned), right (scrolls) on desktop; single-column on mobile with sticky footer

**CheckoutConfigurator.tsx / DefaultSettings.tsx / PartRow.tsx** — standard configurator settings UI; per-part overrides

**StlViewer.tsx**
- Overlays (grid, bounding-box labels, comparison object) are positioned as React DOM nodes with pixel-projected coordinates from Three.js
- Rotation moves the mesh, not the camera → labels don't follow; the compare group is added to scene but labels are projected from fixed world points, so they appear to detach on rotate
- Toggles are tiny `overlayBtn()` styled buttons (10px font, "2px 6px" padding) — no text labels

**stlViewerUtils.ts**
- `:11` `gridSizeForPart(maxDim)` — rounds up to nearest 100 mm
- `:15–17` `COMPARE_NEXT` / `COMPARE_LABEL` — coin/card/a4 cycle; labels are symbols `⊡ ● ⊟ A4`

**lib/stlAnalysis.ts**
- `parseStl(buffer)` handles binary and ASCII STL; returns volumeMm3, overhangPct, boundingBoxMm
- ASCII path uses `TextDecoder` regex — much slower and larger than binary

**lib/fileConverters.ts**
- `objToStlBuffer`, `threeMfToStlBuffer`, `glbToStlBuffer` — all produce binary STL via `STLExporter({ binary: true })`
- `stlBboxMm(buf)` — reads binary STL only; `stlMaxDimMm` wraps it

**lib/instantBuy.ts**
- `:42` `!p.filesWithinVerifyLimit` → pushes `'file-too-large'` reason → Buy button hidden
- `getInstantBuyStatus` is the single source of truth

**config/checkoutUx.ts**
- `REVIEW_EMPHASIS.minTotalEur = 60`, materials: Nylon/TPU, `REVIEW_EMPHASIS_MAX_DIM_MM = 200`, `REVIEW_EMPHASIS_MIN_QTY = 20`

**supabase/functions/create-instant-checkout/index.ts (:689–714) — READ ONLY**
- Server re-downloads each STL from storage
- `MAX_FILE_BYTES = 30MB`; `MAX_TOTAL_BYTES = 60MB`
- If download fails → `FILE_NOT_FOUND`; if file > 30MB → `FILE_TOO_LARGE_FOR_INSTANT`; if total > 60MB → same
- Runs `stlToTriangles` + `analyzeTriangles` server-side and calls `evaluateV3(body, analyses)` which compares client price to server price
- `validateV3` body fields: `pieces[].{name, path, quantity, material, infill, wallLoops, quality, supports, orientation, color}`, `urgency`, `fulfillment`, `lang`, `returnPath`, `pricingVersion=3`
- No notes/metadata field in `validateV3` — only `color` and per-piece fields

**pages/InternationalServicePage.tsx** — EN model page with full layout (hero, steps, FAQ, calculator, SEO text)
**pages/IntlHubPage.tsx** — intl hub with different layout, does NOT share InternationalServicePage sections
**pages/IntlCityPage.tsx** — city-level pages
**data/intlContent_*.ts** — separate content files for DE, IT/PT, NL/FR
**config/intlMarkets.ts** — delivery days per market
**seo/entities.ts** — `ORGANIZATION_SCHEMA` (LocalBusiness), `WEBSITE_SCHEMA` — no country-specific `alternateName`

---

## STEP 1: Big files can be bought (P0)
- [x] 1.1 ASCII STL → binary STL conversion in browser before pricing/upload
- [x] 1.2 Build "checkout copy" for binary STL > 28 MB (meshoptimizer/simplifier, progress UI)
- [x] 1.3 Upload gzipped original next to checkout copy (CompressionStream, fire-and-forget)
- [x] 1.4 Files > 50 MB: run 1.1–1.2 before showing "file too large"
- [x] 1.5 Remove `file-too-large` as Buy-blocking reason (instantBuy.ts)
- [x] 1.6 Add `file_prepared` analytics event (analyticsEvents.ts)
- [x] 1.7 Unit tests (7 tests in stlPrepare.test.ts: isBinaryStl, round-trip, ASCII=binary analysis, no-op)

## STEP 2: Buy button layout (P0)
- [x] 2.1 Full-width Buy button size="xl" h-14 desktop / h-[60px] mobile, text-lg semibold, exact price
- [x] 2.2 Two small equal side-by-side buttons under Buy: "Revisión gratuita" (outline accent) + "WhatsApp" (outline)
- [x] 2.3 Trust line + payment badges between Buy and small row
- [x] 2.4 Quote-only: primary orange "Enviar para revisión" + small WhatsApp
- [x] 2.5 No page defines its own actions layout (grep confirmed); checkoutUx.ts emphasis disabled

## STEP 3: Exit popup on every page (P0)
- [x] 3.1 Trigger on every page/language when modal closes with ≥1 file loaded (fix quote-only + intl)
- [x] 3.2 Three variants: priced+buyable, quote-only, upload-failed — all localized
- [x] 3.3 Improve oversize card in modal
- [x] 3.4 Analytics events: `exit_popup_shown` + `exit_popup_action`

## STEP 4: 3D viewer overlays (P0)
- [x] 4.1 Camera orbit (OrbitControls) so part+overlays move together
- [x] 4.2 Dimension labels: "92 mm", axis-colored, edge midpoints, summary line + mass
- [x] 4.3 Ground grid in mm, fade edges, print bed outline > 120 mm
- [x] 4.4 Comparison object on grid next to part (coin/card/A4), solid material + outline, caption
- [x] 4.5 Labelled pill toggle buttons "Medidas" / "Comparar" + "Vista inicial" reset
- [x] 4.6 Scale control: % slider 25–400%, numeric field, unit-fix chips, live dims update + upload scaled STL
- [x] 4.7 Performance + unit tests (4 scaleStlBuffer tests)

## STEP 5: International landing pages (P0)
- [x] 5.1 Shared IntlLanding/* components driven by content object, all 6 pages
- [x] 5.2 Flags: hero pill, language selector, footer consistency
- [x] 5.3 Brand searches: hub titles, Organization alternateName, add JSON-LD to /
- [x] 5.4 Screenshot all hubs at 3 breakpoints, fix glitches (stats grid overflow fixed)
- [x] 5.5 Analytics: international_page_view + international_cta_click with section

## STEP 6: Configurator polish (P1)
- [x] 6.1 Default 3/4 view, part fills ~70% of frame after upload (dist * 1.4)
- [x] 6.2 Part list rows: dimensions + per-part price, click selects in viewer
- [x] 6.3 Shipping/pickup always pre-selected, compact segmented control above Buy on every page
- [x] 6.4 Mobile sticky footer: price + fulfillment + Buy visible without scroll (CheckoutDialog actionSlot)
- [x] 6.5 Advanced mode groups: Material & colour · Quality & strength · Orientation & supports with localized help text

## STEP 7: Checks (P1)
- [x] 7.1 Extend buy-matrix e2e: all hubs + / + one city, Simple/Advanced, small/35MB/45MB files
- [x] 7.2 Exit popup e2e: priced/quote-only/failed on / and /it/stampa-3d-online
- [x] 7.3 Viewer e2e: rotate, label DOM move, comparison/grid world-point consistency
- [x] 7.4 check-link-language + meta/JSON-LD checks pass, hub inbound ≥ conv-22

## STEP 8: Final verification
- [x] 8.1 typecheck clean · 716 unit tests pass · 153 pages, 0 SEO violations, 0 broken links
- [x] 8.2 git diff origin/main pricing/estimator/supabase prints nothing
- [x] 8.3 Playwright buy-matrix 26/26, exit-popup 6/8 (2 skipped expected), viewer 10/10 — total 42/44 pass
- [x] 8.4 Screenshots: docs/screenshots/conv23-desktop-home/it/de + conv23-mobile-home
- [x] 8.5 PROGRESS.md, OWNER.md (no LOVABLE.md needed — no server changes); git status clean; 12 commits ahead of origin/main
