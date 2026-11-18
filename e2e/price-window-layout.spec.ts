/**
 * C3: Price-window layout at 1249×779 — the [data-price-breakdown] element
 * must not be clipped between the scrollable form area and the pinned
 * actionSlot footer.
 *
 * Run with: npx playwright test e2e/price-window-layout.spec.ts
 */
import { test, expect } from "./_fixtures";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUBE_STL = path.resolve(__dirname, "../tests/fixtures/cube-20mm.stl");

test("price breakdown not clipped at 1249×779", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1249, height: 779 },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    try {
      localStorage.setItem("cookie-consent", "accepted");
      localStorage.setItem("cookie-consent-date", new Date().toISOString());
      localStorage.setItem(
        "dim3d-lang-suggest-dismissed",
        JSON.stringify({ es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true }),
      );
    } catch { /* ignore */ }
  });

  try {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CUBE_STL);

    const breakdown = page.locator("[data-price-breakdown]").first();
    await breakdown.waitFor({ state: "visible", timeout: 30_000 });

    // Scroll the breakdown into view so the browser can report its position
    await breakdown.scrollIntoViewIfNeeded();

    const box = await breakdown.boundingBox();
    expect(box, "[data-price-breakdown] must have a bounding box").not.toBeNull();

    if (box) {
      // The element's bottom edge must sit within the viewport height (779px).
      // Allow a 2px tolerance for sub-pixel rounding.
      expect(
        box.y + box.height,
        `[data-price-breakdown] bottom (${box.y + box.height}px) must be within viewport (779px)`
      ).toBeLessThanOrEqual(779 + 2);

      // The element must have positive area — it must not be display:none.
      expect(box.height, "[data-price-breakdown] must have positive height").toBeGreaterThan(0);
    }
  } finally {
    await context.close();
  }
});
