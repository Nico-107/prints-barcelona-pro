#!/usr/bin/env node
// Spawn-wrapper so `node scripts/render-email-previews.mjs` works without
// anyone remembering to prefix tsx. Delegates to the TS implementation.
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const tsEntry = join(repoRoot, "scripts", "render-email-previews.ts");

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["tsx", tsEntry],
  { cwd: repoRoot, stdio: "inherit" }
);
process.exit(result.status ?? 1);
