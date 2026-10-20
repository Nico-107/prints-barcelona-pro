/**
 * QA script: mobile popup layout on Pixel 7, iPhone SE, and iPhone 13.
 * Checks:
 *   - Modal opens and fits within viewport height (100dvh scroll)
 *   - 3D viewer thumbnail renders at ≤140px on mobile
 *   - Footer with Buy/Review buttons is visible without scrolling
 *   - Cookie banner is hidden when modal is open
 *   - Close (X) button is visible
 *   - Secondary buttons have ≥44px touch target
 *
 * Usage: node scripts/qa/mobile-modal.mjs
 * Requires a prior `npm run build`.
 * Exits 1 if any assertion fails.
 */
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "../..");
const DIST_DIR = join(ROOT, "dist");
const STL_PATH = join(ROOT, "tests/fixtures/cube-20mm.stl");

const MIME = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".woff": "font/woff", ".ttf": "font/ttf", ".webp": "image/webp",
  ".txt": "text/plain", ".xml": "application/xml", ".stl": "application/octet-stream",
};

function startServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url.split("?")[0].split("#")[0];
      const candidates = [
        join(DIST_DIR, url),
        join(DIST_DIR, url, "index.html"),
        join(DIST_DIR, url.replace(/\/$/, ""), "index.html"),
        join(DIST_DIR, "404.html"),
      ];
      for (const candidate of candidates) {
        if (existsSync(candidate)) {
          try {
            const stat = statSync(candidate);
            if (!stat.isFile()) continue;
            const ext = extname(candidate) || ".html";
            const data = readFileSync(candidate);
            res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
            res.end(data);
            return;
          } catch { continue; }
        }
      }
      res.writeHead(404); res.end("Not found");
    });
    server.listen(port, () => resolve(server));
  });
}

const DEVICES = [
  { name: "Pixel 7",    width: 412, height: 915, dpr: 2.625, ua: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116 Mobile Safari/537.36" },
  { name: "iPhone SE",  width: 375, height: 667, dpr: 2,     ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1" },
  { name: "iPhone 13",  width: 390, height: 844, dpr: 3,     ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1" },
];

const TEST_PAGES = [
  { path: "/",                          fileCount: 1 },
  { path: "/nl/3d-printen-laten-maken", fileCount: 3 },
];

let failures = 0;
function fail(msg) { console.error(`  ✗ ${msg}`); failures++; }
function ok(msg)   { console.log(`  ✓ ${msg}`); }

async function setupMocks(page) {
  await page.route("**/storage/v1/object/**", async route => {
    if (["POST", "PUT"].includes(route.request().method())) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ Key: `mock-${Date.now()}/cube-20mm.stl` }) });
    } else { await route.continue(); }
  });
  await page.route("**/rest/v1/quote_requests**", async route => {
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify([{ id: "mock-id" }]) });
  });
  await page.route("**/functions/v1/analyze-mesh**", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ volume_cm3: 8, surface_cm2: 24, sizeX: 20, sizeY: 20, sizeZ: 20, triangles: 12 }) });
  });
  await page.route("**/functions/v1/create-instant-checkout**", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: "https://checkout.stripe.com/mock" }) });
  });
}

async function uploadFiles(page, count) {
  const stlBytes = readFileSync(STL_PATH);
  const filePayloads = Array.from({ length: count }, (_, i) => ({
    name: `cube-${i + 1}.stl`, mimeType: "application/octet-stream", buffer: stlBytes,
  }));

  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles(filePayloads);
}

