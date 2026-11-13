import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync, mkdirSync } from "fs";
import { resolve, dirname, extname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css",
  ".js": "application/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".xml": "application/xml",
  ".txt": "text/plain",
};

function serveDist(port) {
  const server = createServer((req, res) => {
    let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
    if (pathname.endsWith("/") && pathname !== "/") pathname = pathname.slice(0, -1);
    const candidates = [
      join(DIST, pathname),
      join(DIST, pathname + ".html"),
      join(DIST, pathname, "index.html"),
    ];
    for (const p of candidates) {
      if (existsSync(p) && statSync(p).isFile()) {
        res.writeHead(200, { "Content-Type": MIME[extname(p)] ?? "application/octet-stream" });
        res.end(readFileSync(p));
        return;
      }
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(readFileSync(join(DIST, "index.html")));
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

const PORT = 4175;
const server = await serveDist(PORT);
const outDir = resolve(root, ".verify/screens");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const url = `http://localhost:${PORT}/impresion-3d-urgente-barcelona?xp=site_variant:B`;
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
await page.waitForTimeout(500);

await page.screenshot({
  path: join(outDir, "urgent-B-scroll-0.png"),
  fullPage: false,
  clip: { x: 0, y: 0, width: 1440, height: 900 },
});

await page.evaluate(() => window.scrollTo(0, 800));
await page.waitForTimeout(400);

await page.screenshot({
  path: join(outDir, "urgent-B-scroll-800.png"),
  fullPage: false,
  clip: { x: 0, y: 0, width: 1440, height: 900 },
});

console.log("Saved:");
console.log("  " + join(outDir, "urgent-B-scroll-0.png"));
console.log("  " + join(outDir, "urgent-B-scroll-800.png"));

await browser.close();
server.close();
