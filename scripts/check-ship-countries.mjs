#!/usr/bin/env node
// Fails if SHIP_COUNTRIES in the edge function is empty or contains a non-ISO2 code.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHECKOUT_PATH = path.join(__dirname, "../supabase/functions/create-instant-checkout/index.ts");

let src;
try {
  src = readFileSync(CHECKOUT_PATH, "utf8");
} catch {
  console.error("❌ check-ship-countries: could not read create-instant-checkout/index.ts");
  process.exit(1);
}

// Extract the SHIP_COUNTRIES array
const match = src.match(/const SHIP_COUNTRIES\s*=\s*\[([^\]]+)\]/);
if (!match) {
  console.error("❌ check-ship-countries: SHIP_COUNTRIES constant not found in index.ts");
  process.exit(1);
}

const codes = match[1]
  .split(",")
  .map(s => s.trim().replace(/["' ]/g, "").replace(/as\s+const/, "").trim())
  .filter(Boolean);

if (codes.length === 0) {
  console.error("❌ check-ship-countries: SHIP_COUNTRIES is empty");
  process.exit(1);
}

const ISO2_RE = /^[A-Z]{2}$/;
const bad = codes.filter(c => !ISO2_RE.test(c));
if (bad.length > 0) {
  console.error(`❌ check-ship-countries: non-ISO2 codes found: ${bad.join(", ")}`);
  process.exit(1);
}

console.log(`✅ check-ship-countries: ${codes.length} valid ISO2 codes (${codes.join(", ")})`);
