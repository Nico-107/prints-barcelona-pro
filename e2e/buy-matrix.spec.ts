/**
 * conv-23: Buy-button matrix test
 * Uploads files across pages/modes and asserts the Buy button is visible and enabled.
 * Run with: npx playwright test e2e/buy-matrix.spec.ts
 */
import { test, expect, Page } from "@playwright/test";
import path from "path";
import os from "os";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

// ── Large-file fixture generators ────────────────────────────────────────────

/** Generate a binary STL of approximately targetMb megabytes. */
function makeLargeBinaryStl(targetMb: number): string {
  const targetBytes = targetMb * 1024 * 1024;
  const headerBytes = 84;
  const triBytes = 50;
  const triCount = Math.floor((targetBytes - headerBytes) / triBytes);

  const buf = Buffer.alloc(headerBytes + triCount * triBytes, 0);
  buf.writeUInt32LE(triCount, 80);
  // Write a plausible 10mm cube triangle (first 50 bytes so parser is happy)
  const triStart = 84;
  buf.writeFloatLE(0,  triStart);    // normal x
  buf.writeFloatLE(0,  triStart+4);  // normal y
  buf.writeFloatLE(1,  triStart+8);  // normal z
  buf.writeFloatLE(0,  triStart+12); // v0 x
  buf.writeFloatLE(0,  triStart+16); // v0 y
  buf.writeFloatLE(0,  triStart+20); // v0 z
  buf.writeFloatLE(10, triStart+24); // v1 x
  buf.writeFloatLE(0,  triStart+28); // v1 y
  buf.writeFloatLE(0,  triStart+32); // v1 z
  buf.writeFloatLE(5,  triStart+36); // v2 x
  buf.writeFloatLE(10, triStart+40); // v2 y
  buf.writeFloatLE(0,  triStart+44); // v2 z
  // Copy that template triangle into all subsequent triangles
  for (let i = 1; i < triCount; i++) {
    buf.copyWithin(84 + i * 50, 84, 84 + 50);
  }

  const outPath = path.join(os.tmpdir(), `buy-matrix-${targetMb}mb.stl`);
  fs.writeFileSync(outPath, buf);
  return outPath;
}

/** Generate an ASCII STL of approximately targetMb megabytes. */
function makeLargeAsciiStl(targetMb: number): string {
  // One triangle: ~130 bytes in ASCII
  const bytesPerTri = 130;
  const triCount = Math.floor((targetMb * 1024 * 1024) / bytesPerTri);

  const outPath = path.join(os.tmpdir(), `buy-matrix-ascii-${targetMb}mb.stl`);
  const ws = fs.createWriteStream(outPath);
  ws.write("solid generated\n");
  for (let i = 0; i < triCount; i++) {
    const x = (i % 100) * 0.1;
    const y = Math.floor(i / 100) * 0.1;
    ws.write(`  facet normal 0 0 1\n    outer loop\n`);
    ws.write(`      vertex ${x} ${y} 0\n`);
    ws.write(`      vertex ${x+0.1} ${y} 0\n`);
    ws.write(`      vertex ${x} ${y+0.1} 0\n`);
    ws.write(`    endloop\n  endfacet\n`);
  }
  ws.write("endsolid generated\n");
  ws.end();
  return outPath;
}

// Pre-generate large fixtures once per run
let BINARY_35MB: string;
let ASCII_45MB: string;

test.beforeAll(() => {
  BINARY_35MB = makeLargeBinaryStl(35);
  ASCII_45MB  = makeLargeAsciiStl(45);
});

