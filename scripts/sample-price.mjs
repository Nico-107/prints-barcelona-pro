import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
const PATHS = [
  "/precio-impresion-3d-barcelona",
  "/3d-printing-price-barcelona",
  "/ca/preu-impressio-3d-barcelona",
  "/de/3d-druck-kosten",
  "/nl/3d-printen-kosten",
  "/fr/prix-impression-3d",
  "/it/prezzi-stampa-3d",
  "/pt/preco-impressao-3d",
];
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4180);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const errors = [];
for (const path of PATHS) {
  try {
    await page.goto(`http://localhost:4180${path}?xp=site_variant:A`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(250);
    const uc = await page.locator('[data-testid="upload-card"]').count();
    if (uc < 1) errors.push(`${path}: missing upload-card`);
    const ex = await page.locator('[data-testid="engine-examples"] tbody tr').count();
    if (ex < 4) errors.push(`${path}: engine-examples has ${ex} rows`);
    const beforeFirstH2 = await page.evaluate(() => {
      const u = document.querySelector('[data-testid="upload-card"]');
      const h2 = document.querySelector('main h2');
      if (!u || !h2) return false;
      return !!(u.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    if (!beforeFirstH2) errors.push(`${path}: upload-card not before first h2`);
  } catch (e) { errors.push(`${path}: ${e.message}`); }
}
console.log(`Price paths: ${PATHS.length}; failures: ${errors.length}:`);
errors.forEach(e => console.log("  ✗ " + e));
await b.close(); srv.close();
