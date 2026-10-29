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

/**
 * Generate a binary STL of approximately targetMb megabytes as a UV sphere.
 * A smooth sphere simplifies well (< 0.5% volume change) so prepareStl()'s
 * volume-preservation check always passes → buy button always appears.
 * Radius 20 mm → 40×40×40 mm bbox, ~33,500 mm³ volume → price ~€5.
 */
function makeLargeBinaryStl(targetMb: number): string {
  const targetBytes = targetMb * 1024 * 1024;
  const totalTris = Math.floor((targetBytes - 84) / 50);
  const segs = Math.floor(Math.sqrt(totalTris / 2));
  const uSegs = segs, vSegs = segs;
  const triCount = uSegs * vSegs * 2;
  const R = 20; // 20 mm radius → small bbox, cheap to print

  const buf = Buffer.alloc(84 + triCount * 50, 0);
  buf.writeUInt32LE(triCount, 80);

  const cols = uSegs + 1, rows = vSegs + 1;
  const px = new Float32Array(cols * rows);
  const py = new Float32Array(cols * rows);
  const pz = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    const theta = (j * Math.PI) / vSegs;
    const st = Math.sin(theta), ct = Math.cos(theta);
    for (let i = 0; i < cols; i++) {
      const phi = (i * 2 * Math.PI) / uSegs;
      const idx = j * cols + i;
      px[idx] = R * st * Math.cos(phi);
      py[idx] = R * ct;
      pz[idx] = R * st * Math.sin(phi);
    }
  }

  let t = 0;
  for (let j = 0; j < vSegs; j++) {
    for (let i = 0; i < uSegs; i++) {
      const i0 = j * cols + i, i1 = i0 + 1, i2 = i0 + cols, i3 = i2 + 1;
      const quads: [number, number, number][] = [[i0, i2, i1], [i1, i2, i3]];
      for (const [a, b, c] of quads) {
        const off = 84 + t * 50;
        const ax = px[b]-px[a], ay = py[b]-py[a], az = pz[b]-pz[a];
        const bx = px[c]-px[a], by = py[c]-py[a], bz = pz[c]-pz[a];
        const nx = ay*bz - az*by, ny = az*bx - ax*bz, nz = ax*by - ay*bx;
        buf.writeFloatLE(nx, off);      buf.writeFloatLE(ny, off+4);    buf.writeFloatLE(nz, off+8);
        buf.writeFloatLE(px[a], off+12); buf.writeFloatLE(py[a], off+16); buf.writeFloatLE(pz[a], off+20);
        buf.writeFloatLE(px[b], off+24); buf.writeFloatLE(py[b], off+28); buf.writeFloatLE(pz[b], off+32);
        buf.writeFloatLE(px[c], off+36); buf.writeFloatLE(py[c], off+40); buf.writeFloatLE(pz[c], off+44);
        t++;
      }
    }
  }

  const outPath = path.join(os.tmpdir(), `buy-matrix-${targetMb}mb-${process.pid}.stl`);
  fs.writeFileSync(outPath, buf);
  return outPath;
}

/**
 * Generate an ASCII STL of approximately targetMb megabytes.
 * Uses front-face triangles (y=const, z varies) so each triangle contributes
 * a non-zero signed-volume term and the total volumeMm3 > 0.
 */
function makeLargeAsciiStl(targetMb: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // Each triangle with 3D vertices (z varies): ~145 bytes
    const bytesPerTri = 145;
    const triCount = Math.floor((targetMb * 1024 * 1024) / bytesPerTri);

    const outPath = path.join(os.tmpdir(), `buy-matrix-ascii-${targetMb}mb-${process.pid}.stl`);
    const ws = fs.createWriteStream(outPath);
    ws.on("error", reject);

    ws.write("solid generated\n");
    for (let i = 0; i < triCount; i++) {
      // Keep x and y within 0–50 mm by wrapping row/col so bbox stays small
      const col = i % 100;
      const row = (Math.floor(i / 100)) % 100; // wrap so y ≤ 50 mm
      const x = col * 0.5;
      const y = (row + 1) * 0.5; // y > 0 so signed-volume term is non-zero
      const z0 = 0, z1 = 0.5;
      ws.write(
        `  facet normal 0 -1 0\n    outer loop\n` +
        `      vertex ${x} ${y} ${z0}\n` +
        `      vertex ${x + 0.5} ${y} ${z0}\n` +
        `      vertex ${x + 0.5} ${y} ${z1}\n` +
        `    endloop\n  endfacet\n`
      );
    }
    ws.end("endsolid generated\n", () => resolve(outPath));
  });
}

// Pre-generate large fixtures once per run
let BINARY_35MB: string;
let ASCII_45MB: string;

test.beforeAll(async () => {
  BINARY_35MB = makeLargeBinaryStl(35);
  ASCII_45MB  = await makeLargeAsciiStl(45);
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
