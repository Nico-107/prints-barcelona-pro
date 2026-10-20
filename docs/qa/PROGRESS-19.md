# Prompt 19 — Progress

Branch: `mobile-orders-19` · Date: 2026-10-20  
Build: ✅ typecheck · ✅ 662 tests · ✅ build · ✅ estimator-sync · ✅ checkout-v3-sync · ✅ autumn-discount-sync · ✅ qa · ✅ qa:quote

## Item 1: Mobile popup layout
- [x] Single scroll container with 100dvh, no nested small scroll areas
- [x] 3D preview thumbnail (max 140 px) with "Ver en 3D" expand on mobile
- [x] touch-action: pan-y on viewer canvas when not expanded
- [x] Sticky footer with Total + fulfillment + Buy now always visible
- [x] Cookie banner hidden while popup open, re-shown on close
- [x] X always visible at top
- [x] Closing keeps uploaded files
- [x] ResizeObserver loop error fixed (debounce + same-size guard)
- [x] Secondary buttons ≥44 px tall with text-sm
- [x] buy_button_visible event (once per popup open, ≥50% on screen for 500 ms)
- [x] Playwright script scripts/qa/mobile-modal.mjs passes all devices/pages/file-counts

## Item 2: Accept OBJ, 3MF, GLB, images
- [x] .obj, .3mf, .glb accepted in uploader (accept= and not_stl check)
- [x] OBJ/3MF/GLB loaded with three.js loaders, merged, converted to binary STL
- [x] GLB unit conversion (×1000 metres→mm)
- [x] Image files (.jpg/.png/.heic/.webp/.pdf) show design-request card
- [x] Image design-request card submits via quote flow with "FOTO / DISEÑO" tag
- [x] Storage bucket MIME types checked — no OWNER ACTION needed (print-requests has no allowed_mime_types restriction)
- [x] image_design_request_submitted event
- [x] Upload box wording updated in all 8 languages
- [x] STL >50 MB: offer link field instead of only error

## Item 3: Free file check — ask for less
- [x] Accepts email OR phone (either one sufficient)
- [x] Optional name field
- [x] Server validation consistent with client (send-quote-request)

## Item 4: Autumn discount 10%
- [x] AUTUMN_DISCOUNT config in src/config/policies.ts
- [x] Edge function has its own copy + sync check (AUTUMN-DISCOUNT block 9 lines)
- [x] Server applies discount to print lines (not shipping), proportional distribution
- [x] Display: ≥20 € shows green line + strikethrough total + discount in Buy button
- [x] Display: 10–19.99 € shows nudge with computed amount needed
- [x] Hero mention on / while offer active
- [x] Tests: computeAutumnDiscount (below/at/above threshold, after end, stripe lines sum, label, rounding)

## Item 5: Experiments
- [x] modal_actions_r1 startedOn: '2026-10-20' (already set)
- [x] docs/experiments/README.md autumn discount confound note added

---

## AFTER MERGE

AFTER MERGE: REDEPLOY create-instant-checkout AND stripe-webhook IN LOVABLE
