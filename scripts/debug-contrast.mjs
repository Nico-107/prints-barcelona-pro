import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
function serveDist(port) {
  const server = createServer((req, res) => {
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    if (p.endsWith("/") && p !== "/") p = p.slice(0, -1);
    const candidates = [join(DIST, p), join(DIST, p + ".html"), join(DIST, p, "index.html")];
    const MIME = { ".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon" };
    for (const q of candidates) {
      if (existsSync(q) && statSync(q).isFile()) { res.writeHead(200,{"Content-Type":MIME[extname(q)]||"application/octet-stream"}); res.end(readFileSync(q)); return; }
    }
    res.writeHead(200,{"Content-Type":"text/html"}); res.end(readFileSync(join(DIST,"index.html")));
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}
const srv = await serveDist(4174);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://localhost:4174/madrid?xp=site_variant:B", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
const info = await page.evaluate(() => {
  const h = document.querySelector("header");
  const buttons = Array.from(h.querySelectorAll('button')).map(b => ({
    text: b.textContent.trim(),
    color: getComputedStyle(b).color,
    className: b.className,
  }));
  const langBtn = Array.from(h.querySelectorAll('button')).find(b => b.getAttribute('aria-haspopup') === 'menu');
  const esSpan = langBtn ? Array.from(langBtn.querySelectorAll('span')).find(s => s.textContent.trim() === 'es') : null;
  return {
    buttons: buttons.slice(0, 15),
    esSpanColor: esSpan ? getComputedStyle(esSpan).color : null,
    esSpanOwnText: esSpan ? Array.from(esSpan.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim() : null,
    langBtnColor: langBtn ? getComputedStyle(langBtn).color : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await b.close(); srv.close();
