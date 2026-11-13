import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
// Discover all product-like pages from the sitemap.
const xml = readFileSync("public/sitemap.xml", "utf-8");
const ALL = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const PATTERNS = [
  /^\/catalogo\/[a-z0-9-]+$/,
  /^\/adaptador-vesa-monitor$/,
  /^\/embudo-dosificador-cafe-58mm$/,
  /^\/rueda-cesto-lavavajillas-bosch$/,
  /^\/adaptador-manguera-gardena$/,
  /^\/de\/vesa-monitor-adapter$/, /^\/de\/kaffee/, /^\/de\/geschirrspueler/, /^\/de\/gardena-schlauch-adapter/,
  /^\/fr\/.+-adaptateur$/, /^\/fr\/entonnoir-cafe/, /^\/fr\/vesa-adaptateur/, /^\/fr\/.+-vaisselle/, /^\/fr\/.+-gardena/,
  /^\/it\/.+-adattatore$/, /^\/it\/imbuto-caffe/, /^\/it\/vesa-adattatore/, /^\/it\/.+-lavastoviglie/, /^\/it\/.+-gardena/,
  /^\/nl\/vesa-monitor-adapter$/, /^\/nl\/koffie-dosering/, /^\/nl\/vaatwasser/, /^\/nl\/gardena-slang/,
];
const PATHS = ALL.filter(p => PATTERNS.some(re => re.test(p)));
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4182);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const errors = [];
for (const path of PATHS) {
  try {
    await page.goto(`http://localhost:4182${path}?xp=site_variant:A`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(250);
    const pt = await page.locator('[data-testid="product-template"]').count();
    if (pt < 1) errors.push(`${path}: missing product-template`);
  } catch (e) { errors.push(`${path}: ${e.message}`); }
}
console.log(`Product paths: ${PATHS.length}; failures: ${errors.length}:`);
errors.forEach(e => console.log("  ✗ " + e));
await b.close(); srv.close();
