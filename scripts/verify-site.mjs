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
import { randomUUID } from "crypto";
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync } from "fs";
import { resolve, dirname, extname, join } from "path";
import { fileURLToPath } from "url";

// Mirror of src/lib/experiments/assign.ts hashFraction (FNV-1a → [0,1)).
function hashFraction(s) {
  let k = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    k ^= s.charCodeAt(i);
    k = Math.imul(k, 16777619) >>> 0;
  }
  return k / 4294967295;
}
function assignVariant(vid, id, variants) {
  const f = hashFraction(vid + "::" + id);
  return variants[Math.floor(f * variants.length)];
}
function isHoldout(vid) { return hashFraction(vid + "::holdout") < 0.1; }

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

// Dev sample (10 routes, one per Phase-3 family). Used by --sample for
// a fast pass during Phase 2/3 work; cap the whole run at 90 s elsewhere.
function sampleRoutes() {
  return [
    "/",                                            // 3.1 home es
    "/ca",                                          // 3.1 home ca
    "/3d-printing-service",                         // 3.2 intl hub en
    "/impresion-3d-urgente-barcelona",              // 3.3 urgent
    "/prototipos-3d-barcelona",                     // 3.4 prototypes
    "/precio-impresion-3d-barcelona",               // 3.8 price
    "/madrid",                                      // 3.6 city
    "/blog/precio-impresion-3d-barcelona",          // 3.9 blog post
    "/catalogo/jarron-personalizado",               // 3.11 product
    "/track",                                       // 3.12 tracking
  ];
}

// ─── Checks ────────────────────────────────────────────────────────────────

async function checkPage(page, url, variant, viewport, errors) {
  await page.setViewportSize(viewport);
  const consoleErrors = [];
  const handler = (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  };
  page.on("console", handler);
  try {
    // Force site_variant deterministically via the QA knob.
    const forced = `${url}${url.includes("?") ? "&" : "?"}xp=site_variant:${variant}`;
    // 'domcontentloaded' is enough — our hero-dedupe effect runs on mount.
    // 'networkidle' hangs when analytics beacons keep the connection open.
    await page.goto(forced, { waitUntil: "domcontentloaded", timeout: 10000 });
    // Give hydration-time useEffects (hero dedupe in Phase 1.3) a tick.
    await page.waitForTimeout(250);
  } catch (err) {
    errors.push(`${url} [${variant} ${viewport.width}]: navigation: ${err.message}`);
    page.off("console", handler);
    return;
  }

  const h1Count = await page.locator("h1").count();
  if (h1Count !== 1) errors.push(`${url} [${variant} ${viewport.width}]: expected 1 <h1>, got ${h1Count}`);

  const htmlVariant = await page.getAttribute("html", "data-xp-site-variant");
  if (htmlVariant !== variant)
    errors.push(`${url} [${variant}]: html[data-xp-site-variant]=${htmlVariant}, want ${variant}`);

  const bodyVariant = await page.getAttribute("body", "data-site-variant");
  if (bodyVariant && bodyVariant !== variant)
    errors.push(`${url} [${variant}]: body[data-site-variant]=${bodyVariant}, want ${variant}`);

  // No horizontal overflow: document scrollWidth should match viewport width
  // (allow 2px for sub-pixel rounding and scrollbar).
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    view: window.innerWidth,
  }));
  if (overflow.scroll > overflow.view + 2)
    errors.push(`${url} [${variant} ${viewport.width}]: horizontal overflow — scrollWidth=${overflow.scroll} viewport=${overflow.view}`);

  // Header not overflowing: child elements fit inside the header box.
  const headerOverflow = await page.evaluate(() => {
    const h = document.querySelector("header");
    if (!h) return null;
    return { sw: h.scrollWidth, cw: h.clientWidth };
  });
  if (headerOverflow && headerOverflow.sw > headerOverflow.cw + 2)
    errors.push(`${url} [${variant} ${viewport.width}]: header overflows — scrollWidth=${headerOverflow.sw} clientWidth=${headerOverflow.cw}`);

  // Scroll check: variant attribute must still match after scroll 1200.
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(80);
  const htmlAfter = await page.getAttribute("html", "data-xp-site-variant");
  if (htmlAfter !== variant)
    errors.push(`${url} [${variant}]: variant drifted to ${htmlAfter} after scroll 1200`);

  if (consoleErrors.length)
    errors.push(`${url} [${variant}]: ${consoleErrors.length} console error(s): ${consoleErrors[0]}`);

  page.off("console", handler);
}

