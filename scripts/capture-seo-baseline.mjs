#!/usr/bin/env node
// Captures SEO baseline from a built dist/ directory.
// Usage: node scripts/capture-seo-baseline.mjs <dist-dir> <output-json>
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname, join } from "path";

const [, , distArg, outArg] = process.argv;
if (!distArg || !outArg) {
  console.error("Usage: capture-seo-baseline.mjs <dist-dir> <output-json>");
  process.exit(2);
}
const DIST = resolve(distArg);
const OUT = resolve(outArg);

function extractSeo(html) {
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

const out = {};
function walk(dir, pathPrefix = "") {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) { walk(p, pathPrefix + "/" + entry); continue; }
    if (!p.endsWith(".html")) continue;
    const route = pathPrefix === "" && entry === "index.html"
      ? "/"
      : pathPrefix + (entry === "index.html" ? "" : "/" + entry.replace(/\.html$/, ""));
    out[route] = extractSeo(readFileSync(p, "utf-8"));
  }
}
walk(DIST);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`Captured ${Object.keys(out).length} pages → ${OUT}`);
