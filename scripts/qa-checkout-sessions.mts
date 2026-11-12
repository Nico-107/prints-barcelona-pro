#!/usr/bin/env npx tsx
/**
 * QA script: upload 3 test STL files to prod storage and create 3 Stripe checkout
 * sessions to verify line items. Outputs the 3 session URLs.
 *
 * Run: npx tsx scripts/qa-checkout-sessions.mts
 */
import { createClient } from "@supabase/supabase-js";
import { priceOrder, analyzeTriangles, estimatePart, type MeshAnalysis } from "../src/lib/estimator/core";
import { boxMesh, toBinaryStl } from "../src/lib/estimator/fixtures";

const SUPABASE_URL = "https://ssdbkzswqpbgpeirackr.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZGJrenN3cXBiZ3BlaXJhY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ5MDcsImV4cCI6MjA4Mzg5MDkwN30.wnTkj265rvtD6tzIqJpZMIoQ6B8G4ImU1qj3jj6FHk4";
const EDGE_URL = `${SUPABASE_URL}/functions/v1/create-instant-checkout`;
const BUCKET = "print-requests";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function uploadStl(name: string, mesh: Float32Array): Promise<string> {
  const buf = toBinaryStl(mesh);
  const path = `qa-test/${Date.now()}-${name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: "model/stl",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${name}: ${error.message}`);
  return path;
}

function ep(analysis: MeshAnalysis, material = "PLA") {
  return estimatePart(analysis, { material, infillPct: 15, wallLoops: 2, quality: "standard", supports: false, orientation: "auto" });
}

function orderTotal(analyses: MeshAnalysis[], material = "PLA") {
  return priceOrder(analyses.map(a => ({ name: "x", quantity: 1, material, estimate: ep(a, material) })), "standard");
}

// ── Scan to pick right box sizes ──────────────────────────────────────────────
const scan: Array<[number, number, number]> = [
  [5, 5, 2],                                              // minimum territory
  [90, 90, 25], [100, 100, 28], [105, 105, 30],           // 30-45€ range
  [115, 115, 33], [120, 120, 36], [125, 125, 38],         // 45-60€ range
  [130, 130, 40], [135, 135, 43], [140, 140, 45],         // 60-75€ range
  [145, 145, 48], [148, 148, 50], [150, 150, 52],         // 75-90€ range
  [152, 152, 53], [154, 154, 54], [155, 155, 55],         // 90-100€ range
];
console.log("Box scan (single PLA part):");
for (const [x, y, z] of scan) {
  const a = analyzeTriangles(boxMesh(x, y, z));
  const o = orderTotal([a]);
  const e = ep(a);
  console.log(`  ${x}×${y}×${z}  →  ${(o.totalCents/100).toFixed(2)}€  (${e.grams.toFixed(0)}g, ${(e.timeSec/3600).toFixed(1)}h, minAdj=${o.minAdjCents})`);
}

// ── Pick meshes ───────────────────────────────────────────────────────────────
// Order 1: two parts — big one + tiny one, together ~67€ (original bug scenario)
//   Target ~65€ part: use 130×130×40 ≈ ? (see scan)
//   Target ~2€ second part: 5×5×2 → minimum kicks in for the ORDER only once combined
// Order 2: tiny alone → hits 10€ minimum
// Order 3: ~90-100€ single part (within €205.90 instant limit)
const PART_A  = boxMesh(130, 130, 40);   // big part for order 1
const PART_B  = boxMesh(5, 5, 2);        // tiny second part for order 1
const TINY    = boxMesh(5, 5, 2);        // alone for order 2 → minimum
const LARGE   = boxMesh(152, 152, 53);   // ~91€ for order 3

const ana_A   = analyzeTriangles(PART_A);
const ana_B   = analyzeTriangles(PART_B);
const ana_T   = analyzeTriangles(TINY);
const ana_L   = analyzeTriangles(LARGE);

const o1preview = orderTotal([ana_A, ana_B]);
const o2preview = orderTotal([ana_T]);
const o3preview = orderTotal([ana_L]);
console.log(`\nSelected meshes:`);
console.log(`  Order 1 (A+B): ${(o1preview.totalCents/100).toFixed(2)}€  parts=[${o1preview.parts.map(p=>(p.costCents/100).toFixed(2)+'€').join(', ')}]  minAdj=${o1preview.minAdjCents}¢`);
console.log(`  Order 2 (tiny): ${(o2preview.totalCents/100).toFixed(2)}€  minAdj=${o2preview.minAdjCents}¢`);
console.log(`  Order 3 (large): ${(o3preview.totalCents/100).toFixed(2)}€  minAdj=${o3preview.minAdjCents}¢`);

console.log("\nUploading STL files…");
const [pathA, pathB, pathT, pathL] = await Promise.all([
  uploadStl("part-a.stl", PART_A),
  uploadStl("part-b.stl", PART_B),
  uploadStl("part-tiny.stl", TINY),
  uploadStl("part-large.stl", LARGE),
]);

async function createSession(label: string, pieces: Array<{ name: string; path: string; material: string; analysis: MeshAnalysis }>, urgency = "standard", fulfillment = "shipping") {
  const partInputs = pieces.map(p => ({ name: p.name, quantity: 1, material: p.material, estimate: ep(p.analysis, p.material) }));
  const order = priceOrder(partInputs, urgency);
  const exactPrice = order.totalCents / 100;

  console.log(`\n[${label}]`);
  console.log(`  local priceOrder → ${order.totalCents}¢ (${exactPrice.toFixed(2)}€), minAdj=${order.minAdjCents}¢`);
  order.parts.forEach((p, i) => {
    const e = partInputs[i].estimate;
    console.log(`  part[${i}] ${p.material} ${p.costCents}¢  (${e.grams.toFixed(1)}g, ${(e.timeSec/3600).toFixed(2)}h)`);
  });

  const body = {
    pricingVersion: 3, urgency, fulfillment, exactPrice,
    pieces: pieces.map(p => ({ name: p.name, path: p.path, material: p.material, infill: 15, wallLoops: 2, quality: "standard", supports: false, orientation: "auto", quantity: 1 })),
  };

  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json() as { checkoutUrl?: string; url?: string; error?: string; autumn_discount_cents?: number };
  const checkoutUrl = json.checkoutUrl ?? json.url;
  if (!res.ok || !checkoutUrl) {
    console.error(`  ❌ ${res.status}: ${JSON.stringify(json)}`);
    return undefined;
  }
  if (json.autumn_discount_cents) console.log(`  autumn_discount=${json.autumn_discount_cents}¢`);
  console.log(`  ✅ ${checkoutUrl}`);
  return checkoutUrl;
}

const urls: string[] = [];

const u1 = await createSession("Order 1 — two PLA parts (big+tiny)", [
  { name: "part-a.stl", path: pathA, material: "PLA", analysis: ana_A },
  { name: "part-b.stl", path: pathB, material: "PLA", analysis: ana_B },
]);
if (u1) urls.push(u1);

const u2 = await createSession("Order 2 — tiny PLA alone (10€ minimum)", [
  { name: "part-tiny.stl", path: pathT, material: "PLA", analysis: ana_T },
]);
if (u2) urls.push(u2);

const u3 = await createSession("Order 3 — large PLA (~91€)", [
  { name: "part-large.stl", path: pathL, material: "PLA", analysis: ana_L },
]);
if (u3) urls.push(u3);

console.log("\n══════════════════════════════════════════");
console.log("STRIPE CHECKOUT URLs:");
urls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
