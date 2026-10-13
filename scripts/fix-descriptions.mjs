#!/usr/bin/env node
// Shorten metaDescription/META_DESC fields > 160 chars by trimming at last sentence/clause before 160.
import { readFileSync, writeFileSync } from "fs";

const MAX = 160;

function shorten(desc) {
  if (desc.length <= MAX) return desc;
  // Try last sentence break (. followed by space or end)
  let candidate = desc.slice(0, MAX + 1);
  // Find last sentence-ending before MAX+1
  for (const sep of [". ", "! ", "? "]) {
    const idx = candidate.lastIndexOf(sep);
    if (idx > 80) return candidate.slice(0, idx + 1);
  }
  // Fall back to last comma or semicolon
  for (const sep of [", ", "; "]) {
    const idx = candidate.lastIndexOf(sep);
    if (idx > 80) return candidate.slice(0, idx);
  }
  // Trim at last word
  const lastSpace = candidate.lastIndexOf(" ");
  if (lastSpace > 80) return candidate.slice(0, lastSpace);
  return desc.slice(0, MAX);
}

const files = [
  "src/seo/landingPagesEs.ts",
  "src/seo/landingPagesCa.ts",
  "src/seo/landingPages.ts",
  "src/seo/landingPagesDe.ts",
  "src/data/intlContent_de.ts",
  "src/data/intlContent_nl_fr.ts",
  "src/data/intlContent_it_pt.ts",
  "src/data/cityDeliveryPages.ts",
  "src/data/partsPages.ts",
  "src/data/intlPartPages.ts",
];

let totalFixed = 0;

for (const file of files) {
  let content;
  try { content = readFileSync(file, "utf-8"); } catch { continue; }

  const newContent = content.replace(/("metaDescription":\s*"|metaDescription:\s*"|metaDesc:\s*")([^"]+)"/g, (match, prefix, desc) => {
    if (desc.length > MAX) {
      const fixed = shorten(desc);
      totalFixed++;
      console.log(`  ${file}: (${desc.length}) → (${fixed.length})`);
      return `${prefix}${fixed}"`;
    }
    return match;
  });

  if (newContent !== content) {
    writeFileSync(file, newContent, "utf-8");
  }
}

console.log(`\nFixed ${totalFixed} descriptions in TS data files.`);
