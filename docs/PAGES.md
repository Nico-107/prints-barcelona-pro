# Page Map — Dimension3D

This document lists every page family, its purpose, URL pattern, language, how it is linked, and its count.

---

## 1. Homepage

| Field | Value |
|-------|-------|
| Purpose | Primary ES landing page with estimator |
| URL | `/` (ES), `/ca` (CA) |
| Language | ES, CA |
| Links | Header logo, footer Home |
| Count | 2 |

---

## 2. International Service Page

| Field | Value |
|-------|-------|
| Purpose | EN-language hub for international visitors |
| URL | `/3d-printing-service` |
| Language | EN |
| Links | Header nav, footer International service, hreflang from intl hubs |
| Count | 1 |

---

## 3. Landing Pages (ES / EN / CA / DE)

Topical SEO pages about specific services, materials, or use cases. Each topic may exist in 1–4 languages.

| Field | Value |
|-------|-------|
| Purpose | SEO landing for specific query (e.g. PLA printing, urgent, B2B) |
| URL | `/impresion-3d-urgente-barcelona` (ES), `/urgent-3d-printing-barcelona` (EN), etc. |
| Language | ES, EN, CA, DE (varies by topic) |
| Links | Services menu (header), footer Services/Materials/Guides sections, hreflang alternates |
| Count | ~80 pages (see src/seo/) |

Data: `src/seo/landingPages*.ts`

---

## 4. English City Delivery Pages

Pages targeting international cities for English-speaking visitors. EU cities have instant checkout; London and New York are quote-only (outside SHIP_COUNTRIES).

| Field | Value |
|-------|-------|
| Purpose | Rank for "[city] 3D printing delivery" in EN |
| URL | `/3d-printing-delivery-{city}` |
| Language | EN (FR for Paris page) |
| Links | Footer "Delivery cities" section, hreflang with native-language counterpart where available |
| Count | 8 (Paris, London, Amsterdam, Berlin, Milan, Rome, Lisbon, New York) |

Data: `src/data/cityDeliveryPages.ts`

Native language pairs (hreflang):
- Berlin ↔ `/de/3d-druck-berlin`
- Amsterdam ↔ `/nl/3d-printen-amsterdam`
- Milan ↔ `/it/stampa-3d-milano`
- Rome ↔ `/it/stampa-3d-roma`
- Lisbon ↔ `/pt/impressao-3d-lisboa`

Outside SHIP_COUNTRIES (quote only, no Buy Now):
- London (`/3d-printing-delivery-london`)
- New York (`/3d-printing-delivery-new-york`)

---

## 5. Spanish City Pages

| Field | Value |
|-------|-------|
| Purpose | Rank for "impresión 3D en [ciudad]" |
| URL | `/madrid`, `/3d-printing-madrid`, `/impresion-3d-con-entrega-a-valencia`, `/impresion-3d-sevilla`, `/3d-printing-sevilla` |
| Language | ES |
| Links | Footer "Ciudades y Envíos", hreflang with EN counterpart where available |
| Count | ~5 |

---

## 6. International Hub Pages (DE / NL / FR / IT / PT)

One hub per country, in the country's native language. Each links to city pages, guide pages, and the EN service page via hreflang.

| Field | Value |
|-------|-------|
| Purpose | Primary native-language landing for each EU country |
| URL | `/{lang}/{slug}` e.g. `/de/3d-druck-service` |
| Language | DE, NL, FR, IT, PT |
| Links | Footer International section, hreflang cluster (all 5 hubs + EN hub + x-default=EN) |
| Count | 5 (one per language) |

Data: `src/data/intlContent_*.ts`, `src/data/intlRegistry.ts`

---

## 7. International City Pages (DE / NL / FR / IT / PT)

City pages in native language for major cities in each country. Paired with English delivery page via hreflang where applicable.

