/**
 * Guards the "Buy now → Stripe redirect" path for a small instant-eligible
 * order. The edge function is mocked so this spec does not depend on the
 * live Supabase deploy; it verifies that when the function returns a
 * `checkoutUrl` on https://checkout.stripe.com/..., the client actually
 * navigates there (no silent fallback modal).
 */
import { test, expect } from "./_fixtures";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

const MOCK_STRIPE_URL = "https://checkout.stripe.com/pay/cs_test_mock_session_small_cube";

test("Buy now on a small part redirects to checkout.stripe.com", async ({ page }) => {
  // Stub the edge function so the test does not touch the real Supabase
  // deploy. Match both direct and (future) proxied hosts.
  await page.route(/create-instant-checkout/, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ checkoutUrl: MOCK_STRIPE_URL }),
    });
  });

  // Also intercept the actual navigation so Playwright doesn't try to open
  // the real Stripe page (which would hang the test). We only need to prove
  // the client issued the redirect.
  await page.route(MOCK_STRIPE_URL, (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>stripe</body></html>",
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

  const stripeNav = page.waitForURL(/checkout\.stripe\.com/, { timeout: 25_000 });

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    const vis = btns.find((b) => b.clientHeight > 0 && !b.disabled);
    vis?.click();
  });

  await stripeNav;
  expect(page.url()).toMatch(/^https:\/\/checkout\.stripe\.com\//);
});
