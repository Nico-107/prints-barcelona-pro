import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
const PATHS = [
  "/blog/pla-vs-petg",
  "/blog/como-imprimir-en-3d-sin-impresora",
  "/blog/imprimir-modelos-makerworld-printables-cults3d",
  "/blog/cuanto-tarda-imprimir-en-3d",
  "/blog/que-se-puede-imprimir-en-3d",
  "/blog/convertir-foto-en-modelo-3d",
  "/blog/piezas-de-recambio-impresas-3d",
];
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4184);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const errors = [];
for (const path of PATHS) {
  try {
    await page.goto(`http://localhost:4184${path}?xp=site_variant:A`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(250);
    const at = await page.locator('[data-testid="article-template"]').count();
    const toc = await page.locator('[data-testid="article-toc"]').count();
    const ic = await page.locator('[data-testid="inline-cta"]').count();
    if (at < 1) errors.push(`${path}: missing article-template`);
    if (toc < 1) errors.push(`${path}: missing article-toc`);
    if (ic < 2) errors.push(`${path}: inline-cta count ${ic}`);
  } catch (e) { errors.push(`${path}: ${e.message}`); }
}
console.log(`Blog paths: ${PATHS.length}; failures: ${errors.length}:`);
errors.forEach(e => console.log("  ✗ " + e));
await b.close(); srv.close();
