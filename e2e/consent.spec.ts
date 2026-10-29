/**
 * STEP 3.6: Consent prompt Playwright tests
 * Run with: npx playwright test e2e/consent.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Consent banner", () => {
  test.beforeEach(async ({ page }) => {
    // Clear all consent cookies/storage before each test
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("cookie-consent");
      localStorage.removeItem("cookie-consent-date");
    });
    // Delete ph_ and _ga cookies
    const cookies = await page.context().cookies();
    const toDelete = cookies.filter(c => c.name.startsWith("ph_") || c.name.startsWith("_ga"));
    if (toDelete.length) {
      await page.context().clearCookies();
    }
  });

  test("before any choice: no ph_ or _ga cookies", async ({ page }) => {
    await page.goto("/");
    const cookies = await page.context().cookies();
    const badCookies = cookies.filter(c => c.name.startsWith("ph_") || c.name.startsWith("_ga"));
    expect(badCookies).toHaveLength(0);
  });

  test("banner appears after 4 s without scroll/click", async ({ page }) => {
    await page.goto("/");
    // Clear any existing consent
    await page.evaluate(() => {
      localStorage.removeItem("cookie-consent");
      localStorage.removeItem("cookie-consent-date");
    });
    await page.reload();

    // The banner should appear within 5 s (4 s timer + margin)
    const rejectBtn = page.getByRole("button", { name: /rechazar|reject|refuser|ablehnen|rifiuta|weigeren|recusar/i }).first();
    await expect(rejectBtn).toBeVisible({ timeout: 6000 });
  });

  test("banner appears on first scroll", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("cookie-consent");
      localStorage.removeItem("cookie-consent-date");
    });
    await page.reload();

    await page.mouse.wheel(0, 100);

    const rejectBtn = page.getByRole("button", { name: /rechazar|reject|refuser|ablehnen|rifiuta|weigeren|recusar/i }).first();
    await expect(rejectBtn).toBeVisible({ timeout: 2000 });
  });

  test("banner stays visible when calculator modal is open (no bounding-box overlap with buy-now-btn)", async ({ page, viewport }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("cookie-consent");
      localStorage.removeItem("cookie-consent-date");
    });
    await page.reload();

    // Trigger banner
    await page.mouse.wheel(0, 100);
    const rejectBtn = page.getByRole("button", { name: /rechazar|reject|refuser|ablehnen|rifiuta|weigeren|recusar/i }).first();
    await expect(rejectBtn).toBeVisible({ timeout: 2000 });

    // Open calculator modal by uploading a file
    const fileInput = page.locator('input[type="file"]').first();
    const filePath = require("path").resolve(__dirname, "../qa/fixtures/small-cube.stl");
    await fileInput.setInputFiles(filePath);

    // Wait for the buy button to appear
    const buyBtn = page.locator('[data-testid="buy-now-btn"]').first();
    const buyVisible = await buyBtn.isVisible({ timeout: 8000 }).catch(() => false);

    if (buyVisible) {
      // Banner should still be visible (docked at top when modal open)
      const bannerDialog = page.locator('[role="dialog"]').first();
      await expect(bannerDialog).toBeVisible();

      // Bounding boxes must NOT overlap
      const bannerBox = await bannerDialog.boundingBox();
      const buyBox = await buyBtn.boundingBox();
      if (bannerBox && buyBox) {
        const overlapsY = bannerBox.y + bannerBox.height > buyBox.y && buyBox.y + buyBox.height > bannerBox.y;
        const overlapsX = bannerBox.x + bannerBox.width > buyBox.x && buyBox.x + buyBox.width > bannerBox.x;
        expect(overlapsX && overlapsY).toBe(false);
      }
    }
  });

  test("after Accept: localStorage consent key set to accepted", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("cookie-consent");
      localStorage.removeItem("cookie-consent-date");
    });
    await page.reload();

    await page.mouse.wheel(0, 100);
    const acceptBtn = page.getByRole("button", { name: /aceptar|accept|accepter|akzeptieren|accetta|accepteren|aceitar/i }).first();
    await expect(acceptBtn).toBeVisible({ timeout: 2000 });
    await acceptBtn.click();

    const consent = await page.evaluate(() => localStorage.getItem("cookie-consent"));
    expect(consent).toBe("accepted");
  });

  test("after Reject: localStorage consent set to rejected, banner gone", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("cookie-consent");
      localStorage.removeItem("cookie-consent-date");
    });
    await page.reload();

    await page.mouse.wheel(0, 100);
    const rejectBtn = page.getByRole("button", { name: /rechazar|reject|refuser|ablehnen|rifiuta|weigeren|recusar/i }).first();
    await expect(rejectBtn).toBeVisible({ timeout: 2000 });
    await rejectBtn.click();

    const consent = await page.evaluate(() => localStorage.getItem("cookie-consent"));
    expect(consent).toBe("rejected");

    // Banner should be gone
    await expect(rejectBtn).not.toBeVisible({ timeout: 1000 });
  });

  test("footer 'Cookie preferences' link reopens banner", async ({ page }) => {
    await page.goto("/");
    // Accept first so banner is dismissed
    await page.evaluate(() => {
      localStorage.setItem("cookie-consent", "accepted");
      localStorage.setItem("cookie-consent-date", new Date().toISOString());
    });
    await page.reload();

    // Scroll to footer and click prefs link
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const prefsBtn = page.getByText(/preferencias de cookies|preferències|cookie preferences|préférences|cookie-einstellungen|preferenze|cookievoorkeuren|preferências/i).first();
    await expect(prefsBtn).toBeVisible({ timeout: 3000 });
    await prefsBtn.click();

    // Banner should reappear
    const rejectBtn = page.getByRole("button", { name: /rechazar|reject|refuser|ablehnen|rifiuta|weigeren|recusar/i }).first();
    await expect(rejectBtn).toBeVisible({ timeout: 2000 });
  });
});
