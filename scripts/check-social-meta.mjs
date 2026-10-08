#!/usr/bin/env node
// Validates OG / Twitter meta tags in every prerendered HTML file.
// Exits 1 if any violation is found.

import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

const DIST = new URL("../dist", import.meta.url).pathname;
const REQUIRED_OG = ["og:title", "og:description", "og:url", "og:image"];
const REQUIRED_TWITTER = ["twitter:title", "twitter:description", "twitter:image"];
const STATIC_TWITTER_CARD = true; // twitter:card lives in index.html, appears once on every page

const metaRe = (property) =>
  new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*>`, "gi");

async function collectHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await collectHtmlFiles(full)));
    else if (e.name.endsWith(".html")) files.push(full);
  }
  return files;
}

let errors = 0;
const rows = [];

const files = await collectHtmlFiles(DIST);

for (const file of files.sort()) {
  const html = await readFile(file, "utf8");
  const rel = file.replace(DIST, "");

  // 404.html is noindex; social meta not required
  if (rel === "/404.html") continue;
  const violations = [];

  // Check each required OG tag appears exactly once
  for (const prop of REQUIRED_OG) {
    const matches = html.match(metaRe(prop)) ?? [];
    if (matches.length !== 1)
      violations.push(`${prop}: ${matches.length} (expected 1)`);
  }

  // Check each required twitter tag appears exactly once
  for (const prop of REQUIRED_TWITTER) {
    const matches = html.match(metaRe(prop)) ?? [];
    if (matches.length !== 1)
      violations.push(`${prop}: ${matches.length} (expected 1)`);
  }

  // twitter:card must appear exactly once (from static index.html)
  const twitterCards = html.match(metaRe("twitter:card")) ?? [];
  if (twitterCards.length !== 1)
    violations.push(`twitter:card: ${twitterCards.length} (expected 1)`);

  // og:image must point to the real share image
  if (!html.includes("/og/share-default.png"))
    violations.push("og:image does not reference /og/share-default.png");

  // og:url should match the canonical (both contain the same path)
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  if (canonicalMatch && ogUrlMatch && canonicalMatch[1] !== ogUrlMatch[1])
    violations.push(`og:url (${ogUrlMatch[1]}) ≠ canonical (${canonicalMatch[1]})`);

  // No "Lovable" in head section
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (headMatch && /lovable/i.test(headMatch[1]))
    violations.push("Lovable placeholder found in <head>");

  const status = violations.length === 0 ? "OK" : "FAIL";
  rows.push({ rel, status, violations });
  if (violations.length > 0) errors++;
}

// Summary table
const colWidth = Math.max(...rows.map((r) => r.rel.length), 4);
console.log("\ncheck-social-meta results:");
console.log(`${"PATH".padEnd(colWidth)}  STATUS`);
console.log("-".repeat(colWidth + 8));
for (const { rel, status, violations } of rows) {
  console.log(`${rel.padEnd(colWidth)}  ${status}`);
  for (const v of violations) console.log(`  ${" ".repeat(colWidth)}  ⚠  ${v}`);
}
console.log(`\n${files.length} pages checked — ${errors} with violations`);

if (errors > 0) process.exit(1);
