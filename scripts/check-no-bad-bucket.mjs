#!/usr/bin/env node
// Customer uploads go to "print-requests". Fails the build if "stl-files" appears in any source file.
import { readFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "dist-ssr", ".temp"]);

const walk = (d, exts, out = []) => {
  for (const f of readdirSync(d)) {
    const p = path.join(d, f);
    const s = statSync(p);
    if (s.isDirectory()) { if (!SKIP_DIRS.has(f)) walk(p, exts, out); }
    else if (exts.some(e => p.endsWith(e))) out.push(p);
  }
  return out;
};

const files = [
  ...walk(path.join(root, "supabase/functions"), [".ts"]),
  ...walk(path.join(root, "src"), [".ts", ".tsx"]),
];

const BAD = "stl-files";
let bad = 0;
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes(BAD)) {
      console.error(`[check-no-bad-bucket] ${path.relative(root, f)}:${i + 1}  ${line.trim().slice(0, 140)}`);
      bad++;
    }
  });
}
if (bad) {
  console.error(`[check-no-bad-bucket] FAIL: ${bad} occurrence(s) of "${BAD}" — all uploads use the "print-requests" bucket.`);
  process.exit(1);
}
console.log(`[check-no-bad-bucket] OK: "${BAD}" not found in any source file.`);
