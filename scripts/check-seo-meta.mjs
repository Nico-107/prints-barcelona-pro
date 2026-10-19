#!/usr/bin/env node
/**
 * SEO meta build check. Fails the build if any indexable dist page has:
 *   - a <title> over 60 characters
 *   - a meta description outside 120–160 characters
 *   - a duplicate <title>
 *   - the string "2025" in the <title>
 *
 * Pages with <meta name="robots" content="noindex..."> are skipped.
 */

import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");

async function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) results.push(...(await collectHtmlFiles(full)));
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : null;
}

function extractDescription(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? decodeEntities(m[1].trim()) : null;
}

function isNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

const files = await collectHtmlFiles(DIST);
const titlesSeen = new Map();
let errors = 0;
const rows = [];

for (const file of files.sort()) {
  const rel = file.replace(DIST, "");
  if (rel === "/404.html") continue;

  const html = readFileSync(file, "utf8");
  if (isNoindex(html)) continue;

  const title = extractTitle(html);
  const desc = extractDescription(html);
  const violations = [];

  if (!title) {
    violations.push("missing <title>");
  } else {
    const len = [...title].length; // Unicode code-point length
    if (len > 60) violations.push(`title too long: ${len} chars — "${title}"`);
    if (title.includes("2025")) violations.push(`title contains "2025": "${title}"`);
    if (titlesSeen.has(title)) violations.push(`duplicate title (same as ${titlesSeen.get(title)})`);
    else titlesSeen.set(title, rel);
  }

  if (!desc) {
    violations.push("missing meta description");
  } else {
    const len = [...desc].length;
    if (len < 120) violations.push(`description too short: ${len} chars`);
    if (len > 160) violations.push(`description too long: ${len} chars`);
  }

  if (violations.length > 0) {
    errors++;
    rows.push({ rel, violations });
  }
}

if (rows.length > 0) {
  console.error("\n[check-seo-meta] FAILURES:");
  for (const { rel, violations } of rows) {
    console.error(`  ${rel}`);
    for (const v of violations) console.error(`    ✗ ${v}`);
  }
}

if (errors > 0) {
  console.error(`\n[check-seo-meta] FAIL: ${errors} page(s) with SEO meta violations.`);
  process.exit(1);
} else {
  const checked = titlesSeen.size;
  console.log(`[check-seo-meta] OK: ${checked} indexable pages checked — title length, description length, no "2025", no duplicate titles.`);
}
