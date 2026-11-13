#!/usr/bin/env node
/**
 * Build docs/full-site-contact-sheet.html showing variant A and B
 * side-by-side for one representative URL per page family. Captures
 * fresh PNGs into .verify/screens/ (gitignored).
 */
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from "fs";
import { resolve, extname, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");
const OUT_DIR = resolve(root, ".verify/screens");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const FAMILIES = [
  { family: "home", path: "/" },
  { family: "hub-en", path: "/3d-printing-service" },
  { family: "hub-de", path: "/de/3d-druck-service" },
  { family: "urgent", path: "/impresion-3d-urgente-barcelona" },
  { family: "b2b", path: "/impresion-3d-empresas-barcelona" },
  { family: "proto", path: "/prototipos-3d-barcelona" },
  { family: "replacement-parts", path: "/recambios-impresion-3d-barcelona" },
  { family: "discontinued", path: "/repuesto-descatalogado" },
  { family: "city-madrid", path: "/madrid" },
  { family: "city-berlin", path: "/de/3d-druck-berlin" },
  { family: "material-pla", path: "/impresion-pla-barcelona" },
  { family: "price", path: "/precio-impresion-3d-barcelona" },
  { family: "blog-post", path: "/blog/precio-impresion-3d-barcelona" },
  { family: "blog-index", path: "/blog" },
  { family: "guide", path: "/guia-materiales-impresion-3d" },
  { family: "makers", path: "/makers" },
  { family: "students", path: "/impresion-3d-estudiantes-barcelona" },
  { family: "catalog", path: "/catalogo" },
  { family: "product-catalog", path: "/catalogo/jarron-personalizado" },
  { family: "product-seo", path: "/adaptador-vesa-monitor" },
  { family: "tool-design", path: "/disena-tu-pieza-3d" },
  { family: "tool-track", path: "/track" },
  { family: "about", path: "/sobre-nosotros" },
  { family: "privacy", path: "/privacy" },
  { family: "404", path: "/this-does-not-exist" },
];

const MIME = { ".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon" };
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":MIME[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}

const srv = await serveDist(4190);
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();

const rows = [];
for (const fam of FAMILIES) {
  const row = { ...fam, A: "", B: "" };
  for (const v of ["A", "B"]) {
    const out = resolve(OUT_DIR, `${fam.family}-${v}.png`);
    try {
      await page.goto(`http://localhost:4190${fam.path}?xp=site_variant:${v}`, { waitUntil: "domcontentloaded", timeout: 10000 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: out, fullPage: false });
      row[v] = `/.verify/screens/${fam.family}-${v}.png`;
    } catch (e) { row[v] = ""; }
  }
  rows.push(row);
  console.log(`  ${fam.family} … done`);
}

await b.close(); srv.close();

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Full-site contact sheet — A | B</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background: #0f1419; color: #e8eaed; margin: 0; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 24px; }
  .row { display: grid; grid-template-columns: 180px 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .fam { font-weight: 600; padding: 8px; align-self: start; }
  .path { font-family: 'JetBrains Mono', monospace; font-size: 11px; opacity: 0.6; display: block; margin-top: 4px; }
  img { width: 100%; border: 1px solid #333; border-radius: 6px; display: block; }
  .pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
</style></head>
<body>
<h1>Full-site contact sheet — Variant A (left) vs Variant B (right)</h1>
${rows.map(r => `
  <div class="row">
    <div class="fam">${r.family}<span class="path">${r.path}</span></div>
    <div><img src="${r.A}" alt="${r.family} variant A"/></div>
    <div><img src="${r.B}" alt="${r.family} variant B"/></div>
  </div>
`).join("\n")}
</body></html>`;
mkdirSync(resolve(root, "docs"), { recursive: true });
writeFileSync(resolve(root, "docs/full-site-contact-sheet.html"), html);
console.log(`\nWrote docs/full-site-contact-sheet.html (${rows.length} page families).`);
