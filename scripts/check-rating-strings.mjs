#!/usr/bin/env node
/**
 * Fails the build if any i18n file contains a hand-typed rating number or
 * review count. All rating strings must use {rating} and {count} placeholders
 * filled at render time from GOOGLE_RATING in src/data/rating.ts.
 */

import { readdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const i18nDir = resolve(root, "src/i18n");

// Patterns that indicate a hand-typed rating value in an i18n string.
// These are numbers that WERE the old rating (4.9/4,9) or the old count (22).
const FORBIDDEN_PATTERNS = [
  /\b4\.9\/5\b/,
  /\b4,9\/5\b/,
  /\b22 reviews\b/,
  /\b22 reseñas\b/,
  /\b22 ressenyes\b/,
  /\b22 Bewertungen\b/,
  /\b22 avis\b/,
  /\b22 recensioni\b/,
  /\b22 beoordelingen\b/,
  /\b22 avaliações\b/,
];

let errors = 0;

for (const file of readdirSync(i18nDir)) {
  if (!file.endsWith(".ts")) continue;
  const filePath = resolve(i18nDir, file);
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        console.error(`[check-rating-strings] ${file}:${idx + 1}: hand-typed rating value found: ${line.trim()}`);
        errors++;
      }
    }
  });
}

if (errors > 0) {
  console.error(`\n[check-rating-strings] FAIL: ${errors} forbidden rating string(s) found in i18n files.`);
  console.error("Use {rating} and {count} placeholders — see src/data/rating.ts.");
  process.exit(1);
} else {
  console.log("[check-rating-strings] OK: no hard-coded rating strings found.");
}
