#!/usr/bin/env node
// Shipping is EUR 5.90 everywhere. Fails the build if an old price (4,90 / 5 / 6) is written or hard-coded again.
import { readFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = path.join(d, f); const s = statSync(p); if (s.isDirectory()) { if (f !== "node_modules") walk(p, out); } else if (/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f)) out.push(p); } return out; };
const files = [...walk(path.join(root, "src"))];
const RULES = [
  { re: /\b4[,.]90\s*(€|EUR\b|euros?\b)|€\s*4[,.]90\b/i, why: "old shipping price 4,90" },
  { re: /SHIPPING_SURCHARGE\s*=\s*6\b/, why: "old calculator shipping constant (6)" },
  { re: /SHIPPING_FEE_EUROS\s*=\s*5\s*;/, why: "old parts-page shipping constant (5)" },
];
let bad = 0;
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => { for (const r of RULES) if (r.re.test(line)) { console.error(`[check-shipping-price] ${path.relative(root, f)}:${i + 1}  ${r.why}\n    ${line.trim().slice(0, 140)}`); bad++; } });
}
if (bad) { console.error(`[check-shipping-price] FAIL: ${bad} place(s) still use an old shipping price (the price is EUR 5.90, defined once as EST.shippingCents).`); process.exit(1); }
console.log("[check-shipping-price] OK: no old shipping prices found.");
