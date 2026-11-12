/**
 * E1 evidence screenshots — round 4.
 * Run once with: npx playwright test e2e/screenshots.spec.ts --project=chromium
 * Outputs to docs/screens/
 */
import { test } from "@playwright/test";
import path from "path";

const OUT = path.resolve("docs/screens");

const INIT_ACCEPTED = `() => {
  try {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    localStorage.setItem("dim3d-lang-suggest-dismissed", JSON.stringify({
      es:true,ca:true,en:true,de:true,fr:true,nl:true,it:true,pt:true
    }));
  } catch {}
}`;

const INIT_PENDING = `() => {
  try {
    localStorage.removeItem("cookie-consent");
    localStorage.setItem("dim3d-lang-suggest-dismissed", JSON.stringify({
      es:true,ca:true,en:true,de:true,fr:true,nl:true,it:true,pt:true
    }));
  } catch {}
}`;

async function shoot(page: Parameters<Parameters<typeof test>[1]>[0]["page"], slug: string, label: string, viewport: {width:number,height:number}, fullPage: boolean) {
  await page.setViewportSize(viewport);
  const filename = `${label}_${viewport.width}x${viewport.height}${fullPage ? "_full" : "_first"}.png`;
  if (fullPage) {
    await page.screenshot({ path: `${OUT}/${filename}`, fullPage: true });
  } else {
    await page.screenshot({ path: `${OUT}/${filename}`, fullPage: false });
  }
}

for (const { slug, name } of [
  { slug: "/", name: "v1-home" },
  { slug: "/?xp=home_v2:B", name: "v2-home" },
  { slug: "/impresion-3d-empresas-barcelona", name: "b2b" },
  { slug: "/precio-impresion-3d", name: "price" },
  { slug: "/rueda-cesto-lavavajillas-bosch", name: "product" },
]) {
  for (const width of [1440, 390]) {
    const height = width === 1440 ? 900 : 844;
    const vp = { width, height };

    test(`${name} ${width}px banner-open`, async ({ page }) => {
      await page.addInitScript(eval(INIT_PENDING));
      await page.goto(slug, { waitUntil: "domcontentloaded" });
      if (name === "v2-home" && width === 390) {
        await page.waitForFunction(
          () => document.documentElement.getAttribute("data-xp-home-v2") === "B",
          { timeout: 5000 },
        ).catch(() => {});
      }
      await page.waitForTimeout(400);
      await shoot(page, slug, `${name}_banner-open`, vp, false);
    });

    test(`${name} ${width}px banner-dismissed`, async ({ page }) => {
      await page.addInitScript(eval(INIT_ACCEPTED));
      await page.goto(slug, { waitUntil: "domcontentloaded" });
      if (name === "v2-home" && width === 390) {
        await page.waitForFunction(
          () => document.documentElement.getAttribute("data-xp-home-v2") === "B",
          { timeout: 5000 },
        ).catch(() => {});
      }
      await page.waitForTimeout(400);
      await shoot(page, slug, `${name}_banner-dismissed`, vp, false);
      await shoot(page, slug, `${name}_banner-dismissed`, vp, true);
    });
  }
}
