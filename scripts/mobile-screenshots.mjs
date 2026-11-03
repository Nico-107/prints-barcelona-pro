// Capture full-page mobile screenshots for conv-24 QA at 390px (iPhone 12/13).
// Usage: node scripts/mobile-screenshots.mjs [baseUrl] [outDir]
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.argv[2] ?? "http://localhost:4173";
const outDir = process.argv[3] ?? "qa/mobile-24";

const ROUTES = [
  { path: "/", name: "home-es-390" },
  { path: "/3d-printing-barcelona", name: "home-en-390" },
  { path: "/disena-tu-pieza-3d", name: "design-request-390" },
  { path: "/ca", name: "home-ca-390" },
];

const DESKTOP_ROUTES = [
  { path: "/", name: "home-es-1440" },
  { path: "/3d-printing-barcelona", name: "home-en-1440" },
];

async function run() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();

  // Mobile — Pixel-5 UA + 390x844
  const mctx = await browser.newContext({
    ...devices["Pixel 5"],
    viewport: { width: 390, height: 844 },
  });
  for (const r of ROUTES) {
    const page = await mctx.newPage();
    await page.goto(baseUrl + r.path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/${r.name}.png`, fullPage: true });
    console.log(`  wrote ${outDir}/${r.name}.png`);
    await page.close();
  }
  await mctx.close();

  // Desktop regression — 1440x900
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const r of DESKTOP_ROUTES) {
    const page = await dctx.newPage();
    await page.goto(baseUrl + r.path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/${r.name}.png`, fullPage: true });
    console.log(`  wrote ${outDir}/${r.name}.png`);
    await page.close();
  }
  await dctx.close();

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
