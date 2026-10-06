#!/usr/bin/env node
// Pricing sync check — runs in prebuild.
// (a) Compares PRICING blocks from src/lib/pricing.ts and
//     supabase/functions/create-instant-checkout/index.ts after stripping
//     `export ` keywords and normalising whitespace.
// (b) Evaluates both blocks and cross-checks on 5,000 random mixed orders.
// (c) Runs E1–E4 exact checks and legacy single-material parity.
import { readFileSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractBlock(src, filePath) {
  const start = src.indexOf("// PRICING-START");
  const end   = src.indexOf("// PRICING-END");
  if (start === -1 || end === -1) {
    console.error(`PRICING-START / PRICING-END markers not found in ${filePath}`);
    process.exit(1);
  }
  return src.slice(start + "// PRICING-START".length, end).trim();
}

function normalise(block) {
  return block
    .replace(/^export\s+/gm, "")   // strip leading `export ` on any line
    .replace(/\s+/g, " ")
    .trim();
}

let esbuild;
try {
  esbuild = require("esbuild");
} catch {
  const candidates = [
    "esbuild",
    path.join(__dirname, "../node_modules/esbuild"),
    path.join(__dirname, "../node_modules/vite/node_modules/esbuild"),
  ];
  for (const c of candidates) {
    try { esbuild = require(c); break; } catch { /* try next */ }
  }
}
if (!esbuild) { console.error("esbuild not found"); process.exit(1); }

async function evalBlock(rawBlock) {
  const stripped = rawBlock.replace(/^export\s+/gm, "");
  const wrapped = `${stripped}\nmodule.exports = { computeOrder, buildStripeLineItems, MATERIALS, INSTANT_MATERIALS, URGENCY_MULTIPLIER, wallFactor, effectiveFill };`;
  const { code } = await esbuild.transform(wrapped, {
    loader: "ts",
    format: "cjs",
    target: "node18",
  });
  const mod = { exports: {} };
  const fn = new Function("module", "exports", "require", code);
  fn(mod, mod.exports, require);
  return mod.exports;
}

// ─── (a) Text comparison ──────────────────────────────────────────────────────

const pricingTsPath = path.join(__dirname, "../src/lib/pricing.ts");
const fnPath = path.join(__dirname, "../supabase/functions/create-instant-checkout/index.ts");

const pricingTsSrc = readFileSync(pricingTsPath, "utf8");
const fnSrc        = readFileSync(fnPath, "utf8");

const pricingTsBlock = extractBlock(pricingTsSrc, "pricing.ts");
const fnBlock        = extractBlock(fnSrc, "index.ts");

const normTs = normalise(pricingTsBlock);
const normFn = normalise(fnBlock);

if (normTs !== normFn) {
  console.error("❌ PRICING blocks differ (pricing.ts vs create-instant-checkout/index.ts)");
  const a = normTs.split(" ");
  const b = normFn.split(" ");
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      const ctx = (arr, idx) => arr.slice(Math.max(0, idx - 3), idx + 4).join(" ");
      console.error(`  First diff at token ${i}:`);
      console.error(`    pricing.ts : ${JSON.stringify(a[i])} — context: ...${ctx(a, i)}...`);
      console.error(`    index.ts   : ${JSON.stringify(b[i])} — context: ...${ctx(b, i)}...`);
      break;
    }
  }
  process.exit(1);
}
console.log("✅ PRICING blocks match");

// ─── Evaluate both blocks ─────────────────────────────────────────────────────

const server  = await evalBlock(fnBlock);
const pricing = await evalBlock(pricingTsBlock);
const { computeOrder } = server;

// ─── (c) E1–E4 Verification ───────────────────────────────────────────────────

const failures = [];

function check(label, got, expected) {
  if (got !== expected)
    failures.push(`${label}: got ${JSON.stringify(got)} expected ${JSON.stringify(expected)}`);
}

function checkApprox(label, got, expected, tol = 0.001) {
  if (Math.abs(got - expected) > tol)
    failures.push(`${label}: got ${got} expected ${expected} (tol ${tol})`);
}

// E1
const e1 = computeOrder([
  { volumeMm3: 30000, quantity: 2, material: "PETG", infill: 50, wallLoops: 3 },
  { volumeMm3: 15000, quantity: 1, material: "TPU",  infill: 20, wallLoops: 2 },
  { volumeMm3: 40000, quantity: 4, material: "PLA",  infill: 20, wallLoops: 2 },
], "standard");

checkApprox("E1 gramsPerUnit[0]", e1.parts[0].gramsPerUnit, 22.86,   0.01);
checkApprox("E1 gramsPerUnit[1]", e1.parts[1].gramsPerUnit, 5.616,   0.001);
checkApprox("E1 gramsPerUnit[2]", e1.parts[2].gramsPerUnit, 15.4752, 0.001);
check("E1 totalCents",            e1.totalCents,            3429);
check("E1 chargedPrintCents",     e1.chargedPrintCents,     3429);
check("E1 parts[0].costCents",    e1.parts[0].costCents,    1106);
check("E1 parts[1].costCents",    e1.parts[1].costCents,    161);
check("E1 parts[2].costCents",    e1.parts[2].costCents,    1362);
check("E1 setupCents",            e1.setupCents,            800);
check("E1 minAdjCents",           e1.minAdjCents,           0);
check("E1 expressCents",          e1.expressCents,          0);
check("E1 capShaveCents",         e1.capShaveCents,         0);
check("E1 eligible",              e1.eligible,              true);

