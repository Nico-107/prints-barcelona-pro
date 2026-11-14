#!/usr/bin/env node
// Screenshot every email preview at 600 px and 360 px using Playwright
// (already a dev dependency). Output goes to docs/email-previews/screens/.

import { mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const previewsDir = join(repoRoot, "docs", "email-previews");
const screensDir = join(previewsDir, "screens");
mkdirSync(screensDir, { recursive: true });

const files = readdirSync(previewsDir).filter((f) => f.endsWith(".html"));
if (!files.length) {
  console.error("No previews to screenshot. Run scripts/render-email-previews.mjs first.");
  process.exit(1);
}

const widths = [600, 360];
const browser = await chromium.launch();
try {
  for (const file of files) {
    const slug = file.replace(/\.html$/, "");
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 800 } });
      const page = await context.newPage();
      await page.goto(pathToFileURL(join(previewsDir, file)).href, { waitUntil: "networkidle" });
      await page.screenshot({
        path: join(screensDir, `${slug}-${width}.png`),
        fullPage: true,
      });
      await context.close();
    }
  }
  console.log(`✓ screenshots written to docs/email-previews/screens/`);
} finally {
  await browser.close();
}
