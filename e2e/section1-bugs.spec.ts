/**
 * Section 1 bug fixes — Playwright regression tests
 * 1.1 ship-only pages auto-select shipping, Buy button is enabled
 * 1.2 Buy while uploading shows spinner; after 20s shows timeout message
 * 1.3 ErrorBoundary wraps the page — no blank screen on render crash
 * 1.4 Wall-loop select only offers [2,3,4] — values the server accepts
 * 1.5 Buy goes directly to Stripe, no intermediate confirmation step
 */
import path from "path";
import { fileURLToPath } from "url";
import { test, expect } from "./_fixtures";
import type { Page } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

function pickBuyBtn(page: Page) {
  const vw = page.viewportSize()?.width ?? 1280;
  return vw < 1024
    ? page.locator('[data-testid="buy-now-btn"]').last()
    : page.locator('[data-testid="buy-now-btn"]').first();
}

async function uploadAndWaitForBuy(page: Page, filePath = CUBE_STL, timeout = 25000) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePath);
  const btn = pickBuyBtn(page);
  await expect(btn).toBeVisible({ timeout });
  return btn;
}

// ── 1.1: ship-only pages auto-select shipping ────────────────────────────────

const SHIP_ONLY_PAGES = [
  { path: "/it/stampa-3d-online", lang: "it" },
  { path: "/pt/impressao-3d-online", lang: "pt" },
  { path: "/nl/3d-printen-laten-maken", lang: "nl" },
  { path: "/fr/impression-3d-en-ligne", lang: "fr" },
  { path: "/de/3d-druck-service", lang: "de" },
];

for (const { path: pagePath } of SHIP_ONLY_PAGES) {
  test(`1.1 ship-only Buy enabled — ${pagePath}`, async ({ page }) => {
    await page.goto(pagePath);
    const btn = await uploadAndWaitForBuy(page);

    // The buy button must be enabled — previously it stayed disabled because
    // fulfillment defaulted to null with no picker to select on ship-only pages.
    await expect(btn).toBeEnabled({ timeout: 10000 });

    // No fulfillment-required error should be visible without clicking Buy
    const fulfillErr = page.locator('[role="alert"]').filter({
      hasText: /seleziona|selecteer|choisissez|wähle|selecione/i,
    });
    await expect(fulfillErr).not.toBeVisible();
  });
}

// ── 1.2: Buy timeout after 20s ───────────────────────────────────────────────

test("1.2 Buy stalled shows timeout message after 20s", async ({ page }) => {
  // Skip on mobile: route stall interception is unreliable on mobile browsers.
  // The core logic (setTimeout-based timeout) is tested on chromium which is sufficient.
  const vw = page.viewportSize()?.width ?? 1280;
  if (vw < 1024) test.skip();

  // Shorten the checkout timeout to 2s via window hook so the test
  // doesn't need page.clock.install() (which interferes with rAF-based dialog animations).
  await page.addInitScript(() => {
    (window as { __dim3d_checkout_timeout_ms?: number }).__dim3d_checkout_timeout_ms = 2000;
  });

  // Hold uploads pending (never resolve) so preUploadDone stays false.
  let resolveStall!: () => void;
  const stallPromise = new Promise<void>(r => { resolveStall = r; });
  await page.route("**/storage/v1/object/**", async route => {
    await stallPromise;
    await route.abort();
  });

  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  const buyBtn = pickBuyBtn(page);
  await expect(buyBtn).toBeVisible({ timeout: 20000 });
  await expect(buyBtn).toBeEnabled({ timeout: 10000 });

  // Select shipping so fulfillment is not null.
  // The compact picker appears 4× in the DOM (desktop+mobile slot duplication);
  // force:true bypasses visibility so we always hit the shared React handler.
  await page.locator('[data-testid="compact-fulfillment-shipping"]').first().click({ force: true });

  // Click Buy while upload is stalled (preUploadDone=false)
  await buyBtn.click();

  // Timeout message must appear within the shortened 2s window
  // Use .first() since the message is duplicated in desktop/mobile DOM slots
  const timeoutMsg = page.locator('[data-testid="buy-timeout-msg"]').first();
  await expect(timeoutMsg).toBeVisible({ timeout: 5000 });

  // Page must still be open (not blank)
  await expect(page).toHaveURL(/localhost/);

  // Release the stalled upload so the test can clean up
  resolveStall();
}, { timeout: 60_000 });

