import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
const PATHS = [
  "/prototipos-3d-barcelona","/prototype-printing-barcelona","/ca/prototips-3d-barcelona",
  "/prototipado-rapido-barcelona","/rapid-prototyping-barcelona","/ca/prototipatge-rapid-barcelona",
  "/piezas-funcionales-barcelona","/functional-parts-barcelona","/ca/peces-funcionals-barcelona",
  "/tiradas-cortas-impresion-3d-barcelona","/short-run-3d-printing-barcelona",
  "/impresion-3d-empresas-barcelona","/3d-printing-for-business-barcelona","/ca/impressio-3d-empreses-barcelona"
];
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4177);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const errors = [];
for (const path of PATHS) {
  try {
    await page.goto(`http://localhost:4177${path}?xp=site_variant:A`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(250);
    const it = await page.locator('[data-testid="iteration-timeline"]').count();
    const mbn = await page.locator('[data-testid="material-by-need"]').count();
    const vpt = await page.locator('[data-testid="volume-price-table"] tbody tr').count();
    if (it < 1) errors.push(`${path}: missing iteration-timeline`);
    if (mbn < 1) errors.push(`${path}: missing material-by-need`);
    if (vpt < 3) errors.push(`${path}: volume-price-table has ${vpt} rows`);
  } catch (e) { errors.push(`${path}: ${e.message}`); }
}
console.log(`B2B paths: ${PATHS.length}; failures: ${errors.length}:`);
errors.forEach(e => console.log("  ✗ " + e));
await b.close(); srv.close();
