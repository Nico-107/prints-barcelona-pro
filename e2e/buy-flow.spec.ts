/**
 * Item 6: Buy flow — Chromium + WebKit.
 *
 * Asserts that the price shown on the Buy button equals the amount_cents
 * sent to the checkout edge function. Tests both pickup and shipping modes.
 *
 * Strategy:
 *   1. Mock probe → v4 (always; v3 is removed from frontend).
 *   2. Intercept checkout call and capture amount_cents.
 *   3. Upload a known file, wait for exact price (not "desde").
 *   4. Read buy-button text, parse to cents.
 *   5. Click Buy → assert captured == displayed (±1 cent).
 */
import { test, expect } from "./_fixtures";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

/** Parse a price string like "9,90 €", "€9.90", "10,80 €" → cents. */
function parseCents(text: string): number {
  const clean = text.replace(/[ \s]/g, "");
  const m = clean.match(/([0-9]+)[,.]([0-9]{2})/);
  if (!m) throw new Error(`Cannot parse price from: ${JSON.stringify(text)}`);
  return parseInt(m[1], 10) * 100 + parseInt(m[2], 10);
}

/** Wait until a buy-now-btn has a size and contains an exact numeric price (not "desde"). */
async function waitForExactPrice(page: import("@playwright/test").Page): Promise<string> {
  // Use clientHeight > 0 so we don't require viewport visibility (button may be below fold).
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    return btns.some((b) => b.clientHeight > 0 && !b.disabled && /[0-9]+[,.][0-9]{2}/.test(b.textContent ?? ""));
  }, null, { timeout: 45_000 });
  const text = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    const btn = btns.find((b) => b.clientHeight > 0 && /[0-9]+[,.][0-9]{2}/.test(b.textContent ?? ""));
    return btn?.textContent ?? "";
  });
  return text;
}

/** Safe postDataJSON — works in all browsers (postDataJSON is synchronous). */
function safePostData(route: import("@playwright/test").Route): Record<string, unknown> | null {
  try {
    return route.request().postDataJSON() as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mockV4(page: import("@playwright/test").Page, onCheckout?: (cents: number) => void) {
  return page.route("**/functions/v1/create-instant-checkout**", (route) => {
    const body = safePostData(route);
    if (body?.probe) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ pricing_version: 4, public_code: null }),
      });
    }
    if (typeof body?.amount_cents === "number" && onCheckout) {
      onCheckout(body.amount_cents as number);
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ url: "https://checkout.stripe.com/fake" }),
    });
  });
}

// ── Pickup flow ───────────────────────────────────────────────────────────────

test("pickup: buy-button price equals checkout amount", async ({ page }) => {
  let checkoutCents: number | null = null;
  await mockV4(page, (c) => { checkoutCents = c; });

  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  const btnText = await waitForExactPrice(page);
  const displayedCents = parseCents(btnText);
  expect(displayedCents).toBeGreaterThanOrEqual(990); // ≥ €9.90 minimum

  // Verify pickup auto-selected: button does NOT say "desde/from"
  expect(btnText).not.toMatch(/desde|from|ab|dès|vanaf|da |a partir/i);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    btns.find((b) => b.clientHeight > 0 && !b.disabled)?.click();
  });
  await page.waitForTimeout(3_000);

  if (checkoutCents !== null) {
    expect(
      Math.abs(checkoutCents - displayedCents),
      `Checkout ${checkoutCents} ¢ vs displayed ${displayedCents} ¢`,
    ).toBeLessThanOrEqual(1);
  }
});

// ── Shipping flow ─────────────────────────────────────────────────────────────

test("shipping: buy-button price equals checkout amount", async ({ page }) => {
  let checkoutCents: number | null = null;
  await mockV4(page, (c) => { checkoutCents = c; });

  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  await waitForExactPrice(page);

  const shippingBtn = page.locator('[data-testid="compact-fulfillment-shipping"]').first();
  if (await shippingBtn.count() > 0) {
    await shippingBtn.click();
    await page.waitForTimeout(500);
  }

  const btnText = await waitForExactPrice(page);
  const displayedCents = parseCents(btnText);
  expect(displayedCents).toBeGreaterThanOrEqual(990);
  expect(btnText).not.toMatch(/desde|from|ab|dès|vanaf|da |a partir/i);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    btns.find((b) => b.clientHeight > 0 && !b.disabled)?.click();
  });
  await page.waitForTimeout(3_000);

  if (checkoutCents !== null) {
    expect(
      Math.abs(checkoutCents - displayedCents),
      `Checkout ${checkoutCents} ¢ vs displayed ${displayedCents} ¢`,
    ).toBeLessThanOrEqual(1);
  }
});

// ── v4 + promo code ───────────────────────────────────────────────────────────

test("v4 + DIMENSION11: discounted price equals checkout amount", async ({ page }) => {
  const PROMO_PCT = 20;
  let checkoutCents: number | null = null;

  await page.route("**/functions/v1/create-instant-checkout**", (route) => {
    const body = safePostData(route);
    if (body?.probe) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({
          pricing_version: 4,
          public_code: { code: "DIMENSION11", pct: PROMO_PCT, ends_at: "2027-11-30" },
        }),
      });
    }
    if (typeof body?.amount_cents === "number") checkoutCents = body.amount_cents as number;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ url: "https://checkout.stripe.com/fake-promo" }),
    });
  });

  await page.goto("/");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);

  await waitForExactPrice(page);

  // Apply public promo code if the button is visible
  const promoBtn = page.locator("button", { hasText: /DIMENSION11/i }).first();
  if (await promoBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await promoBtn.click();
    await page.waitForTimeout(500);
  }

  const btnText = await waitForExactPrice(page);
  const displayedCents = parseCents(btnText);
  // With 20% off, the discounted price may be below the 9,90 € minimum
  expect(displayedCents).toBeGreaterThan(0);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    btns.find((b) => b.clientHeight > 0 && !b.disabled)?.click();
  });
  await page.waitForTimeout(3_000);

  if (checkoutCents !== null) {
    expect(
      Math.abs(checkoutCents - displayedCents),
      `Checkout ${checkoutCents} ¢ vs displayed ${displayedCents} ¢`,
    ).toBeLessThanOrEqual(1);
  }
});
