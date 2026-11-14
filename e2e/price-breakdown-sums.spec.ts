/**
 * fix-polish §1.1 — the visible rows inside [data-price-breakdown] must
 * always add up to the Total row. Reproduces the live bug where the
 * breakdown showed "Piezas 14,79 € · Envío 5,90 €" against a Total of
 * 15,90 € (4,79 € mismatch: the minimum-order adjustment was being
 * double-counted into the Piezas line).
 */
import { test, expect } from "./_fixtures";
import path from "path";

const CUBE_STL = path.resolve(__dirname, "../tests/fixtures/cube-20mm.stl");

function parseEuro(text: string): number {
  // Accepts "5,21 €", "+5,90 €", "15,90 €", "€ 5.21" etc.
  const m = text.replace(/\s/g, "").match(/([+-]?\d+[.,]\d{2})/);
  if (!m) throw new Error(`could not parse euro value from ${JSON.stringify(text)}`);
  return Math.round(parseFloat(m[1].replace(",", ".")) * 100);
}

test("price breakdown rows sum to total (pickup)", async ({ page }) => {
  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);
  // Wait for the breakdown to render
  const breakdown = page.locator("[data-price-breakdown]").first();
  await breakdown.waitFor({ state: "visible", timeout: 30000 });
  // Ensure pickup (no shipping row)
  const pickup = page.getByRole("button", { name: /recogida|pickup|recollida/i }).first();
  if (await pickup.count()) await pickup.click().catch(() => {});

  const rows = await breakdown.locator("div.flex").all();
  expect(rows.length).toBeGreaterThanOrEqual(2);
  let total = 0;
  let found = 0;
  for (const row of rows) {
    const txt = (await row.textContent()) ?? "";
    if (/total/i.test(txt)) { total = parseEuro(txt); continue; }
    try { const v = parseEuro(txt); found += v; } catch { /* non-value row */ }
  }
  expect(found).toBe(total);
});

test("price breakdown rows sum to total (shipping)", async ({ page }) => {
  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);
  const breakdown = page.locator("[data-price-breakdown]").first();
  await breakdown.waitFor({ state: "visible", timeout: 30000 });
  // Choose shipping if the UI exposes a toggle; otherwise the default already
  // is shipping and the row renders automatically.
  const ship = page.getByRole("button", { name: /env[ií]o|shipping|verzend/i }).first();
  if (await ship.count()) await ship.click().catch(() => {});

  const rows = await breakdown.locator("div.flex").all();
  let total = 0;
  let found = 0;
  for (const row of rows) {
    const txt = (await row.textContent()) ?? "";
    if (/total/i.test(txt)) { total = parseEuro(txt); continue; }
    try { const v = parseEuro(txt); found += v; } catch { /* skip */ }
  }
  expect(found).toBe(total);
});
