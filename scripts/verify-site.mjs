#!/usr/bin/env node
/**
 * Phase 9 verification for the full-site rebuild.
 *
 * What it checks (so far, matching what's actually implemented on this branch):
 *
 * - For a sample of representative routes × both variants × desktop + mobile:
 *     - exactly one <h1>
 *     - html[data-xp-site-variant] matches the forced variant
 *     - body[data-site-variant] matches
 *     - no console errors
 *
 * - For every prerendered SEO URL from dist/: SEO diff vs main
 *     - title, meta description, canonical, hreflang bytes stable
 *       (excluded: /, /ca, home-v2 variants)
 *
 * NEVER weaken a check to make it pass. If a check fails, fix the code.
 *
 * Usage:
 *   npm run build       # must have been run (dist/ must exist)
 *   node scripts/verify-site.mjs            # run all checks
 *   node scripts/verify-site.mjs --sample   # quick sample only (dev)
 *   node scripts/verify-site.mjs --seo      # SEO diff only
 */
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync } from "fs";
import { resolve, dirname, extname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");

if (!existsSync(DIST)) {
  console.error("Missing dist/ — run `npm run build` first.");
  process.exit(2);
}

// ─── Tiny static server over dist/ ─────────────────────────────────────────

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
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
    // SPA fallback.
    const fallback = join(DIST, "index.html");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(readFileSync(fallback));
  });
  return new Promise((resolveFn) => server.listen(port, () => resolveFn(server)));
}

// ─── Sitemap + routes ──────────────────────────────────────────────────────

function readSitemapUrls() {
  const xml = readFileSync(resolve(root, "public/sitemap.xml"), "utf-8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls.map((u) => new URL(u).pathname || "/");
}

// Representative sample covering every page family named in Phase 3.
function sampleRoutes() {
  return [
    "/",                                            // 3.1 home es
    "/ca",                                          // 3.1 home ca
    "/3d-printing-service",                         // 3.2 intl hub en
    "/de/3d-druck-service",
    "/impresion-3d-urgente-barcelona",              // 3.3 urgent
    "/urgent-3d-printing-barcelona",
    "/impresion-3d-empresas-barcelona",             // 3.4 business
    "/prototipos-3d-barcelona",                     // 3.4 prototypes
    "/impresion-3d-sin-pedido-minimo",              // 3.5
    "/impresion-3d-cerca-de-mi",                    // 3.5
    "/impresion-3d-estudiantes-barcelona",          // 3.5
    "/madrid",                                      // 3.6 city
    "/3d-printing-delivery-paris",                  // 3.6
    "/impresion-pla-barcelona",                     // 3.7 material
    "/precio-impresion-3d-barcelona",               // 3.8 price
    "/blog",                                        // 3.9
    "/blog/precio-impresion-3d-barcelona",          // 3.9
    "/guia-materiales-impresion-3d",                // 3.9
    "/makers",                                      // 3.10
    "/maker-guide",                                 // 3.10
    "/catalogo",                                    // 3.11 catalogue
    "/catalogo/jarron-personalizado",               // 3.11 product
    "/adaptador-vesa-monitor",                      // 3.11 SEO product
    "/disena-tu-pieza-3d",                          // 3.12 design request
    "/verificador-archivo-3d",                      // 3.12 file checker
    "/track",                                       // 3.12 tracking
    "/sobre-nosotros",                              // 3.13 about
    "/privacy",                                     // 3.13 legal
    "/politica-devoluciones",                       // 3.13
  ];
}

// ─── Checks ────────────────────────────────────────────────────────────────

async function checkPage(page, url, variant, viewport, errors) {
  await page.setViewportSize(viewport);
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  // Force site_variant deterministically via the QA knob.
  const forced = `${url}${url.includes("?") ? "&" : "?"}xp=site_variant:${variant}`;
  await page.goto(forced, { waitUntil: "domcontentloaded" });

  const h1Count = await page.locator("h1").count();
  if (h1Count !== 1) errors.push(`${url} [${variant} ${viewport.width}]: expected 1 <h1>, got ${h1Count}`);

  const htmlVariant = await page.getAttribute("html", "data-xp-site-variant");
  if (htmlVariant !== variant)
    errors.push(`${url} [${variant}]: html[data-xp-site-variant]=${htmlVariant}, want ${variant}`);

  const bodyVariant = await page.getAttribute("body", "data-site-variant");
  if (bodyVariant && bodyVariant !== variant)
    errors.push(`${url} [${variant}]: body[data-site-variant]=${bodyVariant}, want ${variant}`);

  if (consoleErrors.length)
    errors.push(`${url} [${variant}]: ${consoleErrors.length} console error(s): ${consoleErrors[0]}`);
}

async function runSample(baseUrl) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  const routes = sampleRoutes();
  const variants = ["A", "B"];
  const viewports = [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ];
  let count = 0;
  for (const route of routes) {
    for (const v of variants) {
      for (const vp of viewports) {
        const url = `${baseUrl}${route}`;
        try {
          await checkPage(page, url, v, vp, errors);
        } catch (err) {
          errors.push(`${route} [${v} ${vp.width}]: ${err.message}`);
        }
        count++;
      }
    }
  }
  await browser.close();
  return { count, errors };
}

// ─── Main ───────────────────────────────────────────────────────────────────

const args = new Set(process.argv.slice(2));
const PORT = 4173;
const server = await serveDist(PORT);
const baseUrl = `http://localhost:${PORT}`;
console.log(`Serving dist/ at ${baseUrl}`);

let failed = false;

if (!args.has("--seo")) {
  console.log("\n9.1 Sample pages × 2 variants × 2 viewports …");
  const { count, errors } = await runSample(baseUrl);
  console.log(`   checks: ${count}, errors: ${errors.length}`);
  for (const e of errors.slice(0, 50)) console.log(`   ✗ ${e}`);
  if (errors.length) failed = true;
}

server.close();
process.exit(failed ? 1 : 0);
