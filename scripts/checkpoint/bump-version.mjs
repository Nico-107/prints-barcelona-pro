#!/usr/bin/env node
// Writes `supabase/functions/_shared/version.ts` with a deterministic BUILD_ID (sha256 of
// every file under supabase/functions/ except version.ts). Idempotent: rewrites the file
// only when the new value differs from the current one, so the tree stays clean across
// repeated builds.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROOT_FUNCTIONS = path.join(ROOT, "supabase", "functions");
const VERSION_FILE = path.join(ROOT_FUNCTIONS, "_shared", "version.ts");

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = walk(ROOT_FUNCTIONS)
  .filter((f) => f !== VERSION_FILE)
  .sort();
const h = createHash("sha256");
for (const f of files) {
  h.update(path.relative(ROOT_FUNCTIONS, f).split(path.sep).join("/"));
  h.update("\0");
  h.update(readFileSync(f));
  h.update("\0");
}
const BUILD_ID = "v5-" + h.digest("hex").slice(0, 10);

const current = existsSync(VERSION_FILE) ? readFileSync(VERSION_FILE, "utf8") : "";
const re = /export const BUILD_ID = "v5-[0-9a-f]{10}";/;
if (!re.test(current)) {
  console.error(`! bump-version: BUILD_ID line not found in ${path.relative(ROOT, VERSION_FILE)}`);
  process.exit(1);
}
const next = current.replace(re, `export const BUILD_ID = "${BUILD_ID}";`);
if (next !== current) {
  writeFileSync(VERSION_FILE, next);
  console.log(`bump-version: BUILD_ID → ${BUILD_ID} (${files.length} files hashed)`);
} else {
  console.log(`bump-version: BUILD_ID already ${BUILD_ID}`);
}