// E2
const e2 = computeOrder([
  { volumeMm3: 30000, quantity: 2, material: "PETG", infill: 50, wallLoops: 3 },
  { volumeMm3: 15000, quantity: 1, material: "TPU",  infill: 20, wallLoops: 2 },
  { volumeMm3: 40000, quantity: 4, material: "PLA",  infill: 20, wallLoops: 2 },
], "express");

check("E2 totalCents",            e2.totalCents,            4286);
check("E2 chargedPrintCents",     e2.chargedPrintCents,     4286);
check("E2 parts[0].costCents",    e2.parts[0].costCents,    1106);
check("E2 parts[1].costCents",    e2.parts[1].costCents,    161);
check("E2 parts[2].costCents",    e2.parts[2].costCents,    1362);
check("E2 expressCents",          e2.expressCents,          857);
check("E2 capShaveCents",         e2.capShaveCents,         0);

// E3 — minimum price
const e3 = computeOrder([
  { volumeMm3: 3000, quantity: 1, material: "PLA", infill: 15, wallLoops: 2 },
], "standard");

checkApprox("E3 gramsPerUnit[0]", e3.parts[0].gramsPerUnit, 1.0007, 0.001);
check("E3 totalCents",            e3.totalCents,            1000);
check("E3 chargedPrintCents",     e3.chargedPrintCents,     1000);
check("E3 parts[0].costCents",    e3.parts[0].costCents,    22);
check("E3 setupCents",            e3.setupCents,            800);
check("E3 minAdjCents",           e3.minAdjCents,           178);
check("E3 expressCents",          e3.expressCents,          0);
check("E3 capShaveCents",         e3.capShaveCents,         0);

// E4 — cap case
const e4 = computeOrder([
  { volumeMm3: 505200, quantity: 1, material: "PLA", infill: 20, wallLoops: 2 },
], "standard");

checkApprox("E4 gramsPerUnit[0]", e4.parts[0].gramsPerUnit, 195.4518, 0.001);
check("E4 totalCents",            e4.totalCents,            5100);
check("E4 chargedPrintCents",     e4.chargedPrintCents,     5000);
check("E4 capShaveCents",         e4.capShaveCents,         100);
check("E4 parts[0].costCents",    e4.parts[0].costCents,    4200);
check("E4 setupCents",            e4.setupCents,            800);
check("E4 minAdjCents",           e4.minAdjCents,           0);
check("E4 expressCents",          e4.expressCents,          0);

if (failures.length > 0) {
  console.error("❌ E1–E4 FAILED:");
  failures.forEach(f => console.error("  " + f));
  process.exit(1);
}
console.log("✅ E1–E4 pass");

// ─── Legacy parity ────────────────────────────────────────────────────────────

const LEGACY_RATE      = 0.22;
const LEGACY_SETUP     = 8;
const LEGACY_MIN       = 10;
const LEGACY_CAP       = 5000;
const LEGACY_MAX_CENTS = 5250;

const LEGACY_MATERIALS = {
  PLA:  { density: 1.24, multiplier: 1.0 },
  PETG: { density: 1.27, multiplier: 1.1 },
  ABS:  { density: 1.04, multiplier: 1.3 },
  TPU:  { density: 1.20, multiplier: 1.3 },
};
const LEGACY_URGENCY = { standard: 1.0, express: 1.25, urgent: 1.6 };

function legacyWallFactor(w) {
  if (w <= 2) return 0.14;
  if (w === 3) return 0.20;
  if (w === 4) return 0.27;
  return Math.min(0.27 + (w - 4) * 0.07, 0.80);
}
function legacyEffFill(infill, walls) {
  const wf = legacyWallFactor(walls);
  return wf + (infill / 100) * (1 - wf);
}
function legacyRound(x) { return Math.floor(x + 0.5); }

function legacyCompute(pieces, urgency) {
  const um  = LEGACY_URGENCY[urgency] ?? 1.0;
  const mat = LEGACY_MATERIALS[pieces[0].material];
  let sumPartRaw = 0;
  for (const p of pieces) {
    const ef = legacyEffFill(p.infill, p.wallLoops);
    const gpu = (p.volumeMm3 / 1000) * mat.density * ef;
    sumPartRaw += gpu * p.quantity * LEGACY_RATE * mat.multiplier;
  }
  const raw   = LEGACY_SETUP + sumPartRaw;
  const base  = Math.max(raw, LEGACY_MIN);
  const total = base * um;
  const totalCents = legacyRound(total * 100);
  const eligible   = totalCents <= LEGACY_MAX_CENTS;
  const capShave   = (eligible && totalCents > LEGACY_CAP) ? totalCents - LEGACY_CAP : 0;
  return { totalCents, chargedPrintCents: totalCents - capShave };
}

