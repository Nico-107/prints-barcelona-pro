/**
 * Item 7: pricing-v4 reference screenshots.
 *
 * Captures the estimator in ES and IT, desktop (1440×900) and mobile (390×844),
 * with and without DIMENSION11 applied.  Mocks the probe to return v4 so the
 * hero badge and PromoLine always render regardless of live backend.
 *
 * Run with:
 *   npx playwright test e2e/pricing-v4-screens.spec.ts --project=chromium
 *
 * Output: docs/pricing-v4-screens/
 */
import { test } from "@playwright/test";
import path from "path";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT = path.resolve("docs/pricing-v4-screens");
mkdirSync(OUT, { recursive: true });

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

const LOCALES = [
  { lang: "es", path: "/" },
  { lang: "it", path: "/it" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile",  width: 390,  height: 844 },
];

function initScript() {
  try {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    localStorage.setItem("dim3d-lang-suggest-dismissed", JSON.stringify({
      es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true,
    }));
    localStorage.removeItem("dim3d-exit-survey-shown");
  } catch { /* ignore */ }
}

for (const locale of LOCALES) {
  for (const vp of VIEWPORTS) {

    test(`${locale.lang} ${vp.name} — no code`, async ({ page }) => {
      await page.addInitScript(initScript);

      // Force v4 probe with DIMENSION11 public code
      await page.route("**/functions/v1/create-instant-checkout**", async (route) => {
        const body = await route.request().postDataJSON().catch(() => null);
        if (body?.probe) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              pricing_version: 4,
              public_code: { code: "DIMENSION11", pct: 10, ends_at: "2026-11-30" },
            }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "https://checkout.stripe.com/fake" }),
        });
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(locale.path);

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(CUBE_STL);

      // Wait for price to resolve
      await page.locator('[data-testid="buy-now-btn"]').last().waitFor({ state: "visible", timeout: 30000 });

      // On mobile, the modal opens — wait for it
      if (vp.width < 1024) {
        await page.locator('[role="dialog"]').first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      }

      await page.screenshot({
        path: path.join(OUT, `${locale.lang}_${vp.name}_no-code.png`),
        fullPage: false,
      });
    });

    test(`${locale.lang} ${vp.name} — DIMENSION11 applied`, async ({ page }) => {
      await page.addInitScript(initScript);

      // Force v4 probe
      await page.route("**/functions/v1/create-instant-checkout**", async (route) => {
        const body = await route.request().postDataJSON().catch(() => null);
        if (body?.probe) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              pricing_version: 4,
              public_code: { code: "DIMENSION11", pct: 10, ends_at: "2026-11-30" },
            }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "https://checkout.stripe.com/fake" }),
        });
      });

      // Mock validate_promo so the manual code input also works
      await page.route("**/rest/v1/rpc/validate_promo**", async (route) => {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ valid: true, pct: 10 }),
        });
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(locale.path);

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(CUBE_STL);

      // Wait for buy button
      await page.locator('[data-testid="buy-now-btn"]').last().waitFor({ state: "visible", timeout: 30000 });

      if (vp.width < 1024) {
        await page.locator('[role="dialog"]').first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      }

      // Apply DIMENSION11 via the public code link (one click)
      const promoLink = page.locator("button", { hasText: /DIMENSION11/i }).first();
      if (await promoLink.count() > 0) {
        await promoLink.click();
        await page.waitForTimeout(400);
      }

      await page.screenshot({
        path: path.join(OUT, `${locale.lang}_${vp.name}_code-applied.png`),
        fullPage: false,
      });
    });

  }
}
