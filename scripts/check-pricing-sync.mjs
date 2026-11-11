#!/usr/bin/env node
// Engine B (V2 pricing with SETUP_FEE=8) is fully retired.
// This script confirms that PRICING-START / PRICING-END markers are gone
// from both source files so no one accidentally re-introduces Engine B.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pricingTsPath = path.join(__dirname, "../src/lib/pricing.ts");
const fnPath = path.join(__dirname, "../supabase/functions/create-instant-checkout/index.ts");

const pricingTsSrc = readFileSync(pricingTsPath, "utf8");
const fnSrc = readFileSync(fnPath, "utf8");

if (pricingTsSrc.includes("PRICING-START") || pricingTsSrc.includes("SETUP_FEE")) {
  console.error("❌ Engine B markers (PRICING-START / SETUP_FEE) found in pricing.ts — Engine B was retired, do not re-add it");
  process.exit(1);
}
if (fnSrc.includes("const SETUP_FEE") || fnSrc.includes("setupCents = 800")) {
  console.error("❌ Engine B code (SETUP_FEE / setupCents=800) found in create-instant-checkout/index.ts — Engine B was retired");
  process.exit(1);
}

console.log("✅ check-pricing-sync: Engine B confirmed retired from all files");