const INSTANT_MATS = ["PLA", "PETG", "ABS", "TPU"];
const INFILLS      = [5, 15, 30, 50, 80];
const URGENCIES    = ["standard", "express", "urgent"];

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

let legacyMismatches = 0;
const legacyFailed = [];

for (let i = 0; i < 5000; i++) {
  const mat    = pick(INSTANT_MATS);
  const urg    = pick(URGENCIES);
  const nParts = Math.ceil(rand(1, 5));
  const pieces = Array.from({ length: nParts }, () => ({
    volumeMm3: Math.round(rand(500, 600000)),
    quantity:  Math.ceil(rand(1, 10)),
    material:  mat,
    infill:    pick(INFILLS),
    wallLoops: Math.ceil(rand(2, 8)),
  }));
  const legacy = legacyCompute(pieces, urg);
  const got    = computeOrder(pieces, urg);
  if (legacy.totalCents !== got.totalCents || legacy.chargedPrintCents !== got.chargedPrintCents) {
    legacyMismatches++;
    if (legacyFailed.length < 3) legacyFailed.push({ pieces, urg, legacy, got });
  }
}

if (legacyMismatches > 0) {
  console.error(`❌ Legacy parity FAILED: ${legacyMismatches}/5000 mismatches`);
  legacyFailed.forEach((f, i) => {
    console.error(`  [${i}] urg=${f.urg} legacy=${JSON.stringify(f.legacy)} got=${JSON.stringify({ totalCents: f.got.totalCents, chargedPrintCents: f.got.chargedPrintCents })}`);
  });
  process.exit(1);
}
console.log("✅ Legacy parity: 5000/5000 match");

// ─── (b) Mixed order cross-check (pricing.ts vs index.ts) ────────────────────

const ALL_MATS = Object.keys(server.MATERIALS);
let crossMismatches = 0;
const crossFailed = [];

for (let i = 0; i < 5000; i++) {
  const urg    = pick(URGENCIES);
  const nParts = Math.ceil(rand(1, 8));
  const pieces = Array.from({ length: nParts }, () => ({
    volumeMm3: Math.round(rand(500, 400000)),
    quantity:  Math.ceil(rand(1, 20)),
    material:  pick(ALL_MATS),
    infill:    pick(INFILLS),
    wallLoops: Math.ceil(rand(2, 8)),
  }));
  const sResult = server.computeOrder(pieces, urg);
  const pResult = pricing.computeOrder(pieces, urg);
  if (sResult.totalCents !== pResult.totalCents || sResult.chargedPrintCents !== pResult.chargedPrintCents) {
    crossMismatches++;
    if (crossFailed.length < 3) crossFailed.push({ pieces, urg, sResult, pResult });
  }
}

if (crossMismatches > 0) {
  console.error(`❌ Cross-check FAILED: ${crossMismatches}/5000 mismatches between pricing.ts and index.ts`);
  crossFailed.forEach((f, i) => {
    console.error(`  [${i}] urg=${f.urg}`);
    console.error(`    server: ${JSON.stringify({ totalCents: f.sResult.totalCents, chargedPrintCents: f.sResult.chargedPrintCents })}`);
    console.error(`    pricingTs: ${JSON.stringify({ totalCents: f.pResult.totalCents, chargedPrintCents: f.pResult.chargedPrintCents })}`);
  });
  process.exit(1);
}
console.log("✅ Cross-check: 5000/5000 match (pricing.ts === index.ts)");

// ─── Mixed order invariant ────────────────────────────────────────────────────

let invariantFailures = 0;
const invFailed = [];

for (let i = 0; i < 5000; i++) {
  const urg    = pick(URGENCIES);
  const nParts = Math.ceil(rand(1, 8));
  const pieces = Array.from({ length: nParts }, () => ({
    volumeMm3: Math.round(rand(500, 400000)),
    quantity:  Math.ceil(rand(1, 20)),
    material:  pick(INSTANT_MATS),
    infill:    pick(INFILLS),
    wallLoops: Math.ceil(rand(2, 8)),
  }));
  const r = computeOrder(pieces, urg);
  const sumLines = r.parts.reduce((s, p) => s + p.costCents, 0) + r.setupCents + r.minAdjCents + r.expressCents;
  const anyNeg = r.parts.some(p => p.costCents < 0) || r.setupCents < 0 || r.minAdjCents < 0 || r.expressCents < 0;
  if (sumLines !== r.chargedPrintCents || anyNeg) {
    invariantFailures++;
    if (invFailed.length < 3) invFailed.push({ pieces, urg, r, sumLines });
  }
}

if (invariantFailures > 0) {
  console.error(`❌ Invariant FAILED: ${invariantFailures}/5000 failures`);
  invFailed.forEach((f, i) => {
    console.error(`  [${i}] urg=${f.urg} chargedPrint=${f.r.chargedPrintCents} sumLines=${f.sumLines}`);
  });
  process.exit(1);
}
console.log("✅ Invariant: 5000/5000 pass");

console.log("✅ check-pricing-sync: all checks passed");
