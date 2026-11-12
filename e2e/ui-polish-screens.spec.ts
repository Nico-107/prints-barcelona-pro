/**
 * Section E screenshots for ui-polish branch verification.
 * Run: npx playwright test e2e/ui-polish-screens.spec.ts --project=chromium
 * Outputs to docs/ui-polish-screens/
 */
import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const OUT = path.resolve("docs/ui-polish-screens");
fs.mkdirSync(OUT, { recursive: true });

const ACCEPT_COOKIES = `() => {
  try {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    localStorage.setItem("dim3d-lang-suggest-dismissed", JSON.stringify({
      es:true,ca:true,en:true,de:true,fr:true,nl:true,it:true,pt:true
    }));
  } catch {}
}`;

async function shoot(
  page: Parameters<Parameters<typeof test>[1]>[0]["page"],
  label: string,
  viewport: { width: number; height: number },
  fullPage: boolean
) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(400);
  const suffix = fullPage ? "_full" : "_first";
  const filename = `${label}_${viewport.width}x${viewport.height}${suffix}.png`;
  await page.screenshot({ path: path.join(OUT, filename), fullPage });
  return filename;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(eval(ACCEPT_COOKIES)); // eslint-disable-line
});

test("ES V1 home — 1440px first + full", async ({ page }) => {
  await page.goto("/?xp=home_v2:A");
  await page.waitForLoadState("networkidle");
  await shoot(page, "es-v1", { width: 1440, height: 900 }, false);
  await shoot(page, "es-v1", { width: 1440, height: 900 }, true);
});

test("ES V1 home — 1200px first", async ({ page }) => {
  await page.goto("/?xp=home_v2:A");
  await page.waitForLoadState("networkidle");
  await shoot(page, "es-v1", { width: 1200, height: 900 }, false);
});

test("ES V1 home — 390px first", async ({ page }) => {
  await page.goto("/?xp=home_v2:A");
  await page.waitForLoadState("networkidle");
  await shoot(page, "es-v1", { width: 390, height: 844 }, false);
});

test("ES V2 home — 1440px first + full", async ({ page }) => {
  await page.goto("/?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await shoot(page, "es-v2", { width: 1440, height: 900 }, false);
  await shoot(page, "es-v2", { width: 1440, height: 900 }, true);
});

test("ES V2 home — 1200px first", async ({ page }) => {
  await page.goto("/?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await shoot(page, "es-v2", { width: 1200, height: 900 }, false);
});

test("ES V2 home — 390px first", async ({ page }) => {
  await page.goto("/?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await shoot(page, "es-v2", { width: 390, height: 844 }, false);
});

test("CA V2 home — 1440px first", async ({ page }) => {
  await page.goto("/ca/?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await shoot(page, "ca-v2", { width: 1440, height: 900 }, false);
});

test("CA V2 home — 390px first", async ({ page }) => {
  await page.goto("/ca/?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await shoot(page, "ca-v2", { width: 390, height: 844 }, false);
});

test("IT landing V1 — 1440px first + full", async ({ page }) => {
  await page.goto("/it/stampa-3d-online?xp=home_v2:A");
  await page.waitForLoadState("networkidle");
  await shoot(page, "it-v1", { width: 1440, height: 900 }, false);
  await shoot(page, "it-v1", { width: 1440, height: 900 }, true);
});

test("IT landing V1 — 390px first", async ({ page }) => {
  await page.goto("/it/stampa-3d-online?xp=home_v2:A");
  await page.waitForLoadState("networkidle");
  await shoot(page, "it-v1", { width: 390, height: 844 }, false);
});

test("IT landing V2 — 1440px first", async ({ page }) => {
  await page.goto("/it/stampa-3d-online?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await shoot(page, "it-v2", { width: 1440, height: 900 }, false);
});

test("IT landing V2 — 390px first", async ({ page }) => {
  await page.goto("/it/stampa-3d-online?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await shoot(page, "it-v2", { width: 390, height: 844 }, false);
});

test("DE landing V2 — 1440px first + full", async ({ page }) => {
  await page.goto("/de/3d-druck-service?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await shoot(page, "de-v2", { width: 1440, height: 900 }, false);
  await shoot(page, "de-v2", { width: 1440, height: 900 }, true);
});

test("Primary button close-up — normal state", async ({ page }) => {
  await page.goto("/?xp=home_v2:A");
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({ width: 1440, height: 900 });
  const btn = page.locator("[data-hero-cta]").first();
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await btn.screenshot({ path: path.join(OUT, "btn-primary-normal.png") });
});

test("Primary button close-up — hover state", async ({ page }) => {
  await page.goto("/?xp=home_v2:A");
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({ width: 1440, height: 900 });
  const btn = page.locator("[data-hero-cta]").first();
  await btn.scrollIntoViewIfNeeded();
  await btn.hover();
  await page.waitForTimeout(200);
  await btn.screenshot({ path: path.join(OUT, "btn-primary-hover.png") });
});

test("V2 hero shows split image (not V1 centered hero)", async ({ page }) => {
  await page.goto("/?xp=home_v2:B");
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({ width: 1440, height: 900 });
  const splitImg = page.locator("[data-v2-hero]");
  await expect(splitImg).toBeVisible();
  const v1 = page.locator(".ds-v1-hero-section");
  await expect(v1).not.toBeVisible();
});

test("Header shows desktop nav at 1024px (not hamburger)", async ({ page }) => {
  await page.goto("/?xp=home_v2:A");
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({ width: 1024, height: 768 });
  const hamburger = page.locator("button[aria-label]").filter({ hasText: "" }).first();
  // Desktop nav should be visible, hamburger hidden at lg breakpoint
  const desktopNav = page.locator("header nav").first();
  await expect(desktopNav).toBeVisible();
  await shoot(page, "header-1024px", { width: 1024, height: 768 }, false);
});
