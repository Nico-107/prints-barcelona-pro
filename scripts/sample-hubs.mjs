import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
const HUBS = ["/3d-printing-service", "/de/3d-druck-service", "/nl/3d-printen-laten-maken", "/fr/impression-3d-en-ligne", "/it/stampa-3d-online", "/pt/impressao-3d-online"];
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4176);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const errors = [];
for (const path of HUBS) {
  for (const v of ["A", "B"]) {
    try {
      await page.goto(`http://localhost:4176${path}?xp=site_variant:${v}`, { waitUntil: "domcontentloaded", timeout: 10000 });
      await page.waitForTimeout(250);
      const n = await page.locator('[data-testid="hub-template"]').count();
      if (n < 1) errors.push(`${path} [${v}]: missing hub-template (got ${n})`);
      const ph = await page.locator('[data-testid="page-hero"]').count();
      if (ph < 1) errors.push(`${path} [${v}]: missing page-hero (got ${ph})`);
    } catch (e) { errors.push(`${path} [${v}]: ${e.message}`); }
  }
}
console.log(`6 hubs × 2 variants = ${HUBS.length * 2} checks; ${errors.length} failures:`);
errors.forEach(e => console.log("  ✗ " + e));
await b.close(); srv.close();
