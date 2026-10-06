#!/usr/bin/env node
// Fails the build if the shared blocks differ between the website and the edge function.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FN = "supabase/functions/create-instant-checkout/index.ts";
const PAIRS = [
  { name: "ESTIMATOR", start: "// ESTIMATOR-START", end: "// ESTIMATOR-END", client: "src/lib/estimator/core.ts" },
  { name: "CHECKOUT-V3", start: "// CHECKOUT-V3-START", end: "// CHECKOUT-V3-END", client: "src/lib/checkoutV3.ts" },
];
const block = (text, s, e) => {
  const a = text.indexOf(s), b = text.indexOf(e);
  if (a < 0 || b < 0 || b < a) return null;
  return text.slice(a, b + e.length).split("\n").map(l => l.replace(/\s+$/, ""));
};
let failed = false;
for (const p of PAIRS) {
  const c = block(readFileSync(path.join(root, p.client), "utf8"), p.start, p.end);
  const f = block(readFileSync(path.join(root, FN), "utf8"), p.start, p.end);
  if (!c || !f) { console.error(`[check-estimator-sync] FAIL: ${p.name} markers missing in ${!c ? p.client : FN}`); failed = true; continue; }
  const n = Math.max(c.length, f.length); let bad = -1;
  for (let i = 0; i < n; i++) if (c[i] !== f[i]) { bad = i; break; }
  if (bad >= 0) { console.error(`[check-estimator-sync] FAIL: ${p.name} blocks differ at block line ${bad + 1}\n  website : ${c[bad] ?? "(end)"}\n  function: ${f[bad] ?? "(end)"}`); failed = true; }
  else console.log(`[check-estimator-sync] OK: ${p.name} block identical in website and edge function (${c.length} lines).`);
}
process.exit(failed ? 1 : 0);
