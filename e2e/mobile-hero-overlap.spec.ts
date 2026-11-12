import { devices } from "@playwright/test";
import { test, expect } from "./_fixtures";

// C1: Assert that the V2 split-image hero elements don't overlap each other on
// mobile. At 390×844 the layout must show: eyebrow (hidden), H1, paragraph,
// primary button, secondary button — none intersecting.

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

      // Eyebrow must be hidden on mobile.
      const eyebrow = page.locator(".ds-hero-split-eyebrow").first();
      if (await eyebrow.count()) {
        const eyebrowVisible = await eyebrow.evaluate((el) => {
          const style = getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden";
        });
        expect(eyebrowVisible, `eyebrow must be hidden on ${name}`).toBe(false);
      }

      // Collect bounding boxes of key hero elements.
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      const h1Box = await h1.boundingBox();
      expect(h1Box, "H1 must be in the DOM").not.toBeNull();

      // First paragraph inside the hero text column.
      const heroSection = page.locator(".ds-hero-split-text").first();
      const para = heroSection.locator("p").first();
      const paraBox = (await para.count()) ? await para.boundingBox() : null;

      // Primary CTA button (data-hero-cta).
      const primaryBtn = page.locator("[data-hero-cta]").first();
      await expect(primaryBtn).toBeVisible();
      const primaryBox = await primaryBtn.boundingBox();
      expect(primaryBox, "primary button must be in the DOM").not.toBeNull();

      // Secondary link/button in the hero (ds-hero-v2-desktop-only is hidden; find the
      // visible secondary CTA if present).
      const secondaryBtn = heroSection.locator("button, a[role='button']").filter({ hasNot: page.locator("[data-hero-cta]") }).first();
      const secondaryBox = (await secondaryBtn.count()) ? await secondaryBtn.boundingBox() : null;

      // Assert no overlaps between visible elements.
      const elements: Array<{ label: string; box: { x: number; y: number; width: number; height: number } | null }> = [
        { label: "H1", box: h1Box },
        { label: "paragraph", box: paraBox },
        { label: "primary button", box: primaryBox },
        { label: "secondary button", box: secondaryBox },
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
