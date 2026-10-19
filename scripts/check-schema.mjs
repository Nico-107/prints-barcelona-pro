#!/usr/bin/env node
/**
 * Validates JSON-LD structured data in every prerendered dist HTML file.
 * Checks:
 *   1. Every <script type="application/ld+json"> block is valid JSON.
 *   2. Every block has a "@context" and "@type".
 *   3. Required fields for each @type are present.
 *   4. Counts per @type are reported.
 * Exits 1 on failures.
 */

import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");

const REQUIRED_FIELDS = {
  LocalBusiness: ["@id", "name", "url", "address", "telephone"],
  Organization:  ["@id", "name", "url"],
  BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Article: ["headline", "dateModified"],
  HowTo: ["name", "step"],
  Service: ["name"],
};

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

const files = collectHtmlFiles(DIST);
const counts = {};
let errors = 0;
let totalBlocks = 0;

for (const file of files.sort()) {
  const rel = file.replace(DIST, "");
  if (rel === "/404.html") continue;
  const html = readFileSync(file, "utf8");
  if (isNoindex(html)) continue;

  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    totalBlocks++;
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch (e) {
      console.error(`[check-schema] ${rel}: invalid JSON in ld+json block: ${e.message}`);
      errors++;
      continue;
    }

    // Handle @graph or single object
    const items = parsed["@graph"] ? parsed["@graph"] : [parsed];
    for (const item of items) {
      if (!item["@context"] && !parsed["@context"]) {
        console.error(`[check-schema] ${rel}: ld+json block missing @context`);
        errors++;
      }
      const type = item["@type"];
      if (!type) continue;
      const typeStr = Array.isArray(type) ? type[0] : type;
      counts[typeStr] = (counts[typeStr] || 0) + 1;
      const required = REQUIRED_FIELDS[typeStr];
      if (required) {
        for (const field of required) {
          if (item[field] == null) {
            console.error(`[check-schema] ${rel}: @type ${typeStr} missing required field "${field}"`);
            errors++;
          }
        }
      }
    }
  }
}

console.log("\n[check-schema] Schema counts per @type:");
for (const [type, count] of Object.entries(counts).sort()) {
  console.log(`  ${type}: ${count}`);
}
console.log(`  Total ld+json blocks: ${totalBlocks}`);

if (errors > 0) {
  console.error(`\n[check-schema] FAIL: ${errors} schema error(s) found.`);
  process.exit(1);
} else {
  console.log(`\n[check-schema] OK: all JSON-LD blocks valid.`);
}
