/**
 * Guards the UX when the edge function (or the client pre-flight) rejects a
 * large STL. Expectation: no red "couldn't open payment page" banner —
 * instead a friendly amber message + the free-review CTA.
 */
import { test, expect } from "./_fixtures";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

test("server FILE_TOO_LARGE_FOR_INSTANT routes to free-review, not red error", async ({ page }) => {
  await page.route(/create-instant-checkout/, (route) => {
    route.fulfill({
      status: 400,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ error: "FILE_TOO_LARGE_FOR_INSTANT" }),
    });
  });

  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: "attached", timeout: 15_000 });
  await fileInput.setInputFiles(CUBE_STL);

  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    return btns.some((b) => b.clientHeight > 0 && !b.disabled && /\d/.test(b.textContent ?? ""));
  }, null, { timeout: 45_000 });

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    const vis = btns.find((b) => b.clientHeight > 0 && !b.disabled);
    vis?.click();
  });

  // Friendly amber message (role="status"), NOT the red destructive alert.
  // Rendered in two places (actions bar + form); assert at least one visible.
  const friendly = page.locator('[role="status"]', {
    hasText: /demasiado grande/i,
  }).first();
  await expect(friendly).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[role="alert"]')).toHaveCount(0);

  // The free-review CTA is present (label is `calc.error.freeReview.button`
  // when the code is FILE_TOO_LARGE). May render in both actions bars.
  const cta = page.locator('[data-ph-name="send-my-order"]').first();
  await expect(cta).toBeVisible();
  await expect(cta).toContainText(/revisión gratuita|free review/i);
});
