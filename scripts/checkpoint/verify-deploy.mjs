#!/usr/bin/env node
// R3 — verify Lovable's deploy. Calls every expected health endpoint and `pricing-config`
// from Nico's Mac, prints a table (expected vs live build; capability list); exits non-zero
// if anything is behind. Expected `BUILD_ID` is read from the local `version.ts`.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://ssdbkzswqpbgpeirackr.supabase.co";

const versionTs = readFileSync(path.join(ROOT, "supabase/functions/_shared/version.ts"), "utf8");
const buildMatch = versionTs.match(/BUILD_ID = "(v5-[0-9a-f]{10})"/);
const expected = buildMatch ? buildMatch[1] : null;

const FUNCTIONS = [
  "pricing-config",
  "create-instant-checkout",
  "stripe-webhook",
  "order-files-zip",
  "admin-sign-urls",
  "admin-stripe-sync",
  "send-order-confirmation",
  "send-price-estimate",
  "send-customer-quote",
  "save-quote",
  "packlink-status-hook",
  "daily-digest",
];

async function probe(name) {
  const url = `${SUPABASE_URL}/functions/v1/${name}?health=1`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return { name, ok: false, status: `HTTP ${r.status}`, build: null };
    const j = await r.json();
    return { name, ok: j.build === expected, status: j.build === expected ? "ok" : "behind", build: j.build, capabilities: j.capabilities ?? [] };
  } catch (e) {
    return { name, ok: false, status: e?.message ?? "unreachable", build: null };
  }
}

const results = await Promise.all(FUNCTIONS.map(probe));
const w = (s, n) => String(s ?? "").padEnd(n);
console.log(w("function", 28) + w("expected", 16) + w("live", 16) + "status");
console.log("-".repeat(70));
for (const r of results) {
  console.log(w(r.name, 28) + w(expected, 16) + w(r.build, 16) + r.status);
}
const behind = results.filter((r) => !r.ok);
if (behind.length) {
  console.error(`\n! ${behind.length} function(s) behind or unreachable.`);
  process.exit(1);
}
console.log("\nAll functions match the expected build.");
process.exit(0);
