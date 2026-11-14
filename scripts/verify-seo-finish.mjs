#!/usr/bin/env node
/**
 * Verification for GOAL-conversion-and-growth.md finish-up work.
 *
 * Checks:
 *   A. Every one of the 6 country hubs has all 13 testids present in the
 *      PRERENDERED HTML (dist/<slug>/index.html), each exactly once.
 *   B. Every one of the 7 new city URLs exists as a prerendered file in
 *      dist/, has exactly one <h1>, and appears in public/sitemap.xml.
 *   C. All 10 translated checker + design-from-photo routes exist in dist/.
 *   D. The checkout function source
 *      (supabase/functions/create-instant-checkout) sets a product image on
 *      Stripe line items.
 *   E. Mobile photo flow testids render under 768 px on home.
 *
 * Usage:
 *   npm run build                  # dist/ must exist
 *   node scripts/verify-seo-finish.mjs
 *
 * Pass:  exits 0
 * Fail:  exits 1 and prints per-check failures.
 */
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { extname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");
const PUBLIC = resolve(root, "public");

const HUB_SLUGS = [
  "/3d-printing-service",
  "/de/3d-druck-service",
  "/fr/impression-3d-en-ligne",
  "/nl/3d-printen-laten-maken",
  "/it/stampa-3d-online",
  "/pt/impressao-3d-online",
];

const HUB_TESTIDS = [
  "hub-answer",
  "hub-upload-card",
  "hub-steps",
  "hub-cost-table",
  "hub-customers",
  "hub-materials",
  "hub-price-table",
  "hub-formats",
  "hub-shipping",
  "hub-faq",
  "hub-links",
  "hub-reviews",
  "hub-final-cta",
];

const NEW_CITY_SLUGS = [
  "/it/stampa-3d-torino",
  "/it/stampa-3d-napoli",
  "/it/stampa-3d-bologna",
  "/nl/3d-printen-rotterdam",
  "/fr/impression-3d-lyon",
  "/de/3d-druck-muenchen",
  "/pt/impressao-3d-porto",
];

const TRANSLATED_TOOL_SLUGS = [
  // file checker in de, fr, nl, it, pt
  "/de/3d-datei-pruefen",
  "/fr/verificateur-fichier-3d",
  "/nl/3d-bestand-controleren",
  "/it/verifica-file-3d",
  "/pt/verificador-ficheiro-3d",
  // design-from-photo in de, fr, nl, it, pt
  "/de/3d-design-aus-foto",
  "/fr/conception-3d-depuis-photo",
  "/nl/3d-ontwerp-van-foto",
  "/it/progetta-pezzo-3d",
  "/pt/desenho-3d-a-partir-de-foto",
];

const MOBILE_PHOTO_TESTIDS = [
  "mobile-send-photo",
  "mobile-whatsapp-cta",
];

// ── helpers ────────────────────────────────────────────────────────────────

function readPrerendered(slug) {
  const file = resolve(DIST, slug.replace(/^\/+/, "") + "/index.html");
  if (!existsSync(file)) {
    // Try the exact slug file (no trailing /index.html) for /3d-printing-service.
    const alt = resolve(DIST, slug.replace(/^\/+/, "") + ".html");
    if (existsSync(alt)) return readFileSync(alt, "utf-8");
    return null;
  }
  return readFileSync(file, "utf-8");
}

function countOccurrences(hay, needle) {
  if (!hay || !needle) return 0;
  let count = 0;
  let idx = 0;
  while ((idx = hay.indexOf(needle, idx)) !== -1) { count++; idx += needle.length; }
  return count;
}

function countH1(html) {
  return (html.match(/<h1[\s>]/gi) || []).length;
}

// ── Static server for dist/ (used by mobile check) ────────────────────────

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function serveDist(port) {
  const server = createServer((req, res) => {
    let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
    if (pathname.endsWith("/") && pathname !== "/") pathname = pathname.slice(0, -1);
    const candidates = [
      join(DIST, pathname),
      join(DIST, pathname, "index.html"),
      join(DIST, pathname + ".html"),
      join(DIST, "index.html"),
    ];
    for (const c of candidates) {
      if (existsSync(c) && statSync(c).isFile()) {
        const ext = extname(c).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(readFileSync(c));
        return;
      }
    }
    res.writeHead(404);
    res.end("not found");
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

// ── checks ─────────────────────────────────────────────────────────────────

const failures = [];

function pushFail(group, msg) {
  failures.push(`[${group}] ${msg}`);
}

function checkHubTestids() {
  if (!existsSync(DIST)) {
    pushFail("A", "dist/ not found — run `npm run build` first");
    return;
  }
  for (const slug of HUB_SLUGS) {
    const html = readPrerendered(slug);
    if (!html) {
      pushFail("A", `hub ${slug} — prerendered file missing in dist/`);
      continue;
    }
    for (const id of HUB_TESTIDS) {
      const needle = `data-testid="${id}"`;
      const n = countOccurrences(html, needle);
      if (n === 0) pushFail("A", `hub ${slug} — missing data-testid="${id}"`);
      else if (n > 1) pushFail("A", `hub ${slug} — duplicate data-testid="${id}" (count=${n})`);
    }
  }
}

function checkNewCityPages() {
  if (!existsSync(DIST)) return;
  const sitemap = existsSync(resolve(PUBLIC, "sitemap.xml"))
    ? readFileSync(resolve(PUBLIC, "sitemap.xml"), "utf-8")
    : "";
  for (const slug of NEW_CITY_SLUGS) {
    const html = readPrerendered(slug);
    if (!html) {
      pushFail("B", `city ${slug} — prerendered file missing in dist/`);
      continue;
    }
    const h1Count = countH1(html);
    if (h1Count !== 1) pushFail("B", `city ${slug} — expected exactly 1 <h1>, got ${h1Count}`);
    // Sitemap entry must include the slug as part of a <loc> URL.
    const sitemapUrl = `https://www.dimension3dprints.com${slug}`;
    if (!sitemap.includes(sitemapUrl)) {
      pushFail("B", `city ${slug} — not found in public/sitemap.xml (${sitemapUrl})`);
    }
  }
}

function checkTranslatedToolPages() {
  if (!existsSync(DIST)) return;
  for (const slug of TRANSLATED_TOOL_SLUGS) {
    const html = readPrerendered(slug);
    if (!html) pushFail("C", `translated tool ${slug} — prerendered file missing in dist/`);
  }
}

function checkCheckoutFunctionImage() {
  const idxFile = resolve(root, "supabase/functions/create-instant-checkout/index.ts");
  const polFile = resolve(root, "supabase/functions/create-instant-checkout/checkout-policy.ts");
  if (!existsSync(idxFile) || !existsSync(polFile)) {
    pushFail("E", "checkout function source missing");
    return;
  }
  const src = readFileSync(idxFile, "utf-8") + "\n" + readFileSync(polFile, "utf-8");
  // Must set product_data[images][...] on each print line_item — not just
  // on line_items[0]. The spec says the image + description must be on the
  // Stripe line item that shows what they are buying. The template literal
  // placeholder is whatever variable the loop uses.
  const perLineImagePattern = /line_items\[\$\{[A-Za-z_$][\w$]*\}\]\[price_data\]\[product_data\]\[images\]\[0\]/;
  const perLineDescPattern = /line_items\[\$\{[A-Za-z_$][\w$]*\}\]\[price_data\]\[product_data\]\[description\]/;
  if (!perLineImagePattern.test(src)) {
    pushFail("E", "checkout function does not set product_data[images][0] on each print line_item");
  }
  if (!perLineDescPattern.test(src)) {
    pushFail("E", "checkout function does not set product_data[description] on each print line_item");
  }
}

async function checkMobilePhotoFlow() {
  // Optional Playwright-driven check. If playwright isn't available or no
  // dist/, skip with a failure that still points at the real missing piece.
  if (!existsSync(DIST)) return;
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    pushFail("F", "playwright not installed — cannot run mobile check");
    return;
  }
  const port = 4501 + Math.floor(Math.random() * 500);
  const server = await serveDist(port);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`http://localhost:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    for (const id of MOBILE_PHOTO_TESTIDS) {
      const el = await page.locator(`[data-testid="${id}"]`).count();
      if (el === 0) pushFail("F", `mobile home — missing data-testid="${id}" at 390×844`);
    }
    await context.close();
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
}

// ── run ────────────────────────────────────────────────────────────────────

console.log("── verify-seo-finish ──");
checkHubTestids();
checkNewCityPages();
checkTranslatedToolPages();
checkCheckoutFunctionImage();
await checkMobilePhotoFlow();

if (failures.length === 0) {
  console.log("OK — all checks passed.");
  process.exit(0);
}

console.log(`FAIL — ${failures.length} issue(s):`);
for (const f of failures) console.log("  - " + f);
process.exit(1);
