#!/usr/bin/env node
/**
 * 8.4 Meta audit: duplicate titles/descriptions, title >60, description >155,
 * missing H1, multiple H1. Scans dist/**⁠/index.html (skips noindex pages).
 *
 * Exit 1 on violations so it can be wired into CI.
 */
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");

function collectHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) out.push(...collectHtml(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

function getTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? decode(m[1].trim()) : null;
}

function getDesc(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? decode(m[1].trim()) : null;
}

function countH1(html) {
  return (html.match(/<h1[\s>]/gi) || []).length;
}

function isNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

const files = collectHtml(DIST).sort();
const titlesSeen = new Map();
const descsSeen = new Map();
let errors = 0;
const rows = [];

for (const file of files) {
  const rel = file.replace(DIST, "");
  if (rel === "/404.html") continue;
  const html = readFileSync(file, "utf8");
  if (isNoindex(html)) continue;

  const title = getTitle(html);
  const desc  = getDesc(html);
  const h1    = countH1(html);
  const v     = [];

  if (!title) {
    v.push("missing <title>");
  } else {
    const len = [...title].length;
    if (len > 60) v.push(`title ${len} chars (>60): "${title}"`);
    if (!title.includes("Dimension3D") && !title.includes("dimension3d"))
      v.push(`title missing "Dimension3D": "${title}"`);
    if (titlesSeen.has(title)) v.push(`duplicate title (same as ${titlesSeen.get(title)})`);
    else titlesSeen.set(title, rel);
  }

  if (!desc) {
    v.push("missing <meta description>");
  } else {
    const len = [...desc].length;
    if (len > 155) v.push(`description ${len} chars (>155)`);
    if (descsSeen.has(desc)) v.push(`duplicate description (same as ${descsSeen.get(desc)})`);
    else descsSeen.set(desc, rel);
  }

  if (h1 === 0) v.push("no <h1>");
  if (h1 > 1)  v.push(`${h1} <h1> tags (should be 1)`);

  if (v.length) { errors++; rows.push({ rel, v }); }
}

if (rows.length) {
  console.error("\n[check-meta] VIOLATIONS:");
  for (const { rel, v } of rows) {
    console.error(`  ${rel}`);
    for (const msg of v) console.error(`    ✗ ${msg}`);
  }
  console.error(`\n[check-meta] FAIL: ${errors} page(s) with issues.`);
  process.exit(1);
} else {
  console.log(`[check-meta] OK: ${titlesSeen.size} indexable pages — titles, descriptions, H1s all valid.`);
}
