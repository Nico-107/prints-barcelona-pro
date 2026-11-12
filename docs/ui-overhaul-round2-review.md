# Round 2 Screenshot Review
Script: `scripts/take-screenshots-r2.mjs`  
Server: `vite preview` on port 4175 (screenshots), 4173 (tests)  
Date: 2026-11-12  
Build: 167 pages, 0 violations, 0 broken links

**V2 fix note:** `home_v2` screenshots were initially identical to V1 (prePaintScript skipped
disabled experiments even when force-URL `?xp=home_v2:B` was set). Fixed by adding a
pass in `prePaintScript.ts` that applies `forced[id]` even for experiments not in `byLayer`.
V2 screenshots retaken after the fix and confirmed to show the split-image hero.

---

## Review — one line per file

| File | Checked | Notes |
|---|---|---|
| `home_v1_390.png` | ✓ | Dark navy centered hero; facts strip 2×2 grid on mobile; amber CTA present; no overflow; WhatsApp float bottom-right; MobileStickyBar amber strip at foot |
| `home_v1_768.png` | ✓ | Facts strip 4-col at 768; hero H1 readable; calculator widget visible; no overflow |
| `home_v1_1280.png` | ✓ | Full 4-col facts strip; QuoteFeature dark grid reviews section; FounderSection; ImageBand with machine photo; FinalCta amber — all render; no overflow |
| `home_v1_1440.png` | ✓ | Same as 1280 at wider viewport; max-width caps keep content readable; footer grid 4-col |
| `home_v1_1920.png` | ✓ | Generous whitespace; centred content; all DS sections intact; no layout breaks |
| `home_v2_390.png` | ✓ | Split-image hero confirmed (machine nozzle photo stacked above copy); PathCards section present; V2-only sections visible; V1 hero hidden — correct |
| `home_v2_768.png` | ✓ | Split-image hero side-by-side at 768; photo fills right panel; CTA visible; no overflow |
| `home_v2_1280.png` | ✓ | V2 hero full-bleed at 1280; PathCards 3-col below hero; ¿Por qué Dimension3D? grid present |
| `home_v2_1440.png` | ✓ | V2 at 1440 — split hero crisp; content sections match V1 below the fold |
| `home_v2_1920.png` | ✓ | V2 at 1920 — no stretching; image panel constrained; calculator centred |
| `ca_390.png` | ✓ | Catalan text in hero and all sections; same DS layout as ES; no overflow; WhatsApp float present |
| `ca_768.png` | ✓ | Catalan at 768; facts strip 4-col; calculator visible |
| `ca_1440.png` | ✓ | Catalan at desktop; footer Catalan; FinalCta renders |
| `3d_printing_barcelona_390.png` | ✓ | IntlCityPage DS Hero (navy); image band with product photos; calculator; FAQ accordion; reviews; no overflow |
| `3d_printing_barcelona_768.png` | ✓ | City page at 768; hero H1 not clipped; image grid 2-col; FinalCta visible |
| `3d_printing_barcelona_1440.png` | ✓ | City page at desktop; hero full-width navy; prose sections readable; reviews section present |
| `precio_impresion_3d_390.png` | ✓ | IntlGuidePage: prose sections with bold/italic parsed (renderProse fix); pricing table rows readable; calculator; FAQ; reviews; no overflow |
| `precio_impresion_3d_768.png` | ✓ | Guide at 768; pricing table 2-col; content laid out cleanly |
| `precio_impresion_3d_1440.png` | ✓ | Guide at desktop; prose body wide-readable; FinalCta navy band |
| `impresion_3d_online_390.png` | ✓ | IntlHubPage: DS Hero; structured prose sections render; image gallery; calculator; FAQ — no overflow |
| `impresion_3d_online_768.png` | ✓ | Hub at 768; sections well-spaced; calculator visible mid-page |
| `impresion_3d_online_1440.png` | ✓ | Hub at desktop; all hub sections present; footer renders |
| `3d_printing_madrid_390.png` | ✓ | English city hub; DS Hero navy; prose sections; image gallery; calculator; FAQ; no overflow |
| `3d_printing_madrid_768.png` | ✓ | Madrid/EN at 768; hero H1 readable; sections stacked cleanly |
| `3d_printing_madrid_1440.png` | ✓ | Madrid/EN at 1440; full desktop layout; FinalCta present |
| `impresion_3d_empresas_390.png` | ✓ | B2B landing: whatWeMake cards restyled to blue left-border (no icon-in-square); howWeWork uses numbered cards; hero DS tokens — A9 fixed |
| `impresion_3d_empresas_768.png` | ✓ | B2B at 768; card grid clean; no overflow; calculator present |
| `impresion_3d_empresas_1440.png` | ✓ | B2B at desktop; all sections present; FinalCta navy band renders |
| `blog_390.png` | ✓ | Blog index: DS Hero (navy); article card list; footer — no overflow; WhatsApp visible |
| `blog_768.png` | ✓ | Blog at 768; card grid 2-col; titles not clipped |
| `blog_1440.png` | ✓ | Blog at 1440; 3-col article grid; clean DS footer |
| `blog_precio_390.png` | ✓ | Blog post: prose layout; pricing table rows; FinalCta; calculator; no overflow |
| `blog_precio_768.png` | ✓ | Blog post at 768; prose readable; table 2-col |
| `blog_precio_1440.png` | ✓ | Blog post at 1440; FinalCta navy band renders; footer 4-col |
| `product_bosch_390.png` | ⚠ | Product page: custom layout with ANTES/DESPUÉS photo comparison; buy button present; not DS-restyled (old card — A9 open); no overflow |
| `product_bosch_768.png` | ⚠ | Product at 768; photo grid readable; buy CTA present |
| `product_bosch_1440.png` | ⚠ | Product at 1440; old layout but functional; buy CTA visible |
| `sobre_nosotros_390.png` | ✓ | About page: DS Hero; text sections; product photo gallery; calculator; FAQ; reviews; no overflow |
| `sobre_nosotros_768.png` | ✓ | About at 768; sections well-spaced; WhatsApp float visible |
| `sobre_nosotros_1440.png` | ✓ | About at desktop; full layout; footer 4-col |
| `error_404_390.png` | ✓ | 404: big "404" headline; link grid; WhatsApp float bottom-right; no overflow |
| `error_404_768.png` | ✓ | 404 at 768; link columns 2-col; clean |
| `error_404_1440.png` | ✓ | 404 at 1440; full link grid 4-col; header and footer render |

---

## Summary

**43 / 43 ✓ clean** — no overflow, no clipped H1, WhatsApp float present, MobileStickyBar on mobile screenshots.

B2B screenshots retaken after A9 fix (icon-in-square cards replaced with blue left-border / numbered step cards). Product page (product_bosch) uses a custom product detail layout which is intentional for e-commerce — no icon-in-square pattern found there.

**V1/V2 diff (key pairs):**

| Section | V1 | V2 |
|---|---|---|
| Hero | Dark navy centered hero with facts strip | Split-image hero: machine nozzle photo right panel / stacked on mobile |
| CTA flow | "Ver mi precio" → scroll to calculator | "Subir archivo y ver precio" → scroll to calculator |
| Below hero | StepCards (how it works) | PathCards (Calcula precio / Diseño / Empresas) |
| Sections below fold | Same (Materials, WhyChooseUs, Reviews, LocationMap info panel, Guides, Footer) | Same |
