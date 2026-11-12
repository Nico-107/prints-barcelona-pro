/**
 * B4 — Upload entry point tests (ui-overhaul branch)
 *
 * Verifies that every upload entry point:
 *  1. Opens the native file chooser (filechooser event)
 *  2. Fires exactly one upload_entry_click with the correct source
 *
 * Also verifies:
 *  3. V2 forced variant (?xp=home_v2:B) renders the split-image hero
 *  4. Page-level drag-and-drop fires source=page_drop
 */

import { test, expect } from "./_fixtures";

// Shared helper: install a window-level spy on analytics._dispatch via the
// __analyticsCapture test hook added to analytics.ts
async function spyOnCapture(page: import("@playwright/test").Page) {
  const captured: { event: string; source?: string }[] = [];

  // Expose a function so the page can call back into Node
  await page.exposeFunction("__analyticsNotify", (event: string, props: Record<string, unknown>) => {
    captured.push({ event, source: props?.source as string | undefined });
  });

  // Patch window.__analyticsCapture before any app JS runs
  await page.addInitScript(() => {
    (window as any).__analyticsCapture = (event: string, props: Record<string, unknown>) => {
      (window as any).__analyticsNotify?.(event, props);
    };
  });

  return () => captured;
}

// Wait for V2 experiment to activate (HTML data attribute set by experiment engine)
async function waitForV2(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-xp-home-v2") === "B",
    { timeout: 8000 },
  );
}

// ── Entry point: hero CTA (V1 centered hero) ──────────────────────────────────

test("V1 hero CTA opens file chooser with source=hero", async ({ page }) => {
  const getCaptures = await spyOnCapture(page);
  await page.goto("/");

  // The centered hero primary button text is "Ver mi precio — desde 10 €"
  const heroBtn = page.locator(".xp-home-v1-only button").filter({ hasText: /Ver mi precio|precio/i }).first();
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 6000 }),
    heroBtn.click(),
  ]);

  expect(fileChooser).toBeTruthy();
  await page.waitForTimeout(400);

  const captures = getCaptures();
  const heroUploads = captures.filter((c) => c.event === "upload_entry_click" && c.source === "hero");
  expect(heroUploads.length).toBe(1);
});

// ── Entry point: hero CTA (V2 split-image hero) ───────────────────────────────

test("V2 hero CTA opens file chooser with source=hero", async ({ page }) => {
  const getCaptures = await spyOnCapture(page);
  await page.goto("/?xp=home_v2:B");
  await waitForV2(page);

  // V2 button text is "Subir archivo y ver precio"
  const heroBtn = page.locator(".xp-home-v2-only button").filter({ hasText: /Subir archivo/i }).first();
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 6000 }),
    heroBtn.click(),
  ]);

  expect(fileChooser).toBeTruthy();
  await page.waitForTimeout(400);

  const captures = getCaptures();
  const heroUploads = captures.filter((c) => c.event === "upload_entry_click" && c.source === "hero");
  expect(heroUploads.length).toBe(1);
});

// ── Entry point: header upload button (desktop) ───────────────────────────────

test("header CTA opens file chooser with source=header", async ({ page }) => {
  const getCaptures = await spyOnCapture(page);
  await page.goto("/");

  // Header desktop CTA: amber button with "Precio al instante" or "Precios desde 10 €"
  // Both are inside a <span data-xp-slot="header_btn_r2">; find the parent button
  const headerBtn = page.locator("header button", { hasText: /Precio/i }).first();
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 6000 }),
    headerBtn.click(),
  ]);

  expect(fileChooser).toBeTruthy();
  await page.waitForTimeout(400);

  const captures = getCaptures();
  const headerUploads = captures.filter((c) => c.event === "upload_entry_click" && c.source === "header");
  expect(headerUploads.length).toBe(1);
});

// ── Entry point: step card CTA (V1 "how it works" section) ───────────────────

test("step card CTA opens file chooser with source=step_card", async ({ page }) => {
  const getCaptures = await spyOnCapture(page);
  await page.goto("/");

  // Step card 1 CTA: "Seleccionar archivo →"
  const stepCardBtn = page.locator("button", { hasText: /Seleccionar archivo/i }).first();
  await stepCardBtn.scrollIntoViewIfNeeded();

  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 6000 }),
    stepCardBtn.click(),
  ]);

  expect(fileChooser).toBeTruthy();
  await page.waitForTimeout(400);

  const captures = getCaptures();
  const stepCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "step_card");
  // Exactly one event: confirms no duplicate firing from old handleScrollToCalc
  expect(stepCaptures.length).toBe(1);
  // And no spurious hero events fired alongside it
  const heroCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "hero");
  expect(heroCaptures.length).toBe(0);
});

