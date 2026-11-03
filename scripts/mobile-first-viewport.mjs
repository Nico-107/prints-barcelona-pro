// Capture first-viewport-only (not fullPage) mobile screenshots for conv-24 QA.
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const outDir = "qa/mobile-24/viewport";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices["Pixel 5"],
  viewport: { width: 390, height: 844 },
});
for (const [name, path] of [
  ["home-es-390-viewport", "/"],
  ["home-en-390-viewport", "/3d-printing-barcelona"],
  ["design-request-390-viewport", "/disena-tu-pieza-3d"],
]) {
  const page = await ctx.newPage();
  await page.goto("http://localhost:4173" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/${name}.png` });
  console.log(`  wrote ${outDir}/${name}.png`);
  await page.close();
}

// 360 and 412
for (const w of [360, 412]) {
  const c = await browser.newContext({
    ...devices["Pixel 5"],
    viewport: { width: w, height: 780 },
  });
  const page = await c.newPage();
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/home-${w}-viewport.png` });
  console.log(`  wrote ${outDir}/home-${w}-viewport.png`);
  await c.close();
}

await ctx.close();
await browser.close();
