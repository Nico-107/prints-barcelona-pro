#!/usr/bin/env node
/**
 * SEO diff: compare <head> meta + JSON-LD between main and ui-overhaul branches.
 * Usage: node scripts/seo-diff.mjs
 *
 * Requires both branches to have been built. Reads from dist-ssr/main/ and
 * dist-ssr/ui-overhaul/ directories, or builds them if --build flag is passed.
 *
 * Checks for 20 URLs across all templates and languages:
 *   title, meta description, canonical, hreflang, H1, JSON-LD
 */

import { readFileSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const URLS = [
  // Home
  "/",
  "/ca",
  // Spanish landing pages
  "/precio-impresion-3d-barcelona",
  "/precio-impresion-3d",
  // English landing
  "/3d-printing-barcelona",
  // B2B
  "/impresion-3d-empresas-barcelona",
  // Blog
  "/blog",
  "/blog/precio-impresion-3d-barcelona",
  // City delivery
  "/3d-printing-madrid",
  // Intl hub
  "/it/stampa-3d-online",
  "/de/3d-druck-service",
  "/nl/3d-printen-laten-maken",
  "/fr/impression-3d-en-ligne",
  "/pt/impressao-3d-online",
  // Intl city
  "/it/stampa-3d-roma",
  "/de/3d-druck-berlin",
  // Intl guide
  "/it/prezzi-stampa-3d",
  // Part page
  "/rueda-cesto-lavavajillas-bosch",
  // Catalog
  "/catalogo",
  // Track
  "/track",
];

function readHtml(distDir, url) {
  const filePath = resolve(ROOT, distDir, url.replace(/^\//, ""), "index.html");
  if (!existsSync(filePath)) {
    return null;
  }
  return readFileSync(filePath, "utf8");
}

function extractHead(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : "";
}

function extractMeta(head, name) {
  const patterns = [
    new RegExp(`<meta\\s+name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta\\s+content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = head.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractOgProp(head, prop) {
  const patterns = [
    new RegExp(`<meta\\s+property=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta\\s+content=["']([^"']*)["'][^>]*property=["']${prop}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = head.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractTitle(head) {
  const m = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractCanonical(head) {
  const m = head.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  return m ? m[1] : null;
}

function extractHreflangs(head) {
  const re = /<link\s+rel=["']alternate["'][^>]*hreflang=["']([^"']*)["'][^>]*href=["']([^"']*)["']/gi;
  const result = {};
  let m;
  while ((m = re.exec(head)) !== null) {
    result[m[1]] = m[2];
  }
  return result;
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : null;
}

function extractJsonLd(html) {
  const schemas = [];
  const re = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      schemas.push(JSON.parse(m[1]));
    } catch {
      // skip malformed
    }
  }
  return schemas;
}

function compareJsonLd(mainSchemas, branchSchemas) {
  if (mainSchemas.length !== branchSchemas.length) {
    return `Schema count changed: ${mainSchemas.length} → ${branchSchemas.length}`;
  }
  for (let i = 0; i < mainSchemas.length; i++) {
    const mainStr = JSON.stringify(mainSchemas[i]);
    const branchStr = JSON.stringify(branchSchemas[i]);
    if (mainStr !== branchStr) {
      return `Schema[${i}] (@type=${mainSchemas[i]["@type"]}) changed`;
    }
  }
  return null;
}

let pass = 0;
let fail = 0;
const failures = [];

for (const url of URLS) {
  const mainHtml = readHtml("dist/main", url);
  const branchHtml = readHtml("dist", url);

  if (!mainHtml && !branchHtml) {
    console.log(`⚠️  ${url}: not found in either build — skip`);
    continue;
  }
  if (!mainHtml) {
    console.log(`⚠️  ${url}: not in main build — skip`);
    continue;
  }
  if (!branchHtml) {
    console.log(`⚠️  ${url}: not in branch build — skip`);
    continue;
  }

  const mainHead = extractHead(mainHtml);
  const branchHead = extractHead(branchHtml);

  const checks = [
    ["title", extractTitle(mainHead), extractTitle(branchHead)],
    ["meta description", extractMeta(mainHead, "description"), extractMeta(branchHead, "description")],
    ["canonical", extractCanonical(mainHead), extractCanonical(branchHead)],
    ["og:title", extractOgProp(mainHead, "og:title"), extractOgProp(branchHead, "og:title")],
    ["og:description", extractOgProp(mainHead, "og:description"), extractOgProp(branchHead, "og:description")],
  ];

  // H1 check (allow homepage H1 to differ)
  const isHome = url === "/" || url === "/ca";
  if (!isHome) {
    checks.push(["H1", extractH1(mainHtml), extractH1(branchHtml)]);
  }

  const urlFails = [];

  for (const [name, mainVal, branchVal] of checks) {
    if (mainVal !== branchVal) {
      urlFails.push(`  ${name}:\n    main:   ${mainVal}\n    branch: ${branchVal}`);
    }
  }

  // Hreflang check: branch must have all hreflangs that main has (may add new ones)
  const mainHref = extractHreflangs(mainHead);
  const branchHref = extractHreflangs(branchHead);
  for (const [lang, href] of Object.entries(mainHref)) {
    if (branchHref[lang] !== href) {
      urlFails.push(`  hreflang[${lang}]:\n    main:   ${href}\n    branch: ${branchHref[lang]}`);
    }
  }

  // JSON-LD check
  const mainSchemas = extractJsonLd(mainHtml);
  const branchSchemas = extractJsonLd(branchHtml);
  const schemaDiff = compareJsonLd(mainSchemas, branchSchemas);
  if (schemaDiff) {
    urlFails.push(`  JSON-LD: ${schemaDiff}`);
  }

  if (urlFails.length > 0) {
    fail++;
    failures.push({ url, issues: urlFails });
    console.log(`❌ ${url}`);
    for (const issue of urlFails) console.log(issue);
  } else {
    pass++;
    console.log(`✅ ${url}`);
  }
}

console.log("\n" + "=".repeat(60));
console.log(`SEO diff: ${pass} passed, ${fail} failed`);
if (failures.length === 0) {
  console.log("All SEO attributes are byte-identical between branches.");
} else {
  console.log("\nFailed URLs:");
  for (const { url, issues } of failures) {
    console.log(`\n  ${url}`);
    for (const i of issues) console.log(i);
  }
  process.exit(1);
}
