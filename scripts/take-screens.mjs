import { chromium } from "@playwright/test";
import { mkdirSync, existsSync } from "fs";

const ROUTES = [
  { name: "home-v1", url: "/" },
  { name: "home-v2", url: "/?xp=home_v2:B" },
  { name: "precio", url: "/precio-impresion-3d-barcelona" },
  { name: "b2b", url: "/impresion-3d-empresas-barcelona" },
  { name: "prototipos", url: "/prototipos-3d-barcelona" },
  { name: "express", url: "/impresion-3d-urgente-barcelona" },
  { name: "landing-de", url: "/de/3d-druck-service" },
  { name: "landing-fr", url: "/fr/impression-3d-en-ligne" },
  { name: "hub-it", url: "/it/stampa-3d-online" },
  { name: "city-berlin", url: "/3d-printing-delivery-berlin" },
  { name: "blog-precio", url: "/blog/precio-impresion-3d-barcelona" },
  { name: "about", url: "/sobre-nosotros" },
  { name: "b2b-en", url: "/3d-printing-for-business-barcelona" },
];

const WIDTHS = [390, 768, 1440];
const BASE = "http://localhost:5173";
const OUT = "/Users/mikolajszczelkun/Projects/prints-barcelona-pro/docs/ui-overhaul-round3-screens";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const { name, url } of ROUTES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height: 900 });
    try {
      await page.goto(`${BASE}${url}`, { timeout: 15000 });
      if (url.includes("home_v2")) {
        await page.waitForFunction(
          () => document.documentElement.getAttribute("data-xp-home-v2") === "B",
          { timeout: 8000 }
        ).catch(() => {});
      }
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: true });
      console.log(`✓ ${name} @ ${width}`);
    } catch (e) {
      console.log(`✗ ${name} @ ${width}: ${e.message}`);
    }
    await page.close();
  }
}
await browser.close();
console.log("All done");
