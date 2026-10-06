#!/usr/bin/env node
// Checks that all 8 i18n files contain every Part F key.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_KEYS = [
  "calc.parts.title",
  "calc.parts.customize",
  "calc.parts.done",
  "calc.parts.customized",
  "calc.parts.applyAll",
  "calc.parts.reset",
  "calc.parts.defaultsTitle",
  "calc.parts.qty",
  "calc.parts.remove",
  "calc.summary.setup",
  "calc.summary.minAdjust",
  "calc.summary.express",
  "calc.summary.shipping",
  "calc.summary.total",
  "calc.fulfillment.pickupAddress",
  "calc.fulfillment.free",
  "calc.fulfillment.byAppointment",
  "calc.instantBuy.reviewHint",
  "calc.mixed.note",
  "calc.error.checkout",
];

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
