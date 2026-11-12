import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "fs";

const BASE = "http://localhost:5173";
const REF_DIR = "/Users/mikolajszczelkun/Downloads/d3d-design-reference";
const OUT = "/Users/mikolajszczelkun/Projects/prints-barcelona-pro/docs/ui-overhaul-round3-compare";

mkdirSync(`${OUT}/v1`, { recursive: true });
mkdirSync(`${OUT}/v2`, { recursive: true });
mkdirSync(`${OUT}/mobile`, { recursive: true });

const browser = await chromium.launch();

// V1 reference full page
const refPage = await browser.newPage();
await refPage.setViewportSize({ width: 1440, height: 900 });
await refPage.goto(`file://${REF_DIR}/V1-home.html`);
await refPage.waitForTimeout(1000);
writeFileSync(`${OUT}/v1/ref-full.png`, await refPage.screenshot({ fullPage: true }));
await refPage.close();

// V1 built full page
const builtPage = await browser.newPage();
await builtPage.setViewportSize({ width: 1440, height: 900 });
await builtPage.goto(`${BASE}/`);
await builtPage.waitForTimeout(2000);
writeFileSync(`${OUT}/v1/built-full.png`, await builtPage.screenshot({ fullPage: true }));
await builtPage.close();
console.log("V1 done");

// Mobile reference (mobile-hero.html — V2 mobile)
const mobileRefPage = await browser.newPage();
await mobileRefPage.setViewportSize({ width: 390, height: 844 });
await mobileRefPage.goto(`file://${REF_DIR}/mobile-hero.html`);
await mobileRefPage.waitForTimeout(500);
writeFileSync(`${OUT}/mobile/ref-hero.png`, await mobileRefPage.screenshot({ fullPage: false }));
await mobileRefPage.close();

// Mobile built (V2 mobile hero)
const mobileBuiltPage = await browser.newPage();
await mobileBuiltPage.setViewportSize({ width: 390, height: 844 });
await mobileBuiltPage.goto(`${BASE}/?xp=home_v2:B`);
await mobileBuiltPage.waitForFunction(
  () => document.documentElement.getAttribute("data-xp-home-v2") === "B",
  { timeout: 8000 }
).catch(() => {});
await mobileBuiltPage.waitForTimeout(1500);
writeFileSync(`${OUT}/mobile/built-hero.png`, await mobileBuiltPage.screenshot({ fullPage: false }));
await mobileBuiltPage.close();
console.log("Mobile done");

// V2 reference full page
const v2RefPage = await browser.newPage();
await v2RefPage.setViewportSize({ width: 1440, height: 900 });
await v2RefPage.goto(`file://${REF_DIR}/V2-home.html`);
await v2RefPage.waitForTimeout(1000);
writeFileSync(`${OUT}/v2/ref-full.png`, await v2RefPage.screenshot({ fullPage: true }));
await v2RefPage.close();

// V2 built full page
const v2BuiltPage = await browser.newPage();
await v2BuiltPage.setViewportSize({ width: 1440, height: 900 });
await v2BuiltPage.goto(`${BASE}/?xp=home_v2:B`);
await v2BuiltPage.waitForFunction(
  () => document.documentElement.getAttribute("data-xp-home-v2") === "B",
  { timeout: 8000 }
).catch(() => {});
await v2BuiltPage.waitForTimeout(2000);
writeFileSync(`${OUT}/v2/built-full.png`, await v2BuiltPage.screenshot({ fullPage: true }));
await v2BuiltPage.close();
console.log("V2 done");

await browser.close();
console.log("All compare screenshots done");
