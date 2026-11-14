#!/usr/bin/env node
/**
 * fix-polish §1.5 + §1.8 — walk the price window at 390×844 (phone) and
 * 1440×800 (desktop) in both variants and screenshot each step.
 *
 * Usage: npm run build && node scripts/screenshot-price-window.mjs
 *
 * Outputs to docs/fix-polish-screens/<variant>-<viewport>-<step>.png
 */
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync, mkdirSync } from "fs";
import { resolve, dirname, extname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");
const OUT = resolve(root, "docs/fix-polish-screens");
mkdirSync(OUT, { recursive: true });

if (!existsSync(DIST)) { console.error("Missing dist/ — run `npm run build` first."); process.exit(2); }

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };
function serveDist(port) {
  const server = createServer((req, res) => {
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    if (p.endsWith("/") && p !== "/") p = p.slice(0, -1);
    for (const f of [join(DIST, p), join(DIST, p + ".html"), join(DIST, p, "index.html")]) {
      if (existsSync(f) && statSync(f).isFile()) {
        res.writeHead(200, { "Content-Type": MIME[extname(f)] ?? "application/octet-stream" });
        res.end(readFileSync(f));
        return;
      }
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(readFileSync(join(DIST, "index.html")));
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

const CUBE_STL = resolve(root, "tests/fixtures/cube-20mm.stl");

async function shot(page, name) {
  const path = resolve(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log(`  → ${name}`);
}

async function runFlow(page, variantTag, label) {
  const url = `http://localhost:4173/?xp=site_variant:${variantTag}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(500);
  await shot(page, `${label}-01-hero.png`);

  // Scroll to the calculator.
  await page.evaluate(() => document.getElementById("calculator")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(300);
  await shot(page, `${label}-02-calculator.png`);

  // Upload cube
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);
  const breakdown = page.locator("[data-price-breakdown]").first();
  // Mobile hides the breakdown behind the sticky bar; attached is enough.
  await breakdown.waitFor({ state: "attached", timeout: 30000 });
  await page.waitForTimeout(600);
  await shot(page, `${label}-03-uploaded.png`);

  // Open the checkout dialog (mobile uses sticky modal; desktop uses panel)
  const buy = page.locator('[data-testid="buy-now-btn"]').first();
  if (await buy.count()) {
    await buy.click({ trial: false, timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, `${label}-04-options-visible.png`);

    // Measure the options column vs the pinned actions bar (§1.5).
    const metrics = await page.evaluate(() => {
      const panel = document.querySelector('[data-testid="checkout-configurator"]');
      const panelRoot = panel?.closest('[data-order-panel], .ds-grid-bg, main, body') ?? panel?.parentElement;
      if (!panel || !panelRoot) return null;
      const pRect = panelRoot.getBoundingClientRect();
      const cRect = panel.getBoundingClientRect();
      return { panelH: Math.round(pRect.height), optionsH: Math.round(cRect.height), ratio: +(cRect.height / Math.max(pRect.height, 1)).toFixed(3) };
    });
    if (metrics) console.log(`    options/panel height ratio: ${metrics.ratio} (options ${metrics.optionsH}px of ${metrics.panelH}px)`);
  }
}

const PORT = 4173;
const server = await serveDist(PORT);
console.log(`Serving dist/ at http://localhost:${PORT}`);

const browser = await chromium.launch();
try {
  for (const vp of [{ w: 1440, h: 800, tag: "desktop" }, { w: 390, h: 844, tag: "mobile" }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const variant of ["A", "B"]) {
      const label = `${variant}-${vp.tag}-${vp.w}`;
      console.log(`\n=== ${label} ===`);
      await runFlow(page, variant, label);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(`\nDone. Screenshots in ${OUT}`);
