#!/usr/bin/env node
// Checks that every internal href in prerendered HTML resolves to a built page.
// Exits 1 if broken links are found. Prints top 20 offenders.

import { readdir, readFile, access } from "fs/promises";
import { join, dirname } from "path";
import { constants } from "fs";

const DIST = new URL("../dist", import.meta.url).pathname;

// Known redirect sources (old paths that permanently redirect)
const REDIRECT_SOURCES = new Set([
  // Add known redirects here if applicable
]);

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

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolveHref(href) {
  // Strip fragment and query
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || clean === "/") {
    return await exists(join(DIST, "index.html"));
  }
  const withoutTrailing = clean.replace(/\/$/, "");
  // Try exact index.html
  if (await exists(join(DIST, withoutTrailing, "index.html"))) return true;
  // Try as direct file
  if (await exists(join(DIST, withoutTrailing))) return true;
  return false;
}

const hrefRe = /href=["'](\/?[a-zA-Z0-9_\-/.%]+)["']/g;

const broken = []; // { file, href }
const redirectWarnings = []; // { file, href }
const checkedPaths = new Map(); // path -> bool (cache)
let totalLinks = 0;

const files = await collectHtmlFiles(DIST);

for (const file of files) {
  const html = await readFile(file, "utf8");
  const rel = file.replace(DIST, "");
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1];
    // Only check internal absolute paths
    if (!href.startsWith("/")) continue;
    // Skip asset paths
    if (/\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|json|xml|txt)$/i.test(href)) continue;

    totalLinks++;

    if (!checkedPaths.has(href)) {
      checkedPaths.set(href, await resolveHref(href));
    }

    if (!checkedPaths.get(href)) {
      if (REDIRECT_SOURCES.has(href)) {
        redirectWarnings.push({ file: rel, href });
      } else {
        broken.push({ file: rel, href });
      }
    }
  }
}

// Group by href for the "worst offenders" table
const byHref = new Map();
for (const { href, file } of broken) {
  if (!byHref.has(href)) byHref.set(href, []);
  byHref.get(href).push(file);
}
const sorted = [...byHref.entries()].sort((a, b) => b[1].length - a[1].length);

console.log("\ncheck-internal-links results:");
console.log(`${files.length} pages, ${totalLinks} internal links checked`);

if (sorted.length > 0) {
  console.log(`\nTop ${Math.min(20, sorted.length)} broken targets:`);
  for (const [href, pages] of sorted.slice(0, 20)) {
    console.log(`  ${href}  (referenced from ${pages.length} page${pages.length > 1 ? "s" : ""})`);
    for (const p of pages.slice(0, 3)) console.log(`    ${p}`);
    if (pages.length > 3) console.log(`    … and ${pages.length - 3} more`);
  }
} else {
  console.log("0 broken internal links — all good!");
}

if (redirectWarnings.length > 0) {
  console.log(`\n${redirectWarnings.length} links point to known redirect sources (warning only)`);
}

console.log(`\nSummary: ${broken.length} broken link${broken.length !== 1 ? "s" : ""}, ${redirectWarnings.length} redirect warning${redirectWarnings.length !== 1 ? "s" : ""}`);

if (broken.length > 0) process.exit(1);
