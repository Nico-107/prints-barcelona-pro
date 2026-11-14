#!/usr/bin/env node
/**
 * fix-polish §4.6 — contact sheet: screenshot one page per family in both
 * variants at 1440×800 and 390×844, then produce
 * docs/fix-polish-contact-sheet.html.
 *
 * Usage: npm run build && node scripts/fix-polish-contact-sheet.mjs
 */
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname, extname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");
const OUT_DIR = resolve(root, "docs/fix-polish-contact-sheet-screens");
const OUT_HTML = resolve(root, "docs/fix-polish-contact-sheet.html");
mkdirSync(OUT_DIR, { recursive: true });

if (!existsSync(DIST)) { console.error("Missing dist/ — run `npm run build` first."); process.exit(2); }

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };
function serveDist(port) {
  const server = createServer((req, res) => {
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    if (p.endsWith("/") && p !== "/") p = p.slice(0, -1);
    for (const f of [join(DIST, p), join(DIST, p + ".html"), join(DIST, p, "index.html")]) {
      if (existsSync(f) && statSync(f).isFile()) {
        res.writeHead(200, { "Content-Type": MIME[extname(f)] ?? "application/octet-stream" });
        res.end(readFileSync(f));
        return;
      }
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(readFileSync(join(DIST, "index.html")));
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

const FAMILIES = [
  { key: "home",           route: "/" },
  { key: "hub",            route: "/3d-printing-service" },
  { key: "city-es",        route: "/madrid" },
  { key: "city-intl",      route: "/3d-printing-delivery-paris" },
  { key: "service",        route: "/impresion-3d-urgente-barcelona" },
  { key: "material",       route: "/impresion-pla-barcelona" },
  { key: "price",          route: "/precio-impresion-3d-barcelona" },
  { key: "business",       route: "/impresion-3d-empresas-barcelona" },
  { key: "catalog",        route: "/catalogo" },
  { key: "product",        route: "/catalogo/placa-nombre" },
  { key: "article",        route: "/blog/precio-impresion-3d-barcelona" },
  { key: "file-checker",   route: "/verificador-archivo-3d" },
  { key: "design-request", route: "/disena-tu-pieza-3d" },
  { key: "about",          route: "/sobre-nosotros" },
  { key: "makers",         route: "/makers" },
  { key: "404",            route: "/this-page-does-not-exist-404" },
];

const PORT = 4173;
const server = await serveDist(PORT);
console.log(`Serving dist/ at http://localhost:${PORT}`);

const browser = await chromium.launch();
const rows = [];
try {
  for (const vp of [{ w: 1440, h: 800, tag: "1440" }, { w: 390, h: 844, tag: "390" }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const fam of FAMILIES) {
      for (const variant of ["A", "B"]) {
        const url = `http://localhost:${PORT}${fam.route}${fam.route.includes("?") ? "&" : "?"}xp=site_variant:${variant}`;
        const file = `${fam.key}-${variant}-${vp.tag}.png`;
        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 12000 });
          await page.waitForTimeout(400);
          await page.screenshot({ path: resolve(OUT_DIR, file), fullPage: false });
          rows.push({ family: fam.key, variant, width: vp.w, file });
          console.log(`  → ${file}`);
        } catch (e) {
          console.log(`  ✗ ${file}: ${e.message}`);
        }
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fix-polish contact sheet</title>
  <style>
    body { font: 13px/1.4 system-ui, sans-serif; background: #0b1120; color: #e8ecf4; margin: 0; padding: 24px; }
    h1 { margin: 0 0 6px; font-size: 20px; }
    h2 { margin: 24px 0 12px; font-size: 15px; letter-spacing: 0.04em; text-transform: uppercase; color: #b8c4da; }
    .fam { margin-bottom: 40px; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(200px, 1fr)); gap: 12px; }
    figure { margin: 0; background: #11182b; border-radius: 8px; overflow: hidden; }
    figure img { width: 100%; height: auto; display: block; background: #fff; }
    figcaption { padding: 6px 8px; font-size: 11px; color: #b8c4da; display: flex; justify-content: space-between; }
    .tag { font-family: ui-monospace, monospace; color: #f5a524; }
    .meta { color: #94a1bb; }
  </style>
</head>
<body>
  <h1>fix-polish contact sheet</h1>
  <p class="meta">One page per family × two variants (A, B) × two viewports (1440, 390). Rendered against <code>dist/</code> on <time>${new Date().toISOString()}</time>.</p>
${FAMILIES.map(fam => `
  <section class="fam">
    <h2>${fam.key} — <span class="tag">${fam.route}</span></h2>
    <div class="grid">
${["A", "B"].flatMap(v => [1440, 390].map(w => {
  const row = rows.find(r => r.family === fam.key && r.variant === v && r.width === w);
  if (!row) return `      <figure><figcaption>${v} · ${w} · missing</figcaption></figure>`;
  return `      <figure><img src="fix-polish-contact-sheet-screens/${row.file}" alt="${fam.key} ${v} ${w}"><figcaption><span>${v} · ${w}</span><span class="tag">${row.file}</span></figcaption></figure>`;
})).join("\n")}
    </div>
  </section>`).join("\n")}
</body>
</html>
`;
writeFileSync(OUT_HTML, html);
console.log(`\nContact sheet → ${OUT_HTML}`);
