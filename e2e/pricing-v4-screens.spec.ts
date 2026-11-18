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

// Screenshot tests need extra time for STL processing and page hydration
test.setTimeout(240_000);
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
  { lang: "ca", path: "/ca" },
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
      await page.route("**/functions/v1/create-instant-checkout**", (route) => {
        let body: Record<string, unknown> | null = null;
        try { body = route.request().postDataJSON() as Record<string, unknown>; } catch { }
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

      // Wait for price to resolve (clientHeight > 0 to handle panels not in viewport)
      await page.waitForFunction(() => {
        const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
        return btns.some((b) => b.clientHeight > 0 && /[0-9]+[,.][0-9]{2}/.test(b.textContent ?? ""));
      }, null, { timeout: 30000 });

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
      await page.route("**/functions/v1/create-instant-checkout**", (route) => {
        let body: Record<string, unknown> | null = null;
        try { body = route.request().postDataJSON() as Record<string, unknown>; } catch { }
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

      // Wait for buy button (clientHeight > 0 to handle panels not in viewport)
      await page.waitForFunction(() => {
        const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
        return btns.some((b) => b.clientHeight > 0 && /[0-9]+[,.][0-9]{2}/.test(b.textContent ?? ""));
      }, null, { timeout: 30000 });

      if (vp.width < 1024) {
        await page.locator('[role="dialog"]').first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      }

      // Apply DIMENSION11 via the public code link (evaluate to bypass visibility)
      const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button")) as HTMLButtonElement[];
        const btn = btns.find((b) => /DIMENSION11/i.test(b.textContent ?? ""));
        if (btn) { btn.click(); return true; }
        return false;
      });
      if (clicked) await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(OUT, `${locale.lang}_${vp.name}_code-applied.png`),
        fullPage: false,
      });
    });

  }
}
