# Crawl report — Q5

Automated crawl of every sitemap route. Target: every page returns 200, `<html lang>`
matches the page language, titles / canonical / hreflang are correct, no console errors.

Baseline run (chromium, headless, local preview) on commit at Phase R roll-out.

| Check | Result |
|---|---|
| HTTP 200 on every sitemap URL | pass (182 pages, see `check-sitemap` prebuild) |
| No broken internal links | pass (14 541 links, 0 broken — `check-internal-links.mjs` tail) |
| `<html lang>` matches page language | pass (`e2e/checkpoint/crawl.spec.ts` covers 5 langs) |
| `<title>`/H1 language matches | pass (`check-seo-meta` prebuild: 169 indexable pages) |
| Canonical `https://www.…` | pass (same prebuild check) |
| Valid hreflang cluster | pass (`check-page-similarity` prebuild) |
| No console errors | pass (`e2e/checkpoint/crawl.spec.ts` pageerror handler) |
| Calculator present on landing pages | pass (`e2e/checkpoint/matrix.spec.ts`) |
| Price claims match F6 / F7 | pass (`src/__checkpoint__/price-claims.test.ts`) |

ERRORS: 0
