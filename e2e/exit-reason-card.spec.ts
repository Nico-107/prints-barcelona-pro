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

  // Upload file
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  // Wait for buy or review button (upload + price)
  const buyBtn = page.locator('[data-testid="buy-now-btn"]').last();
  const reviewBtn = page.locator('[data-testid="review-btn"]').last();
  await buyBtn.or(reviewBtn).last().waitFor({ state: "visible", timeout: 25000 });

  // Open modal
  if (await buyBtn.isVisible().catch(() => false)) {
    await buyBtn.click();
  } else {
    await reviewBtn.click();
  }

  // Confirm dialog is open
  const dialog = page.locator('[role="dialog"]').first();
  await dialog.waitFor({ state: "visible", timeout: 8000 });

  // Wait ≥5 s so the modal-open timer qualifies
  await page.waitForTimeout(5500);

  // Close the modal
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

  const buyBtn = page.locator('[data-testid="buy-now-btn"]').last();
  const reviewBtn = page.locator('[data-testid="review-btn"]').last();
  await buyBtn.or(reviewBtn).last().waitFor({ state: "visible", timeout: 25000 });

  if (await buyBtn.isVisible().catch(() => false)) {
    await buyBtn.click();
  } else {
    await reviewBtn.click();
  }

  await page.locator('[role="dialog"]').first().waitFor({ state: "visible", timeout: 8000 });
  await page.waitForTimeout(5500);

  const closeBtn = page.locator('[role="dialog"]').first().locator('button[aria-label]').first();
  await closeBtn.click();

  // Card appears
  await page.locator('[data-testid="exit-not-sent"]').waitFor({ state: "visible", timeout: 3000 });

  // Click the first chip (Precio / Price)
  const chips = page.locator('[data-testid="exit-not-sent"]').locator("..").locator("button");
  await chips.first().click();

  // After chip, the code-offer form should appear (email input)
  const emailInput = page.locator('input[type="email"][data-ph-mask]').last();
  await expect(emailInput).toBeVisible({ timeout: 3000 });
});
