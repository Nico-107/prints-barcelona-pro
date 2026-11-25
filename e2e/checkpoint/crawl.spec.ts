import { test, expect } from "@playwright/test";

// Q5 — Site crawl smoke. The full crawl (every sitemap URL, hreflang, title, canonical,
// internal links, no console errors, calculator present where expected) runs via the
// existing `npm run qa` script; this spec guards the baseline that the homepage, Sevilla
// and Madrid pages return 200 with a valid lang attribute.

const PAGES_TO_CRAWL = [
  { path: "/", expectedLang: "es" },
  { path: "/impresion-3d-sevilla", expectedLang: "es" },
  { path: "/madrid", expectedLang: "es" },
  { path: "/it/stampa-3d-online", expectedLang: "it" },
  { path: "/3d-printing-delivery-paris", expectedLang: "fr" },
];

for (const p of PAGES_TO_CRAWL) {
  test(`crawl: ${p.path} (lang ${p.expectedLang})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(p.path, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBe(p.expectedLang);
    expect(errors).toEqual([]);
  });
}