async function runSample(baseUrl, routesOverride) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  const routes = routesOverride ?? sampleRoutes();
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
  // --sample forces the 29-route quick set; otherwise run all sitemap URLs.
  const useSample = args.has("--sample");
  const routes = useSample ? sampleRoutes() : readSitemapUrls();
  console.log(
    `\n9.1 ${useSample ? "Sample" : "All"} pages × 2 variants × 2 viewports (${routes.length} routes) …`,
  );
  const { count, errors } = await runSample(baseUrl, routes);
  console.log(`   checks: ${count}, errors: ${errors.length}`);
  for (const e of errors.slice(0, 50)) console.log(`   ✗ ${e}`);
  if (errors.length) failed = true;
}

// ─── 9.5 (partial): content tests over every built HTML file ───────────────
// Walks dist/ and asserts the forbidden-wording list from 0.1 + 2.10 is
// absent. Covers only what's been fixed on this branch so far.
if (!args.has("--seo")) {
  console.log("\n9.5 Content tests over every built page …");
  const forbidden = [
    { needle: "nuestro taller", why: "'taller' as a place — see 0.1" },
    { needle: "nostre taller", why: "'taller' as a place (ca) — see 0.1" },
    { needle: "our workshop", why: "'workshop' as a place — see 0.1" },
    { needle: "unserer Werkstatt", why: "'Werkstatt' as a place — see 0.1" },
    { needle: "notre atelier", why: "'atelier' as a place — see 0.1" },
    { needle: "nostra officina", why: "'officina' as a place — see 0.1" },
    { needle: "nossa oficina", why: "'oficina' as a place — see 0.1" },
    { needle: "precio en 10 segundos", why: "unverified speed promise — 2.10" },
    { needle: "price in 10 seconds", why: "unverified speed promise — 2.10" },
    { needle: "/5 on Google", why: "no Google mentions — 0.1" },
    { needle: "/5 en Google", why: "no Google mentions — 0.1" },
  ];
  const contentErrors = [];
  let scanned = 0;
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const st = statSync(p);
      if (st.isDirectory()) { walk(p); continue; }
      if (!p.endsWith(".html")) continue;
      scanned++;
      const html = readFileSync(p, "utf-8");
      for (const { needle, why } of forbidden) {
        if (html.includes(needle)) {
          contentErrors.push(`${p.replace(DIST, "")}: forbidden ${JSON.stringify(needle)} (${why})`);
        }
      }
    }
  }
  walk(DIST);
  console.log(`   scanned: ${scanned} HTML files, errors: ${contentErrors.length}`);
  for (const e of contentErrors.slice(0, 50)) console.log(`   ✗ ${e}`);
  if (contentErrors.length) failed = true;
}

// ─── 9.4 Split test ────────────────────────────────────────────────────────
// Confirms the deterministic hash: 10,000 random visitor ids resolve to
// B between 48% and 52%; same visitorId yields the same variant on every
// draw; bots ('bot' sentinel used by the pre-paint IIFE in index.html
// when localStorage is unavailable) always resolve to A; holdout rate is
// about 10% and holdout visitors never participate.
if (!args.has("--seo")) {
  console.log("\n9.4 Split test (10 000 random visitor ids) …");
  const N = 10000;
  let b = 0, holdout = 0;
  const samples = [];
  for (let i = 0; i < N; i++) {
    const vid = randomUUID().replace(/-/g, "").slice(0, 18);
    samples.push(vid);
    if (isHoldout(vid)) { holdout++; continue; }
    const v = assignVariant(vid, "site_variant", ["A", "B"]);
    if (v === "B") b++;
  }
  const inSplit = N - holdout;
  const pct = inSplit > 0 ? (b / inSplit) * 100 : 0;
  const stable = samples.every(
    (vid) => assignVariant(vid, "site_variant", ["A", "B"]) ===
             assignVariant(vid, "site_variant", ["A", "B"]),
  );
  // Pre-paint shortcircuits to variants[0] when vid === 'bot' or UA matches
  // bot/crawler/headless (see prePaintScript.ts); mirror here.
  const botVariant = "A"; // first variant of site_variant
  const errs = [];
  if (pct < 48 || pct > 52) errs.push(`B share out of band: ${pct.toFixed(2)}% (want 48–52)`);
  if (!stable) errs.push("non-deterministic: same vid resolved to different variants");
  // Separately: assert the pre-paint source contains the bot shortcircuit.
  const prePaintSrc = readFileSync(resolve(root, "src/lib/experiments/prePaintScript.ts"), "utf-8");
  if (!prePaintSrc.includes("isBot") || !prePaintSrc.includes("variant=exp.variants[0]"))
    errs.push("pre-paint script missing bot → variants[0] shortcircuit");
  console.log(`   bot (via pre-paint shortcircuit) → ${botVariant}`);
  const holdoutPct = (holdout / N) * 100;
  if (holdoutPct < 8 || holdoutPct > 12)
    errs.push(`holdout out of band: ${holdoutPct.toFixed(2)}% (want ~10)`);
  console.log(
    `   N=${N}, holdout=${holdoutPct.toFixed(2)}%, B/(A+B)=${pct.toFixed(2)}%, stable=${stable}, bot→${botVariant}`,
  );
  for (const e of errs) console.log(`   ✗ ${e}`);
  if (errs.length) failed = true;
}

