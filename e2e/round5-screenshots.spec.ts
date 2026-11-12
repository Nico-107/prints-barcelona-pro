/**
 * Round 5 verification screenshots.
 * Run with: npx playwright test e2e/round5-screenshots.spec.ts --project=chromium
 * Outputs to docs/ui-overhaul-round5-screens/
 *
 * Key fix vs round 4: banner-open shots scroll the page and wait for the
 * [role="dialog"] consent element before capturing, so the banner is
 * actually visible in the screenshot.
 */
import { test } from "@playwright/test";
import path from "path";
import { mkdirSync } from "fs";


const OUT = path.resolve("docs/ui-overhaul-round5-screens");
mkdirSync(OUT, { recursive: true });

const INIT_ACCEPTED = () => {
  try {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    localStorage.setItem("dim3d-lang-suggest-dismissed", JSON.stringify({
      es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true,
    }));
  } catch { /* ignore */ }
};

const INIT_PENDING = () => {
  try {
    localStorage.removeItem("cookie-consent");
    localStorage.removeItem("cookie-consent-date");
    localStorage.setItem("dim3d-lang-suggest-dismissed", JSON.stringify({
      es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true,
    }));
  } catch { /* ignore */ }
};

type Page = Parameters<Parameters<typeof test>[1]>[0]["page"];

async function shoot(page: Page, label: string, viewport: { width: number; height: number }, fullPage: boolean) {
  await page.setViewportSize(viewport);
  const suffix = fullPage ? "_full" : "_first";
  const filename = `${label}_${viewport.width}x${viewport.height}${suffix}.png`;
  await page.screenshot({ path: `${OUT}/${filename}`, fullPage });
}

/** Wait for V2 experiment attribute to be set on <html> */
async function waitV2(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-xp-home-v2") === "B",
    { timeout: 5000 },
  ).catch(() => {});
}

/** Scroll to trigger banner, then wait for it to appear in the DOM */
async function waitForBanner(page: Page) {
  // Scroll down a small amount to trigger the scroll-based banner display
  await page.evaluate(() => window.scrollTo({ top: 100, behavior: "instant" }));
  // Wait up to 6 s for the consent dialog element (slim bar or sheet)
  await page.waitForSelector('[role="dialog"][aria-label]', { timeout: 6000 }).catch(() => {});
  // Small buffer to ensure the banner is fully painted
  await page.waitForTimeout(200);
}

const PAGES = [
  { slug: "/",                                name: "v1-home",     isV2: false },
  { slug: "/?xp=home_v2:B",                   name: "v2-home",     isV2: true  },
  { slug: "/impresion-3d-empresas-barcelona",  name: "b2b",         isV2: false },
  { slug: "/prototipos-para-empresas",         name: "prototyping-es", isV2: false },
  { slug: "/en/prototyping-for-business",      name: "prototyping-en", isV2: false },
  { slug: "/precio-impresion-3d",              name: "price",       isV2: false },
  { slug: "/rueda-cesto-lavavajillas-bosch",   name: "product",     isV2: false },
];

for (const { slug, name, isV2 } of PAGES) {
  for (const width of [1440, 390]) {
    const height = width === 1440 ? 900 : 844;
    const vp = { width, height };

    test(`${name} ${width}px banner-open`, async ({ page }) => {
      await page.addInitScript(INIT_PENDING);
      await page.goto(slug, { waitUntil: "domcontentloaded" });
      if (isV2) await waitV2(page);
      await waitForBanner(page);
      await shoot(page, `${name}_banner-open`, vp, false);
    });

    test(`${name} ${width}px banner-dismissed`, async ({ page }) => {
      await page.addInitScript(INIT_ACCEPTED);
      await page.goto(slug, { waitUntil: "domcontentloaded" });
      if (isV2) await waitV2(page);
      await page.waitForTimeout(400);
      await shoot(page, `${name}_banner-dismissed`, vp, false);
      if (width === 1440) {
        // Full-page only on desktop — mobile full-page tends to be very long
        await shoot(page, `${name}_banner-dismissed`, vp, true);
      }
    });
  }
}
