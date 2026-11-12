// Mobile smoke-check against production for conv-24.
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
await mkdir("qa/mobile-24/prod", { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 5"], viewport: { width: 390, height: 844 } });

for (const [name, url] of [
  ["prod-qr", "https://dimension3dprints.com/?utm_source=business_card&utm_medium=qr&utm_campaign=scewc2026"],
  ["prod-plain", "https://dimension3dprints.com/"],
  ["prod-ca", "https://dimension3dprints.com/ca"],
  ["prod-it", "https://dimension3dprints.com/it/stampa-3d-online"],
]) {
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `qa/mobile-24/prod/${name}.png` });

  const measurements = await page.evaluate(() => {
    const header = document.querySelector("header");
    const h1 = document.querySelector("h1");
    const wa = document.querySelector('a[data-whatsapp-float="true"]');
    const docW = document.documentElement.scrollWidth;
    const clientW = document.documentElement.clientWidth;
    return {
      overflowX: docW - clientW,
      headerH: header?.getBoundingClientRect().height,
      h1FontSize: h1 ? parseFloat(getComputedStyle(h1).fontSize) : null,
      waW: wa?.getBoundingClientRect().width,
      waH: wa?.getBoundingClientRect().height,
    };
  });

  // Verify no exit popup on QR within 10s
  await page.waitForTimeout(10000);
  const popup = await page.locator('[role="dialog"]', { hasText: /salida|exit|sortida/i }).count();
  console.log(name, JSON.stringify(measurements), "popup=", popup);

  await page.close();
}
await browser.close();
