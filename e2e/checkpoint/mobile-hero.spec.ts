import { test, expect } from "@playwright/test";

// T3 — mobile hero + WhatsApp. Smoke-only here; full visual + click-tracking in
// screenshots.spec.ts.

test("home ES renders on 390×844 without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(395);
});

test("WhatsApp bubble is present on homepage (T4)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const html = await page.content();
  expect(html).toMatch(/whatsapp|wa\.me/i);
});