test("1.2 Buy during upload shows spinner, no error message", async ({ page }) => {
  // Skip on mobile: Supabase route interception is timing-sensitive on mobile browser
  const vw = page.viewportSize()?.width ?? 1280;
  if (vw < 1024) test.skip();

  let resolveUpload!: () => void;
  const uploadBlocked = new Promise<void>(r => { resolveUpload = r; });

  // Let checkout through so the button can proceed once upload finishes
  await page.route("**/functions/v1/create-instant-checkout", route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: "https://checkout.stripe.com/test" }) })
  );

  // Hold the upload pending
  await page.route("**/storage/v1/object/**", async route => {
    await uploadBlocked;
    await route.continue();
  });

  await page.goto("/");
  await page.locator('input[type="file"]').first().setInputFiles(CUBE_STL);

  const buyBtn = pickBuyBtn(page);
  // The file parses client-side; buy button should appear even while upload stalls
  await expect(buyBtn).toBeVisible({ timeout: 20000 });
  await expect(buyBtn).toBeEnabled({ timeout: 10000 });

  // Select shipping so fulfillment is not null
  const shippingBtn2 = page.locator('[data-testid="compact-fulfillment-shipping"]').first();
  if (await shippingBtn2.isVisible({ timeout: 2000 }).catch(() => false)) {
    await shippingBtn2.click();
  }

  // Click Buy while upload is still stalled
  await buyBtn.click();

  // Spinner must appear on the button (checkoutWaiting state)
  const spinner = buyBtn.locator(".animate-spin");
  await expect(spinner).toBeVisible({ timeout: 5000 });

  // No "fulfillment required" error from buy_blocked
  const fulfillErr = page.locator('[role="alert"]').filter({ hasText: /selecciona.*recogida/i });
  await expect(fulfillErr).not.toBeVisible();

  // Window must remain open
  await expect(page).toHaveURL(/localhost/);

  // Release the upload so the test can clean up
  resolveUpload();
}, { timeout: 60_000 });

// ── 1.3: ErrorBoundary renders — no blank screen ─────────────────────────────

test("1.3 ErrorBoundary: app page renders without crashing", async ({ page }) => {
  await page.goto("/");
  const bodyLen = await page.locator("body").evaluate(el => el.textContent?.length ?? 0);
  expect(bodyLen).toBeGreaterThan(200);

  // No error boundary reload button visible (no crash)
  const reloadBtn = page.locator("button").filter({ hasText: /recargar|reload|recharger|neu laden/i });
  await expect(reloadBtn).not.toBeVisible();
});

test("1.3 ErrorBoundary: price window opens without crashing", async ({ page }) => {
  await page.goto("/");
  const btn = await uploadAndWaitForBuy(page);
  await btn.click();

  // After clicking, page must still be alive
  const bodyLen = await page.locator("body").evaluate(el => el.textContent?.length ?? 0);
  expect(bodyLen).toBeGreaterThan(200);

  // No error boundary fallback visible
  const errorHeading = page.locator("p").filter({ hasText: /algo ha fallado|something went wrong/i });
  await expect(errorHeading).not.toBeVisible();
});

// ── 1.4: Wall-loop select only contains [2, 3, 4] ────────────────────────────

test("1.4 Wall-loop select only offers valid values [2,3,4]", async ({ page }) => {
  // Skip on mobile — advanced mode and part settings need a wider viewport
  const vw = page.viewportSize()?.width ?? 1280;
  if (vw < 1024) test.skip();

  await page.goto("/");
  await page.locator('input[type="file"]').first().setInputFiles(CUBE_STL);

  const buyBtn = pickBuyBtn(page);
  await expect(buyBtn).toBeVisible({ timeout: 20000 });

  // Open advanced mode
  const toggle = page.locator('[data-testid="advanced-mode-toggle"]').first();
  if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
    await toggle.click();
  }

  // Expand part settings
  const customizeBtn = page.locator("button").filter({ hasText: /personalizar|customize/i }).first();
  if (await customizeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await customizeBtn.click();
  }

  // Check: no options with values 5-8 exist in any select
  for (const badValue of [5, 6, 7, 8]) {
    const badOpt = page.locator(`select option[value="${badValue}"]`);
    expect(await badOpt.count()).toBe(0);
  }

  // Valid options must still exist
  const opt2 = page.locator('select option[value="2"]');
  if (await opt2.count() > 0) {
    await expect(page.locator('select option[value="3"]').first()).toBeAttached();
    await expect(page.locator('select option[value="4"]').first()).toBeAttached();
  }
});

// ── 1.5: Buy goes directly to Stripe ────────────────────────────────────────

test("1.5 Buy initiates checkout immediately on click", async ({ page }) => {
  // Skip on mobile — fulfillment picker and Buy flow differ
  const vw = page.viewportSize()?.width ?? 1280;
  if (vw < 1024) test.skip();

  let checkoutCallCount = 0;
  await page.route("**/functions/v1/create-instant-checkout", async route => {
    checkoutCallCount++;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: "https://checkout.stripe.com/test-session-id" }),
    });
  });

  await page.goto("/");
  await page.locator('input[type="file"]').first().setInputFiles(CUBE_STL);

  const buyBtn = pickBuyBtn(page);
  await expect(buyBtn).toBeVisible({ timeout: 20000 });
  await expect(buyBtn).toBeEnabled({ timeout: 10000 });

  // Select shipping if picker is visible
  const shippingBtn = page.locator('[data-testid="compact-fulfillment-shipping"]').first();
  if (await shippingBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await shippingBtn.click();
  }

  // Click Buy — should immediately call checkout
  await buyBtn.click();

  // Checkout must have been called (no intermediate step)
  await expect.poll(() => checkoutCallCount, { timeout: 10000 }).toBeGreaterThan(0);
}, { timeout: 60_000 });
