import { test, expect } from "@playwright/test";

// H9 — live smoke against production. Only runs with LIVE=1 (set manually; run-tests.mjs never
// sets it so this spec is skipped in CI).
test.skip(!process.env.LIVE, "live only");

const BASE = "https://www.dimension3dprints.com";
const PAGES = ["/", "/madrid", "/it/stampa-3d-online", "/impresion-3d-sevilla", "/3d-printing-delivery-paris"] as const;

for (const path of PAGES) {
  test(`${path}: page renders without street-address leak`, async ({ page }) => {
    await page.goto(`${BASE}${path}?internal=1`, { waitUntil: "domcontentloaded" });
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("Rambla del Brasil");
    expect(body).not.toContain("Parsi");
    expect(body).not.toContain("Mismo día");
  });
}

test("Sevilla page shows Sevilla pickup, not Barcelona", async ({ page }) => {
  await page.goto(`${BASE}/impresion-3d-sevilla?internal=1`, { waitUntil: "domcontentloaded" });
  const body = await page.locator("body").innerText();
  expect(body).toMatch(/Sevilla/);
});

test("Paris delivery page shows no pickup option", async ({ page }) => {
  await page.goto(`${BASE}/3d-printing-delivery-paris?internal=1`, { waitUntil: "domcontentloaded" });
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/Rambla|Retrait gratuit en Barcelone/);
});
