import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4196);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://localhost:4196/de/3d-druck-service?xp=site_variant:B", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
const info = await page.evaluate(() => {
  const header = document.querySelector("header");
  const r = header.getBoundingClientRect();
  const probeX = r.width / 2, probeY = r.top + r.height / 2 + 4;
  const stack = document.elementsFromPoint(probeX, probeY).map(el => ({ tag: el.tagName, cls: el.className, bg: getComputedStyle(el).backgroundColor, inHeader: header.contains(el) || el === header }));
  const v2 = document.querySelector('[data-v2-hero]');
  const dim = Array.from(header.querySelectorAll("span, a, button")).find(e => {
    const own = Array.from(e.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent || "").join("").trim();
    return own === "Dimension";
  });
  return {
    headerBg: getComputedStyle(header).backgroundColor,
    headerClass: header.className,
    v2HeroExists: !!v2,
    v2HeroBg: v2 ? getComputedStyle(v2).backgroundColor : null,
    v2HeroRect: v2 ? v2.getBoundingClientRect().toJSON() : null,
    stack,
    dimColor: dim ? getComputedStyle(dim).color : null,
  };
});
console.log(JSON.stringify(info, null, 2).slice(0, 2500));
await b.close(); srv.close();
