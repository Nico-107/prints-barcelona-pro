import { test, expect } from "@playwright/test";

// D5 / O4 — admin shell e2e. Full admin rewrite lives in Phase O; this spec holds the
// baseline: /admin/estado is reachable, /admin loads without crashing.

test("/admin/estado loads without crashing", async ({ page }) => {
  // Mock the pricing-config probe so useServerCapabilities does not time out against a
  // real backend in CI; the admin shell will render regardless.
  await page.route(/\/functions\/v1\/pricing-config/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        build: "v5-local0000",
        pricingVersion: 5,
        capabilities: ["quote_v5", "shipping_v5"],
        shipping: { flatCents: 490, freeFromCents: 3000, charmCapCents: 3090 },
        estHash: "h0",
      }),
    }),
  );
  await page.goto("/admin/estado", { waitUntil: "domcontentloaded" });
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});

test("/admin loads without crashing", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});
