/**
 * STEP 1.7: Buy-button matrix test
 * Uploads a small cube STL across pages/modes and asserts the Buy button is visible.
 * Run with: npx playwright test e2e/buy-matrix.spec.ts
 */
import { test, expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

const PAGES_TO_TEST = [
  { path: "/", lang: "es" },
  { path: "/3d-printing-service", lang: "en" },
  { path: "/it/stampa-3d-online", lang: "it" },
  { path: "/pt/impressao-3d-online", lang: "pt" },
  { path: "/nl/3d-printen-laten-maken", lang: "nl" },
];

async function uploadFileAndWaitForBuyButton(page: Page, filePath: string) {
  // Find the file input and upload
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePath);

  // Wait for the modal to open and the Buy button to appear
  const buyBtn = page.locator('[data-testid="buy-now-btn"]').first();
  await expect(buyBtn).toBeVisible({ timeout: 10000 });
  await expect(buyBtn).toBeEnabled({ timeout: 10000 });
  return buyBtn;
}

for (const { path: pagePath, lang } of PAGES_TO_TEST) {
  test(`Buy button visible on ${pagePath} (${lang}) — Simple mode`, async ({ page }) => {
    await page.goto(pagePath);
    const buyBtn = await uploadFileAndWaitForBuyButton(page, CUBE_STL);
    await expect(buyBtn).toBeVisible();
    await expect(buyBtn).toBeEnabled();
  });
}

test("Buy button visible on / — Advanced mode", async ({ page }) => {
  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  // Switch to advanced mode
  const advancedToggle = page.locator('[data-testid="advanced-mode-toggle"]').first();
  if (await advancedToggle.isVisible()) {
    await advancedToggle.click();
  }

  const buyBtn = page.locator('[data-testid="buy-now-btn"]').first();
  await expect(buyBtn).toBeVisible({ timeout: 10000 });
  await expect(buyBtn).toBeEnabled({ timeout: 10000 });
});

test("Buy button click initiates checkout (no real Stripe session)", async ({ page }) => {
  // Intercept the edge function call so no real session is created
  await page.route("**/functions/v1/create-instant-checkout", route =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ checkoutUrl: "https://checkout.stripe.com/test" }),
    })
  );

  await page.goto("/");
  const buyBtn = await uploadFileAndWaitForBuyButton(page, CUBE_STL);

  // Select fulfillment before clicking
  const shippingBtn = page.locator('[data-testid="compact-fulfillment-shipping"]').first();
  if (await shippingBtn.isVisible()) {
    await shippingBtn.click();
  }

  // Intercept the navigation so we don't actually go to Stripe
  let checkoutNavigated = false;
  page.on("request", req => {
    if (req.url().includes("checkout.stripe.com")) checkoutNavigated = true;
  });

  await buyBtn.click();
  // The page should attempt to navigate to Stripe
  await page.waitForTimeout(2000);
  expect(checkoutNavigated || page.url().includes("checkout")).toBeTruthy();
});
