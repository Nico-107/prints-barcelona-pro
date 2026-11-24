#!/usr/bin/env node
// Prompt 3 — shipping is EUR 4.90, defined once in src/config/shipping.ts.
// Fails the build if old hard-coded shipping prices sneak back into the repo.
import { readFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = path.join(d, f); const s = statSync(p); if (s.isDirectory()) { if (f !== "node_modules") walk(p, out); } else if (/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f)) out.push(p); } return out; };
const files = [...walk(path.join(root, "src"))];
// Allow-list: the config file is the single source of truth. The admin
// parser keeps the "Shipping: EUR x.xx" string alive via a derived constant.
const IGNORE = (p) =>
  /src\/config\/shipping\.ts$/.test(p) ||
  /src\/lib\/adminPaymentBreakdown\.ts$/.test(p);
const RULES = [
  { re: /\b5[,.]90\s*€|€\s*5[,.]90\b|\bEUR\s+5[.,]90\b/i, why: "old shipping price 5,90 (now 4,90 via src/config/shipping.ts)" },
  { re: /SHIPPING_SURCHARGE\s*=/, why: "hard-coded SHIPPING_SURCHARGE — route via src/config/shipping.ts" },
  { re: /SHIPPING_FEE_EUROS\s*=\s*5\s*;/, why: "old parts-page shipping constant (5)" },
];
let bad = 0;
for (const f of files) {
  if (IGNORE(f)) continue;
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => { for (const r of RULES) if (r.re.test(line)) { console.error(`[check-shipping-price] ${path.relative(root, f)}:${i + 1}  ${r.why}\n    ${line.trim().slice(0, 140)}`); bad++; } });
}
if (bad) { console.error(`[check-shipping-price] FAIL: ${bad} place(s) still use an old shipping price. Route them through src/config/shipping.ts.`); process.exit(1); }
console.log("[check-shipping-price] OK: shipping prices routed through src/config/shipping.ts.");
