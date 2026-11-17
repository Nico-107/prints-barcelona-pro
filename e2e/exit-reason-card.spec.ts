/**
 * 4.6: ExitReasonCard e2e
 *
 * Verifies that the "What stopped you?" bottom card appears after the
 * checkout modal is open for ≥5 s and then closed. Runs without the
 * internal admin flag.
 *
 * Run with: npx playwright test e2e/exit-reason-card.spec.ts
 */
import { test, expect } from "./_fixtures";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

test("Exit-reason card appears after modal open ≥5 s and dismissed", async ({ page }) => {
  await page.addInitScript(() => {
    // Clear survey-shown flag so the card can appear
    try {
      localStorage.removeItem("dim3d-exit-survey-shown");
      localStorage.removeItem("dim3d-lead-submitted");
    } catch {}
  });

  await page.goto("/");

  // Upload file — the modal opens automatically
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  // Wait for the modal to open and price to resolve
  const dialog = page.locator('[role="dialog"]').first();
  await dialog.waitFor({ state: "visible", timeout: 25000 });

  // Wait for the visible buy button (last one in DOM — inside mobile footer, not hidden desktop section)
  await dialog.locator('[data-testid="buy-now-btn"]').last().waitFor({ state: "visible", timeout: 20000 });

  // Keep modal open ≥5 s so the timer qualifies
  await page.waitForTimeout(5500);

  // Close the modal via the X button
  const closeBtn = dialog.locator('button[aria-label]').first();
  await closeBtn.click();

  // The ExitReasonCard (bottom card) should appear
  const notSentLine = page.locator('[data-testid="exit-not-sent"]');
  await expect(notSentLine).toBeVisible({ timeout: 3000 });
});

test("Exit-reason: chip fires and transitions to code-offer form", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("dim3d-exit-survey-shown");
      localStorage.removeItem("dim3d-lead-submitted");
    } catch {}
  });

  await page.goto("/");

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  // Wait for modal + price
  const dialog = page.locator('[role="dialog"]').first();
  await dialog.waitFor({ state: "visible", timeout: 25000 });
  await dialog.locator('[data-testid="buy-now-btn"]').last().waitFor({ state: "visible", timeout: 20000 });

  await page.waitForTimeout(5500);

  const closeBtn = dialog.locator('button[aria-label]').first();
  await closeBtn.click();

  // Card appears
  await page.locator('[data-testid="exit-not-sent"]').waitFor({ state: "visible", timeout: 3000 });

  // Click the first chip — target the flex-wrap sibling div of exit-not-sent
  const firstChip = page.locator('[data-testid="exit-not-sent"] ~ div.flex-wrap button').first();
  await firstChip.click();

  // After chip, the code-offer form should appear (email input)
  const emailInput = page.locator('input[type="email"][data-ph-mask]').last();
  await expect(emailInput).toBeVisible({ timeout: 3000 });
});
