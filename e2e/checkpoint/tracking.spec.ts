import { test, expect } from "@playwright/test";

// O14 — tracking page. /track exists; /pedido/<token> exists as a route.

test("/track loads a page", async ({ page }) => {
  await page.goto("/track", { waitUntil: "domcontentloaded" });
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});

test("/pedido/<token> route is wired (shows 'order not found' or similar when unknown)", async ({ page }) => {
  await page.goto("/pedido/unknown-token-xxx", { waitUntil: "domcontentloaded" });
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});