| Field | Value |
|-------|-------|
| Purpose | Rank for "[city] 3D druck/printen/impression" in native language |
| URL | `/{lang}/{city-slug}` e.g. `/de/3d-druck-berlin` |
| Language | DE (Berlin, Munich, Hamburg), NL (Amsterdam, Rotterdam, Eindhoven), FR (Toulouse, Montpellier), IT (Milan, Turin, Rome), PT (Lisbon, Porto) |
| Links | Hub page city links, footer city links, hreflang with EN delivery page counterpart |
| Count | ~13 |

---

## 8. International Guide Pages

Long-form guides in native language (pricing, file prep, materials).

| Field | Value |
|-------|-------|
| Purpose | Rank for informational queries in native language |
| URL | `/{lang}/{guide-slug}` e.g. `/de/3d-druck-kosten` |
| Language | DE, NL, FR, IT, PT |
| Links | Hub page guide links |
| Count | ~15 (3 per language) |

---

## 9. International Part Pages

Native-language versions of part pages (e.g. VESA adapter, dishwasher wheel).

| Field | Value |
|-------|-------|
| Purpose | Rank for part-specific queries in native language |
| URL | `/{lang}/{part-slug}` |
| Language | DE, NL, FR, IT, PT |
| Links | Hub pages |
| Count | ~15 |

---

## 10. Business Pages (B2B)

| Field | Value |
|-------|-------|
| Purpose | Serve B2B clients (recurring orders, companies) |
| URL | `/impresion-3d-empresas-barcelona` (ES), `/3d-printing-for-business-barcelona` (EN), `/ca/impressio-3d-empreses-barcelona` (CA) |
| Language | ES, EN, CA |
| Links | Header "Para empresas", footer For Business |
| Count | 3 |

---

## 11. Part Pages

Individual product pages for specific purchasable parts (e.g. VESA adapter, coffee funnel).

| Field | Value |
|-------|-------|
| Purpose | Rank for specific product searches |
| URL | `/{part-slug}` (ES), with native-language counterparts |
| Language | ES primarily, with intl versions |
| Links | Footer Popular Products, catalogue pages |
| Count | ~10 ES + intl variants |

---

## 12. Catalogue

Product catalogue listing and individual product pages.

| Field | Value |
|-------|-------|
| Purpose | Browseable product catalogue |
| URL | `/catalogo`, `/catalogo/{slug}` |
| Language | ES |
| Links | Header nav, footer Catalogue |
| Count | ~10 product pages + 1 index |

---

## 13. Blog

Blog posts in Spanish about 3D printing topics.

| Field | Value |
|-------|-------|
| Purpose | SEO content for informational queries |
| URL | `/blog`, `/blog/{slug}` |
| Language | ES |
| Links | Footer, internal content |
| Count | 5 posts + 1 index |

---

## 14. Static / Utility Pages

| Page | URL | Language |
|------|-----|----------|
| Track Order | `/track` | All (i18n) |
| Privacy | `/privacy` | EN |
| Return Policy | `/politica-devoluciones` | ES |
| Design Request | `/disena-tu-pieza-3d` (ES), `/design-your-3d-part` (EN), `/dissenya-la-teva-peca-3d` (CA) | ES/EN/CA |
| File Checker | `/verificador-archivo-3d` (ES), `/3d-file-checker` (EN), `/comprovador-arxiu-3d` (CA) | ES/EN/CA |
| Makers | `/makers` | ES |
| Maker Guide | `/maker-guide` | EN |
| Students | `/impresion-3d-estudiantes-barcelona` | ES |
| No Minimum | `/impresion-3d-sin-pedido-minimo` | ES |
| Creator | `/creator` | ES |
| Admin | `/admin`, `/admin-orders`, `/admin-makers` | — |

---

## Summary counts

| Family | Count |
|--------|-------|
| Homepages | 2 |
| International Service | 1 |
| Landing Pages | ~80 |
| EN City Delivery | 8 |
| ES City Pages | ~5 |
| Intl Hub Pages | 5 |
| Intl City Pages | ~13 |
| Intl Guide Pages | ~15 |
| Intl Part Pages | ~15 |
| B2B Pages | 3 |
| Part Pages (ES) | ~10 |
| Catalogue | ~11 |
| Blog | 6 |
| Utility/Static | ~12 |
| **Total** | **~186** |
