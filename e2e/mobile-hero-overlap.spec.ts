import { devices } from "@playwright/test";
import { test, expect } from "./_fixtures";

// C1: Assert that the V2 split-image hero elements don't overlap each other on
// mobile. At 390×844 the layout must show: eyebrow (hidden on mobile), H1,
// paragraph, primary button — none intersecting.

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

for (const { name, width, height } of [
  { name: "390x844", width: 390, height: 844 },
  { name: "360x780", width: 360, height: 780 },
]) {
  test(`V2 mobile hero no overlap ${name}`, async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      viewport: { width, height },
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      try {
        localStorage.setItem("cookie-consent", "accepted");
        localStorage.setItem("cookie-consent-date", new Date().toISOString());
        localStorage.setItem(
          "dim3d-lang-suggest-dismissed",
          JSON.stringify({ es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true }),
        );
      } catch { /* ignore */ }
    });

    try {
      await page.goto("/?xp=home_v2:B", { waitUntil: "domcontentloaded" });

      // Wait for the pre-paint script to set the V2 attribute on <html>.
      await page.waitForFunction(
        () => document.documentElement.getAttribute("data-xp-home-v2") === "B",
        { timeout: 5000 },
      );

      // Eyebrow must be hidden on mobile (display:none via CSS).
      const eyebrow = page.locator(".ds-hero-split-eyebrow").first();
      if (await eyebrow.count()) {
        const eyebrowVisible = await eyebrow.evaluate((el) => {
          const style = getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden";
        });
        expect(eyebrowVisible, `eyebrow must be hidden on ${name}`).toBe(false);
      }

      // Target the V2 hero's text column specifically.
      const heroText = page.locator(".ds-hero-split-text").first();
      await expect(heroText).toBeVisible({ timeout: 5000 });

      // H1 inside the V2 hero text column.
      const h1 = heroText.locator("h1").first();
      await expect(h1).toBeVisible({ timeout: 5000 });
      const h1Box = await h1.boundingBox();
      expect(h1Box, "H1 must be in the DOM").not.toBeNull();

      // First paragraph inside the V2 hero text column.
      const para = heroText.locator("p").first();
      const paraBox = (await para.count()) ? await para.boundingBox() : null;

      // Primary CTA button (data-hero-cta) inside V2 hero.
      const primaryBtn = heroText.locator("[data-hero-cta]").first();
      await expect(primaryBtn).toBeVisible({ timeout: 5000 });
      const primaryBox = await primaryBtn.boundingBox();
      expect(primaryBox, "primary button must be in the DOM").not.toBeNull();

      // H1 top edge must be below the fixed header bottom edge.
      const headerBottom = await page.evaluate(() => {
        const h = document.querySelector("header");
        return h ? h.getBoundingClientRect().bottom : 56;
      });
      expect(h1Box!.y, `H1 top must be below header on ${name}`).toBeGreaterThanOrEqual(headerBottom);
      // H1 must be fully inside the viewport (not clipped above).
      expect(h1Box!.y, `H1 must be inside viewport on ${name}`).toBeGreaterThanOrEqual(0);

      // Collect visible elements and check for pairwise overlap.
      const elements: Array<{ label: string; box: { x: number; y: number; width: number; height: number } | null }> = [
        { label: "H1", box: h1Box },
        { label: "paragraph", box: paraBox },
        { label: "primary button", box: primaryBox },
      ];

      const visible = elements.filter((e): e is { label: string; box: NonNullable<typeof e.box> } => e.box !== null && e.box.height > 0);

      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const a = visible[i];
          const b = visible[j];
          expect(
            rectsOverlap(a.box, b.box),
            `"${a.label}" overlaps "${b.label}" on ${name}`,
          ).toBe(false);
        }
      }
    } finally {
      await context.close();
    }
  });
}

// C3: Sticky bar must NOT be visible on the first screen, but MUST appear after scrolling 1200px.
// Tested on both V1 (default) and V2 to guard against the hidden-button observer bug.
for (const { label, url } of [
  { label: "V1", url: "/" },
  { label: "V2", url: "/?xp=home_v2:B" },
]) {
  test(`Sticky bar hidden on first screen, visible after 1200px scroll — ${label}`, async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      try {
        localStorage.setItem("cookie-consent", "accepted");
        localStorage.setItem("cookie-consent-date", new Date().toISOString());
        localStorage.setItem(
          "dim3d-lang-suggest-dismissed",
          JSON.stringify({ es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true }),
        );
      } catch { /* ignore */ }
    });
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      // On load: sticky bar attribute must NOT be on body.
      const hasBarOnLoad = await page.evaluate(() => document.body.hasAttribute("data-sticky-bar"));
      expect(hasBarOnLoad, `Sticky bar must not appear on first screen — ${label}`).toBe(false);

      // Scroll past the hero button (exits viewport ~400px) but before the
      // calculator section enters viewport (~1800px for V1, ~2000px for V2).
      // 800px is safely between those two thresholds for both variants.
      await page.evaluate(() => window.scrollTo({ top: 800, behavior: "instant" }));
      await page.waitForFunction(() => document.body.hasAttribute("data-sticky-bar"), { timeout: 4000 });
      const hasBarAfterScroll = await page.evaluate(() => document.body.hasAttribute("data-sticky-bar"));
      expect(hasBarAfterScroll, `Sticky bar must appear after scrolling — ${label}`).toBe(true);
    } finally {
      await context.close();
    }
  });
}
