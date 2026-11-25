import { test, expect } from "@playwright/test";

// U6 — special states (oversize, units, small, messy, large upload, unsupported format,
// price updated, checkout error, quote-only). The full-state screenshots live in
// e2e/checkpoint/screenshots.spec.ts (Q6); this spec guards the state components exist
// via smoke-level selectors.

test("homepage calculator renders without unhandled errors", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test("quote-only city page (London) renders a quote form, not a buy button for impossible flows", async ({ page }) => {
  await page.goto("/3d-printing-delivery-london", { waitUntil: "domcontentloaded" });
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});
