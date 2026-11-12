#!/usr/bin/env node
/**
 * Round 2 screenshot script
 * Fixes from Round 1:
 *  - Correct V2 force param: ?xp=home_v2:B (not ?xp_home_v2=v2)
 *  - Scroll through the page before capture so lazy content and useReveal sections load
 *  - Wait for fonts and images to settle
 *  - Add 1280 and 1920 widths for the homepage
 *  - Output to docs/ui-overhaul-round2-screens/
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:4175';
const OUT = '/Users/mikolajszczelkun/Projects/prints-barcelona-pro/docs/ui-overhaul-round2-screens';
mkdirSync(OUT, { recursive: true });

// 13 standard routes
const ROUTES = [
  { path: '/',                                          name: 'home_v1' },
  { path: '/?xp=home_v2:B',                            name: 'home_v2' },
  { path: '/ca/',                                       name: 'ca' },
  { path: '/3d-printing-barcelona',                     name: '3d_printing_barcelona' },
  { path: '/precio-impresion-3d-barcelona',             name: 'precio_impresion_3d' },
  { path: '/impresion-3d-online',                       name: 'impresion_3d_online' },
  { path: '/3d-printing-madrid',                        name: '3d_printing_madrid' },
  { path: '/impresion-3d-empresas-barcelona',           name: 'impresion_3d_empresas' },
  { path: '/blog',                                      name: 'blog' },
  { path: '/blog/precio-impresion-3d-barcelona',        name: 'blog_precio' },
  { path: '/rueda-cesto-lavavajillas-bosch',            name: 'product_bosch' },
  { path: '/sobre-nosotros',                            name: 'sobre_nosotros' },
  { path: '/error-404',                                 name: 'error_404' },
];

// Standard widths; homepage also gets 1280 and 1920
const STD_WIDTHS = [390, 768, 1440];
const HOME_EXTRA_WIDTHS = [1280, 1920];

async function shoot(page, filePath) {
  // Scroll through the full page to trigger lazy loads and useReveal
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 600;
  for (let y = 0; y < pageHeight; y += step) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(80);
  }
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  // Wait for animations and images to settle
  await page.waitForTimeout(600);
  await page.screenshot({ path: filePath, fullPage: true });
}

const browser = await chromium.launch();

for (const route of ROUTES) {
  const widths = [...STD_WIDTHS];
  if (route.name === 'home_v1' || route.name === 'home_v2') {
    widths.push(...HOME_EXTRA_WIDTHS);
  }

  for (const w of widths) {
    const h = w <= 390 ? 844 : w <= 768 ? 1024 : 900;
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    // Pre-accept cookies and suppress UI noise
    await page.addInitScript(() => {
      try {
        localStorage.setItem('cookie-consent', 'accepted');
        localStorage.setItem('cookie-consent-date', new Date().toISOString());
        localStorage.setItem('dim3d-lang-suggest-dismissed', JSON.stringify({es:true,ca:true,en:true,de:true,fr:true,nl:true,it:true,pt:true}));
        localStorage.setItem('dim3d-vid', 'playwright-r2');
      } catch(e) {}
    });
    try {
      await page.goto(BASE + route.path, { waitUntil: 'networkidle', timeout: 30000 });
    } catch(e) {
      await page.goto(BASE + route.path, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }
    const file = `${OUT}/${route.name}_${w}.png`;
    await shoot(page, file);
    await ctx.close();
    process.stdout.write(`  ✓ ${route.name} @${w}\n`);
  }
}

await browser.close();
console.log(`\nRound 2 screenshots saved to ${OUT}/`);