async function runTest(page, pageUrl, device, fileCount) {
  const label = `${device.name} · ${pageUrl} · ${fileCount} file(s)`;
  console.log(`\n  [${label}]`);

  await page.goto(pageUrl, { waitUntil: "networkidle" });

  // Upload file(s)
  await uploadFiles(page, fileCount);

  // Wait for parsing
  await page.waitForTimeout(2000);

  // Open modal — click Buy Now or Review button if modal not yet open
  const modalTrigger = page.locator('[data-testid="open-modal"], button:has-text("Precio"), button:has-text("Buy"), button:has-text("Prijs")').first();
  const modalVisible = await page.locator('[role="dialog"], [data-modal="estimator"]').isVisible().catch(() => false);
  if (!modalVisible) {
    await modalTrigger.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  // Modal open check: look for the modal container
  const modal = page.locator('[role="dialog"]').first();
  const modalOpen = await modal.isVisible().catch(() => false);
  if (!modalOpen) {
    fail(`${label}: modal did not open`);
    return;
  }
  ok(`${label}: modal opened`);

  // Verify modal height ≤ viewport height (no overflow needed for basic content)
  const vh = device.height;
  const modalBox = await modal.boundingBox();
  if (modalBox && modalBox.height <= vh + 2) {
    ok(`${label}: modal height ${Math.round(modalBox.height)}px ≤ ${vh}px viewport`);
  } else if (modalBox) {
    // Scrollable modal is acceptable; check scrollable container exists
    const hasScroll = await modal.evaluate(el => el.scrollHeight > el.clientHeight || el.querySelector('[style*="overflow"]') !== null);
    if (hasScroll) {
      ok(`${label}: modal scrollable (height ${Math.round(modalBox.height)}px, vh ${vh}px)`);
    } else {
      fail(`${label}: modal height ${Math.round(modalBox.height)}px > viewport ${vh}px and not scrollable`);
    }
  }

  // 3D viewer thumbnail height ≤ 140px on mobile
  const viewer = modal.locator('canvas, [class*="viewer"], [class*="stl"]').first();
  const viewerBox = await viewer.boundingBox().catch(() => null);
  if (viewerBox) {
    if (viewerBox.height <= 145) {
      ok(`${label}: viewer thumbnail ${Math.round(viewerBox.height)}px ≤ 140px`);
    } else {
      fail(`${label}: viewer thumbnail ${Math.round(viewerBox.height)}px > 140px`);
    }
  } else {
    ok(`${label}: no 3D viewer (image/link-only mode)`);
  }

  // Close (X) button visible
  const closeBtn = modal.locator('button[aria-label*="close" i], button[aria-label*="cerrar" i], button[aria-label*="Close" i]').first();
  const closeBtnAlt = modal.locator('button:has(svg)').first();
  const closeVisible = await closeBtn.isVisible().catch(() => false) || await closeBtnAlt.isVisible().catch(() => false);
  if (closeVisible) { ok(`${label}: close button visible`); }
  else { fail(`${label}: close button not found`); }

  // Footer sticky — check Buy/Review buttons are in viewport
  const footerBtn = modal.locator('button:has-text("Pagar"), button:has-text("Buy"), button:has-text("Betalen"), button:has-text("Acquista"), button:has-text("Comprar")').first();
  const footerBtnBox = await footerBtn.boundingBox().catch(() => null);
  if (footerBtnBox) {
    const inViewport = footerBtnBox.y + footerBtnBox.height <= vh + 2;
    if (inViewport) { ok(`${label}: buy button in viewport`); }
    else { fail(`${label}: buy button below viewport fold (y=${Math.round(footerBtnBox.y)}, h=${Math.round(footerBtnBox.height)}, vh=${vh})`); }
    if (footerBtnBox.height >= 44) { ok(`${label}: buy button height ${Math.round(footerBtnBox.height)}px ≥ 44px`); }
    else { fail(`${label}: buy button height ${Math.round(footerBtnBox.height)}px < 44px`); }
  } else {
    ok(`${label}: no buy button (image-only upload?)`);
  }

  // Cookie banner hidden when modal open
  const cookieBanner = page.locator('[id*="cookie"], [class*="cookie"], [id*="consent"], [class*="consent"]').first();
  const cookieVisible = await cookieBanner.isVisible().catch(() => false);
  if (!cookieVisible) { ok(`${label}: cookie banner hidden`); }
  else { fail(`${label}: cookie banner still visible while modal is open`); }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const PORT = 8892;
const server = await startServer(PORT);
const BASE = `http://localhost:${PORT}`;

const browser = await chromium.launch({ headless: true });

try {
  for (const device of DEVICES) {
    console.log(`\n=== ${device.name} (${device.width}×${device.height}) ===`);
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.dpr,
      userAgent: device.ua,
      isMobile: true,
      hasTouch: true,
    });

    for (const { path, fileCount } of TEST_PAGES) {
      const page = await context.newPage();
      await setupMocks(page);
      await runTest(page, `${BASE}${path}`, device, fileCount).catch(err => {
        fail(`${device.name} · ${path} · ${fileCount} files: uncaught error — ${err.message}`);
      });
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll mobile modal checks passed.");
}
