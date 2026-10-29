#!/usr/bin/env node
/**
 * Content quality build checks:
 *
 * 1. No raw markdown in <main>: fails if any dist page's <main> contains "**"
 *    (indicates unrendered markdown bold syntax).
 *
 * 2. Organization JSON-LD: fails if "/" or any intl hub page lacks a
 *    <script type="application/ld+json"> block that contains "@type":"Organization".
 *
 * Run automatically as part of `npm run build`.
 */

import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");

const HUB_PATHS = [
  "/index.html",
  "/3d-printing-service/index.html",
  "/de/3d-druck-service/index.html",
  "/nl/3d-printen-laten-maken/index.html",
  "/fr/impression-3d-en-ligne/index.html",
  "/it/stampa-3d-online/index.html",
  "/pt/impressao-3d-online/index.html",
];

function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectHtmlFiles(full));
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

function isNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  return m ? m[1] : "";
}

let errors = 0;
const files = collectHtmlFiles(DIST);

// ── Check 1: No "**" in <main> ────────────────────────────────────────────────
const markdownProblems = [];

for (const file of files.sort()) {
  const rel = file.replace(DIST, "");
  if (rel === "/404.html") continue;
  const html = readFileSync(file, "utf8");
  if (isNoindex(html)) continue;

  const mainContent = extractMain(html);
  if (mainContent.includes("**")) {
    const count = (mainContent.match(/\*\*/g) || []).length;
    markdownProblems.push({ rel, count });
    errors++;
  }
}

if (markdownProblems.length > 0) {
  console.error("\n[check-content] FAIL: unrendered markdown (**) found in <main>:");
  for (const { rel, count } of markdownProblems) {
    console.error(`  ${rel} — ${count} occurrence(s)`);
  }
}

// ── Check 2: Organization JSON-LD on "/" and all hub pages ────────────────────
const orgProblems = [];

for (const hubPath of HUB_PATHS) {
  const file = resolve(DIST, hubPath.slice(1));
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    console.error(`[check-content] WARN: hub file not found: ${hubPath}`);
    continue;
  }

  if (!html.includes('"@type":"Organization"')) {
    orgProblems.push(hubPath);
    errors++;
  }
}

if (orgProblems.length > 0) {
  console.error('\n[check-content] FAIL: missing "@type":"Organization" JSON-LD on:');
  for (const p of orgProblems) console.error(`  ${p}`);
}

if (errors === 0) {
  console.log(`[check-content] OK: no raw markdown in <main>, Organization JSON-LD present on all hubs.`);
  process.exit(0);
} else {
  process.exit(1);
}