test.afterAll(() => {
  try { fs.unlinkSync(BINARY_35MB); } catch { /* ok */ }
  try { fs.unlinkSync(ASCII_45MB); } catch { /* ok */ }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function pickBuyBtn(page: Page) {
  const vw = page.viewportSize()?.width ?? 1280;
  return vw < 1024
    ? page.locator('[data-testid="buy-now-btn"]').last()
    : page.locator('[data-testid="buy-now-btn"]').first();
}

async function uploadAndAwaitBuy(page: Page, filePath: string, timeoutMs = 30000) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePath);
  const buyBtn = await pickBuyBtn(page);
  await expect(buyBtn).toBeVisible({ timeout: timeoutMs });
  await expect(buyBtn).toBeEnabled({ timeout: timeoutMs });
  return buyBtn;
}

// ── All hubs + / + one city page, Simple mode ─────────────────────────────────

const ALL_PAGES = [
  { path: "/", lang: "es" },
  { path: "/3d-printing-service", lang: "en" },
  { path: "/it/stampa-3d-online", lang: "it" },
  { path: "/pt/impressao-3d-online", lang: "pt" },
  { path: "/nl/3d-printen-laten-maken", lang: "nl" },
  { path: "/fr/impression-3d-en-ligne", lang: "fr" },
  { path: "/de/3d-druck-service", lang: "de" },
  { path: "/it/stampa-3d-milano", lang: "it", city: true },
];

for (const { path: pagePath, lang } of ALL_PAGES) {
  test(`Buy visible — ${pagePath} (${lang}) · Simple · small`, async ({ page }) => {
    await page.goto(pagePath);
    await uploadAndAwaitBuy(page, CUBE_STL);
  });
}

// ── Advanced mode ─────────────────────────────────────────────────────────────

test("Buy visible — / (es) · Advanced · small", async ({ page }) => {
  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  const toggle = page.locator('[data-testid="advanced-mode-toggle"]').first();
  if (await toggle.isVisible()) await toggle.click();

  const buyBtn = await pickBuyBtn(page);
  await expect(buyBtn).toBeVisible({ timeout: 10000 });
  await expect(buyBtn).toBeEnabled();
});

test("Buy visible — /it/stampa-3d-online · Advanced · small", async ({ page }) => {
  await page.goto("/it/stampa-3d-online");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  const toggle = page.locator('[data-testid="advanced-mode-toggle"]').first();
  if (await toggle.isVisible()) await toggle.click();

  const buyBtn = await pickBuyBtn(page);
  await expect(buyBtn).toBeVisible({ timeout: 10000 });
  await expect(buyBtn).toBeEnabled();
});

// ── Large files — Buy must still appear (file size never hides Buy) ───────────

test("Buy visible — / (es) · Simple · 35 MB binary STL", async ({ page }) => {
  await page.goto("/");
  await uploadAndAwaitBuy(page, BINARY_35MB, 60000);
});

test("Buy visible — / (es) · Simple · 45 MB ASCII STL", async ({ page }) => {
  await page.goto("/");
  // ASCII→binary conversion happens in browser; allow extra time
  await uploadAndAwaitBuy(page, ASCII_45MB, 90000);
});

// ── Buy click initiates checkout ──────────────────────────────────────────────

test("Buy button click initiates checkout (no real Stripe session)", async ({ page }) => {
  await page.route("**/functions/v1/create-instant-checkout", route =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ checkoutUrl: "https://checkout.stripe.com/test" }),
    })
  );

  await page.goto("/");
  const buyBtn = await uploadAndAwaitBuy(page, CUBE_STL);

  const vw = page.viewportSize()?.width ?? 1280;
  const shippingBtn = vw < 1024
    ? page.locator('[data-testid="compact-fulfillment-shipping"]').last()
    : page.locator('[data-testid="compact-fulfillment-shipping"]').first();
  if (await shippingBtn.isVisible()) await shippingBtn.click();

  let checkoutNavigated = false;
  page.on("request", req => {
    if (req.url().includes("checkout.stripe.com")) checkoutNavigated = true;
  });

  await buyBtn.click();
  await page.waitForTimeout(2000);
  expect(checkoutNavigated || page.url().includes("checkout")).toBeTruthy();
});