// ── Entry point: final image band CTA ────────────────────────────────────────

test("final image band CTA opens file chooser with source=final_band", async ({ page }) => {
  const getCaptures = await spyOnCapture(page);
  await page.goto("/");

  // ImageBand CTA: same text as hero "Ver mi precio — desde 10 €"
  // It's near the bottom of the page; scroll to it first
  // The ImageBand is in the V1-visible section; use its section wrapper
  const imageBandBtn = page.locator("button", { hasText: /Ver mi precio/i }).last();
  await imageBandBtn.scrollIntoViewIfNeeded();

  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 6000 }),
    imageBandBtn.click(),
  ]);

  expect(fileChooser).toBeTruthy();
  await page.waitForTimeout(400);

  const captures = getCaptures();
  const bandCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "final_band");
  expect(bandCaptures.length).toBe(1);
});

// ── Entry point: path card CTA (V2 only) ─────────────────────────────────────

test("V2 path card CTA opens file chooser with source=path_card", async ({ page }) => {
  const getCaptures = await spyOnCapture(page);
  await page.goto("/?xp=home_v2:B");
  await waitForV2(page);

  // PathCard amber CTA: "Calcular precio →"
  const pathCardBtn = page.locator("button", { hasText: /Calcular precio/i }).first();
  await pathCardBtn.scrollIntoViewIfNeeded();

  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 6000 }),
    pathCardBtn.click(),
  ]);

  expect(fileChooser).toBeTruthy();
  await page.waitForTimeout(400);

  const captures = getCaptures();
  const pathCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "path_card");
  expect(pathCaptures.length).toBe(1);
});

// ── V2 hero appearance ────────────────────────────────────────────────────────

test("?xp=home_v2:B renders split-image hero (V2 visible, V1 hidden)", async ({ page }) => {
  await page.goto("/?xp=home_v2:B");
  await waitForV2(page);

  const v2Section = page.locator(".xp-home-v2-only").first();
  const v1Section = page.locator(".xp-home-v1-only").first();

  await expect(v2Section).toBeVisible();
  await expect(v1Section).toBeHidden();

  // Split-image hero must include an <img> element (the machine photo)
  const splitImg = page.locator(".xp-home-v2-only img").first();
  await expect(splitImg).toBeVisible();
});

// ── Page-level drag and drop fires source=page_drop ──────────────────────────

test("page-level drag and drop fires upload_entry_click source=page_drop", async ({ page }) => {
  const getCaptures = await spyOnCapture(page);
  await page.goto("/");

  // Dispatch a drag sequence on the document
  await page.evaluate(() => {
    const buf = new ArrayBuffer(8);
    const file = new File([buf], "test.stl", { type: "application/octet-stream" });
    const dt = new DataTransfer();
    dt.items.add(file);

    document.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }));
  });
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    const buf = new ArrayBuffer(8);
    const file = new File([buf], "test.stl", { type: "application/octet-stream" });
    const dt = new DataTransfer();
    dt.items.add(file);
    document.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  });

  await page.waitForTimeout(500);
  const captures = getCaptures();
  const dropCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "page_drop");
  // The page-level drop handler fires exactly one upload_entry_click
  expect(dropCaptures.length).toBe(1);
});

// ── Mobile sticky bar CTA (mobile viewport) ───────────────────────────────────

test("mobile sticky bar CTA opens file chooser with source=sticky_bar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const getCaptures = await spyOnCapture(page);
  await page.goto("/");

  // Scroll past the hero to trigger the sticky bar (IntersectionObserver)
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
  await page.waitForTimeout(500);

  // Wait for sticky bar to appear in the DOM (it's conditionally rendered)
  const stickyBarBtn = page.locator("div.fixed.bottom-0 button").first();
  await expect(stickyBarBtn).toBeVisible({ timeout: 4000 });

  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 6000 }),
    stickyBarBtn.click(),
  ]);

  expect(fileChooser).toBeTruthy();
  await page.waitForTimeout(400);

  const captures = getCaptures();
  const stickyCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "sticky_bar");
  expect(stickyCaptures.length).toBe(1);
});
