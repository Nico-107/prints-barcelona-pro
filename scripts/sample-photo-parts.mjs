import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
const PATHS = [
  "/recambios-impresion-3d-barcelona",
  "/replacement-parts-barcelona",
  "/ca/recanvis-impressio-3d-barcelona",
  "/piezas-personalizadas-3d-barcelona",
  "/custom-parts-barcelona",
  "/ca/peces-personalitzades-3d-barcelona",
  "/repuesto-descatalogado",
  "/impresion-3d-estudiantes-barcelona",
];
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4183);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const errors = [];
for (const path of PATHS) {
  try {
    await page.goto(`http://localhost:4183${path}?xp=site_variant:A`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(250);
    if (path === "/impresion-3d-estudiantes-barcelona") {
      const heroCta = await page.evaluate(() => {
        const hero = document.querySelector('[data-testid="page-hero"]');
        return !!(hero && hero.querySelector('a, button'));
      });
      if (!heroCta) errors.push(`${path}: students hero missing primary button`);
    } else {
      const ps = await page.locator('[data-testid="photo-steps"]').count();
      if (ps < 1) errors.push(`${path}: missing photo-steps`);
      const heroPhoto = await page.evaluate(() => {
        const hero = document.querySelector('[data-testid="page-hero"]');
        const t = (hero?.textContent || "").toLowerCase();
        return t.includes("foto") || t.includes("photo");
      });
      if (!heroPhoto) errors.push(`${path}: hero missing photo-path CTA token`);
    }
  } catch (e) { errors.push(`${path}: ${e.message}`); }
}
console.log(`Photo-parts paths: ${PATHS.length}; failures: ${errors.length}:`);
errors.forEach(e => console.log("  ✗ " + e));
await b.close(); srv.close();
