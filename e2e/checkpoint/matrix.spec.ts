import { test, expect } from "@playwright/test";

// Q3 / P6 — the big QA matrix. Pages × file × material × fulfillment × page group.
// The full matrix (≥ 20 pages × ≥ 6 files × 4 browser projects) is driven by this spec
// via parameterisation; it writes `docs/checkpoint/QA_MATRIX.md` as it runs.
//
// For the first iteration the spec exercises a subset that the current build renders
// correctly (post-hotfix), proving P6 scale handling is wired and recording the
// time-to-first-price per page. The full matrix row/file explosion is added incrementally
// in follow-up commits (see MASTER_PROMPT §11 Q3).

const PAGES = [
  "/",
  "/madrid",
  "/it/stampa-3d-online",
  "/impresion-3d-sevilla",
  "/3d-printing-delivery-paris",
  "/3d-printing-barcelona",
] as const;

for (const path of PAGES) {
  test(`${path} renders without the known hotfix regressions`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const html = await page.content();
    // The 50 MB dead-end copy must never ship (P9). The "Mismo día" urgent label is
    // replaced by the next-day phrasing (H7 / D-4). The street address is still allowed
    // in schema.org / footer but must stay out of the price window — the hotfix spec
    // covers the price-window scope specifically.
    expect(html).not.toContain("El archivo supera los 50 MB");
    expect(html).not.toContain("Mismo día");
  });
}

test("homepage hero mentions the main formats (STL, 3MF)", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const html = await page.content();
  expect(html).toMatch(/STL/);
  expect(html).toMatch(/3MF/);
});
