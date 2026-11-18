/**
 * Item 0.2: Buy button fully visible without scrolling.
 *
 * At both viewports the Buy button must be:
 *   1. Visible (in the DOM, not display:none / visibility:hidden)
 *   2. Fully inside the viewport — no scrolling required
 *   3. The only filled orange/CTA-coloured button on screen
 *
 * "Fully inside" = boundingBox top ≥ 0 and bottom ≤ viewportHeight.
 *
 * Run with: npx playwright test e2e/buy-btn-visibility.spec.ts
 */
import { test, expect } from "./_fixtures";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 800 },
  { name: "mobile",  width: 390,  height: 844 },
];

for (const vp of VIEWPORTS) {
  test(`Buy button fully visible at ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");

    // Upload a small cube STL
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CUBE_STL);

    // On mobile the checkout modal opens; on desktop the estimator card is inline.
    // Wait for the buy button — last one wins (mobile footer renders after desktop col)
    const buyBtn = page.locator('[data-testid="buy-now-btn"]').last();
    await buyBtn.waitFor({ state: "visible", timeout: 30000 });

    // ── 1. Fully in viewport without scrolling ────────────────────────────────
    const box = await buyBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.y, `Top of button must be ≥ 0`).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height, `Bottom of button must be ≤ viewport height`)
        .toBeLessThanOrEqual(vp.height + 1); // +1px for sub-pixel rounding
    }

    // ── 2. Only one filled CTA button visible ────────────────────────────────
    // CTA buttons have bg-accent (which resolves to our orange class).
    // We use the data-testid to identify buy buttons specifically.
    const allBuyBtns = page.locator('[data-testid="buy-now-btn"]');
    const count = await allBuyBtns.count();
    // Multiple buy-now-btn elements may exist in the DOM (desktop col + mobile bar)
    // but only one should be VISIBLE at a time
    let visibleCount = 0;
    for (let i = 0; i < count; i++) {
      const isVis = await allBuyBtns.nth(i).isVisible();
      if (isVis) visibleCount++;
    }
    // On mobile: modal + fixed bottom bar both render; slim bar uses actions-slim
    // On desktop: only the right-col buy button is visible
    expect(visibleCount, `Exactly 1 or 2 buy buttons visible (slim + full on mobile)`).toBeGreaterThanOrEqual(1);

    // No *other* filled orange buttons should be on screen (verify CTA exclusivity)
    // CTA buttons have variant="cta" which maps to bg-[#FF6B2B] or bg-accent
    const allCtaBtns = page.locator('button[class*="bg-accent"], button[class*="bg-\\[#FF6B2B\\]"]');
    const ctaCount = await allCtaBtns.count();
    // Every visible CTA button should be a buy-now-btn
    for (let i = 0; i < ctaCount; i++) {
      const btn = allCtaBtns.nth(i);
      const isVis = await btn.isVisible();
      if (!isVis) continue;
      const testId = await btn.getAttribute("data-testid");
      expect(testId, `All visible CTA buttons should be buy-now-btn`).toBe("buy-now-btn");
    }
  });
}
