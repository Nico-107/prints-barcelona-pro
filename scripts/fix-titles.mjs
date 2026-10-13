#!/usr/bin/env node
// One-shot script: shorten all metaTitle/META_TITLE/title values > 60 chars.
// Strategy: remove " — {suffix}" after em-dash if result ≤ 60; otherwise trim at last word ≤ 60.
import { readFileSync, writeFileSync } from "fs";

const MAX = 60;

function shorten(title) {
  if (title.length <= MAX) return title;
  // Try removing EM-DASH suffix
  const dashIdx = title.indexOf(" — ");
  if (dashIdx > 0) {
    const base = title.slice(0, dashIdx);
    if (base.length <= MAX) return base;
  }
  // Try removing "| ..." (pipe separator)
  const pipeIdx = title.indexOf(" | ");
  if (pipeIdx > 0) {
    const base = title.slice(0, pipeIdx);
    if (base.length <= MAX) return base;
  }
  // Try removing ": ..." (colon separator)
  const colonIdx = title.indexOf(": ");
  if (colonIdx > 0) {
    const base = title.slice(0, colonIdx);
    if (base.length <= MAX) return base;
  }
  // Trim at last word boundary ≤ MAX
  let trimmed = title.slice(0, MAX + 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > 30) trimmed = trimmed.slice(0, lastSpace);
  else trimmed = title.slice(0, MAX);
  return trimmed;
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

  const newContent = content.replace(/("metaTitle":\s*"|metaTitle:\s*")([^"]+)"/g, (match, prefix, title) => {
    if (title.length > MAX) {
      const fixed = shorten(title);
      totalFixed++;
      console.log(`  ${file}: "${title}" (${title.length}) → "${fixed}" (${fixed.length})`);
      return `${prefix}${fixed}"`;
    }
    return match;
  });

  if (newContent !== content) {
    writeFileSync(file, newContent, "utf-8");
  }
}

console.log(`\nFixed ${totalFixed} titles in TS data files.`);
