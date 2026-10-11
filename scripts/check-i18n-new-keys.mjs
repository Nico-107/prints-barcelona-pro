#!/usr/bin/env node
// Checks that all 8 i18n files contain every key present in en.ts.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Extract all keys from en.ts as the source of truth.
const enSrc = readFileSync(path.join(__dirname, "../src/i18n/en.ts"), "utf8");
const REQUIRED_KEYS = [...enSrc.matchAll(/"([^"]+)":/g)].map((m) => m[1]).filter(
  (k, i, arr) => arr.indexOf(k) === i // dedupe
);

const LANGUAGES = ["es", "en", "ca", "de", "fr", "it", "nl", "pt"];

const failures = [];

for (const lang of LANGUAGES) {
  const filePath = path.join(__dirname, `../src/i18n/${lang}.ts`);
  let src;
  try {
    src = readFileSync(filePath, "utf8");
  } catch {
    failures.push(`${lang}.ts: file not found`);
    continue;
  }
  for (const key of REQUIRED_KEYS) {
    if (!src.includes(`"${key}"`)) {
      failures.push(`${lang}.ts: missing key "${key}"`);
    }
  }
}

if (failures.length > 0) {
  console.error("❌ check-i18n-new-keys FAILED:");
  failures.forEach(f => console.error("  " + f));
  process.exit(1);
}

console.log(`✅ check-i18n-new-keys: all ${REQUIRED_KEYS.length} keys present in all ${LANGUAGES.length} languages`);
