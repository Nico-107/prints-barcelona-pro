import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
await mkdir("qa/mobile-24/viewport", { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const [name, path] of [
  ["desktop-home-es-viewport", "/"],
  ["desktop-home-en-viewport", "/3d-printing-barcelona"],
]) {
  const page = await ctx.newPage();
  await page.goto("http://localhost:4173" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `qa/mobile-24/viewport/${name}.png` });
  console.log("wrote", name);
  await page.close();
}
await browser.close();
