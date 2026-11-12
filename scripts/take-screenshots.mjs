#!/usr/bin/env node
import { chromium } from 'playwright';
const BASE = 'http://localhost:4173';
const OUT = '/Users/mikolajszczelkun/Projects/prints-barcelona-pro/docs/ui-overhaul-screens';
const ROUTES = [
  '/',
  '/?xp_home_v2=v2',
  '/ca',
  '/3d-printing-barcelona',
  '/precio-impresion-3d',
  '/impresion-3d-online',
  '/3d-printing-madrid',
  '/impresion-3d-empresas-barcelona',
  '/blog',
  '/blog/precio-impresion-3d-barcelona',
  '/rueda-cesto-lavavajillas-bosch',
  '/sobre-nosotros',
  '/error-404',
];
const WIDTHS = [390, 768, 1440];

const browser = await chromium.launch();
for (const route of ROUTES) {
  for (const w of WIDTHS) {
    const h = w < 500 ? 844 : w < 900 ? 1024 : 900;
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      try {
        localStorage.setItem('cookie-consent', 'accepted');
        localStorage.setItem('cookie-consent-date', new Date().toISOString());
        localStorage.setItem('dim3d-lang-suggest-dismissed', JSON.stringify({es:true,ca:true,en:true,de:true,fr:true,nl:true,it:true,pt:true}));
        localStorage.setItem('dim3d-vid', 'playwright-test');
      } catch(e) {}
    });
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
    } catch(e) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{});
    }
    await page.waitForTimeout(400);
    const slug = route.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/, '') || 'home';
    await page.screenshot({ path: `${OUT}/${slug}_${w}.png`, fullPage: true });
    await ctx.close();
    process.stdout.write(`  ${route} @${w}\n`);
  }
}
await browser.close();
console.log('Screenshots saved to', OUT);
