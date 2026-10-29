#!/usr/bin/env node
/**
 * 8.1 Cross-language link check.
 * Scans dist/**⁠/index.html and reports internal links that point to a page
 * whose language prefix differs from the source page's language prefix.
 *
 * Language prefixes: /de/ /nl/ /fr/ /it/ /pt/ (root = es/ca)
 * Allow-list: the language-switcher links and intentional "EN version" links
 * are expected cross-language — flag the rest.
 *
 * Exit 1 when violations exceed the allowed count so CI can enforce it.
 */
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");

const LANG_PREFIXES = ["de", "nl", "fr", "it", "pt", "en"];
const ALLOWED_VIOLATIONS = 0; // set higher to temporarily allow known issues

function collectHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) out.push(...collectHtml(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function pageLang(rel) {
  for (const lang of LANG_PREFIXES) {
    if (rel.startsWith(`/${lang}/`) || rel === `/${lang}/index.html`) return lang;
  }
  return "es"; // root pages are Spanish
}

function linkLang(href) {
  for (const lang of LANG_PREFIXES) {
    if (href.startsWith(`/${lang}/`) || href === `/${lang}`) return lang;
  }
  return "es";
}

// href values from hreflang, canonical, language-switcher anchors that are
// legitimately cross-language — skip those
const ALLOW_PATTERNS = [
  /hreflang=/i,
  /rel="alternate"/i,
  /rel="canonical"/i,
  /class="[^"]*lang/i,
  /data-lang/i,
];

const files = collectHtml(DIST).sort();
let violations = 0;
const rows = [];

for (const file of files) {
  const rel = file.replace(DIST, "");
  if (rel === "/404.html") continue;
  const html = readFileSync(file, "utf8");
  if (/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;

  const srcLang = pageLang(rel);

  // Extract all <a href="/..."> links
  const linkRe = /<a\b([^>]*)>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const attrs = m[1];
    const hrefM = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefM) continue;
    const href = hrefM[1];
    if (!href.startsWith("/")) continue; // skip external + relative

    const dstLang = linkLang(href);
    if (dstLang === srcLang) continue; // same language, OK

    // Check allow-list
    const context = html.slice(Math.max(0, m.index - 80), m.index + 200);
    if (ALLOW_PATTERNS.some((re) => re.test(context))) continue;

    violations++;
    rows.push({ from: rel, lang: srcLang, to: href, toLang: dstLang });
  }
}

if (rows.length) {
  console.log("\n[check-link-language] Cross-language links found:");
  for (const r of rows.slice(0, 40)) {
    console.log(`  [${r.lang}] ${r.from} → [${r.toLang}] ${r.to}`);
  }
  if (rows.length > 40) console.log(`  … and ${rows.length - 40} more`);
}

if (violations > ALLOWED_VIOLATIONS) {
  console.error(`\n[check-link-language] FAIL: ${violations} cross-language link(s) (allowed: ${ALLOWED_VIOLATIONS}).`);
  process.exit(1);
} else if (violations === 0) {
  console.log(`[check-link-language] OK: no cross-language internal links found.`);
} else {
  console.log(`[check-link-language] WARN: ${violations} cross-language link(s) (within allowed ${ALLOWED_VIOLATIONS}).`);
}