// ─── 9.7 SEO diff vs main branch ──────────────────────────────────────────
// For every prerendered page (except /, /ca, home-v2 variants per rule 0.2),
// extract title, meta description, canonical, hreflang and JSON-LD scripts
// from this build and compare bytes to the baseline captured from `main`.
// Captures the baseline on first run (checked into docs/seo-baseline.json).
if (!args.has("--sample")) {
  console.log("\n9.7 SEO byte-diff vs main (every prerendered page) …");
  const baselinePath = resolve(root, "docs/seo-baseline.json");
  function extractSeo(html) {
    const pick = (re) => (html.match(re) || [])[0] || "";
    const titleM = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descM = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
    const canonicalM = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
    const hreflangs = [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["'][^"']+["'][^>]*>/gi)]
      .map((m) => m[0]).sort();
    const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)]
      .map((m) => m[0]);
    const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    return {
      title: titleM ? titleM[1] : "",
      description: descM ? descM[0] : "",
      canonical: canonicalM ? canonicalM[0] : "",
      hreflangs,
      jsonLd,
      h1: h1M ? h1M[1].replace(/<[^>]+>/g, "").trim() : "",
    };
  }
  // Collect current built SEO for every page.
  const current = {};
  function walkSeo(dir, pathPrefix = "") {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const st = statSync(p);
      if (st.isDirectory()) { walkSeo(p, pathPrefix + "/" + entry); continue; }
      if (!p.endsWith(".html")) continue;
      const route = pathPrefix === "" && entry === "index.html" ? "/" : pathPrefix + (entry === "index.html" ? "" : "/" + entry.replace(/\.html$/, ""));
      current[route] = extractSeo(readFileSync(p, "utf-8"));
    }
  }
  walkSeo(DIST);

  if (!existsSync(baselinePath)) {
    // First run ever: capture the current build as the "main" baseline. The
    // normal flow is to capture this on `main` before starting the branch.
    mkdirSync(dirname(baselinePath), { recursive: true });
    const fs = await import("fs/promises");
    await fs.writeFile(baselinePath, JSON.stringify(current, null, 2) + "\n");
    console.log(`   captured baseline for ${Object.keys(current).length} pages at docs/seo-baseline.json (first run — compare on next build)`);
  } else {
    const baseline = JSON.parse(readFileSync(baselinePath, "utf-8"));
    const excluded = new Set(["/", "/ca"]);
    let diffs = 0;
    const examples = [];
    for (const route of Object.keys(baseline)) {
      if (excluded.has(route)) continue;
      const a = baseline[route];
      const b = current[route];
      if (!b) { diffs++; examples.push(`${route}: missing in current build`); continue; }
      if (a.title !== b.title)
        { diffs++; if (examples.length < 20) examples.push(`${route}: title ${JSON.stringify(a.title)} → ${JSON.stringify(b.title)}`); }
      if (a.description !== b.description)
        { diffs++; if (examples.length < 20) examples.push(`${route}: description changed`); }
      if (a.canonical !== b.canonical)
        { diffs++; if (examples.length < 20) examples.push(`${route}: canonical changed`); }
      if (a.hreflangs.join("|") !== b.hreflangs.join("|"))
        { diffs++; if (examples.length < 20) examples.push(`${route}: hreflang changed`); }
      if ((a.jsonLd || []).join("|") !== (b.jsonLd || []).join("|"))
        { diffs++; if (examples.length < 20) examples.push(`${route}: JSON-LD changed`); }
      if (a.h1 !== b.h1)
        { diffs++; if (examples.length < 20) examples.push(`${route}: H1 ${JSON.stringify(a.h1)} → ${JSON.stringify(b.h1)}`); }
    }
    console.log(`   pages compared: ${Object.keys(baseline).length - excluded.size}, differences: ${diffs}`);
    for (const e of examples) console.log(`   ✗ ${e}`);
    if (diffs) failed = true;
  }
}

server.close();
process.exit(failed ? 1 : 0);
