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
  // Checkout redesign — Part G keys
  "calc.mode.simpleHint",
  "calc.mode.advancedHint",
  "calc.use.title",
  "calc.use.decor",
  "calc.use.everyday",
  "calc.use.outdoor",
  "calc.use.car",
  "calc.use.strong",
  "calc.use.flexible",
  "calc.use.unsure",
  "calc.use.why.decor",
  "calc.use.why.everyday",
  "calc.use.why.outdoor",
  "calc.use.why.car",
  "calc.use.why.strong",
  "calc.use.why.flexible",
  "calc.use.why.unsure",
  "calc.use.change",
  "calc.notes.label",
  "calc.notes.placeholder",
  "calc.notes.reviewHint",
  "calc.color.title",
  "calc.color.any",
  "calc.color.describe",
  "calc.quality.title",
  "calc.quality.fast",
  "calc.quality.standard",
  "calc.quality.high",
  "calc.quality.ultra",
  "calc.quality.hint.fast",
  "calc.quality.hint.standard",
  "calc.quality.hint.high",
  "calc.quality.hint.ultra",
  "calc.strength.title",
  "calc.strength.light",
  "calc.strength.standard",
  "calc.strength.strong",
  "calc.strength.maximum",
  "calc.strength.custom",
  "calc.strength.hint.light",
  "calc.strength.hint.standard",
  "calc.strength.hint.strong",
  "calc.strength.hint.maximum",
  "calc.supports.title",
  "calc.supports.auto",
  "calc.supports.none",
  "calc.supports.warning",
  "calc.orient.title",
  "calc.orient.auto",
  "calc.orient.keep",
  "calc.orient.saving",
  "calc.orient.asIs",
  "calc.orient.name.0",
  "calc.orient.name.1",
  "calc.orient.name.side",
  "calc.why.title",
  "calc.why.plastic",
  "calc.why.time",
  "calc.why.supports",
  "calc.why.note",
  "calc.why.minNote",
  "calc.validate.contactTitle",
  "calc.validate.contact",
  "calc.validate.email",
  "calc.validate.phone",
  "calc.validate.fulfillment",
  "calc.checkout.title",
  "calc.checkout.close",
  "calc.checkout.reopen",
  "calc.checkout.parts",
  "calc.checkout.summary",
  "calc.checkout.largeFile",
  "calc.checkout.size",
  "calc.urgency.urgentNextDay",
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
