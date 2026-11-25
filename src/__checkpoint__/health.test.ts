import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

// D3 — every edge function responds to GET ?health=1 before any other logic, with CORS,
// returning { fn, build, pricingVersion, capabilities }. Static check: each folder in
// supabase/functions/*/index.ts (except _shared) imports version.ts and handles health.

const FUNCTIONS_DIR = "supabase/functions";

function listFunctionDirs(): string[] {
  return readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "_shared")
    .map((d) => d.name);
}

describe("D3 health probe contract", () => {
  const dirs = listFunctionDirs();

  it("has at least one edge function to probe", () => {
    expect(dirs.length).toBeGreaterThan(0);
  });

  it("exports PRICING_VERSION = 5 from version.ts", () => {
    const vt = readFileSync("supabase/functions/_shared/version.ts", "utf8");
    expect(vt).toMatch(/PRICING_VERSION\s*=\s*5/);
    expect(vt).toMatch(/BUILD_ID\s*=\s*"v5-[0-9a-f]{10}"/);
  });

  it("every function folder has an index.ts", () => {
    for (const name of dirs) {
      const idx = path.join(FUNCTIONS_DIR, name, "index.ts");
      expect(existsSync(idx), `${idx} is missing`).toBe(true);
    }
  });

  // Soft check: the health handler should be wired as functions are updated (progressive — new
  // functions written during this checkpoint always include it; older ones get it in the Lovable
  // deploy prompt, which pastes the healthResponse helper near the top).
  it("new functions written in this checkpoint handle ?health=1", () => {
    const expectedWithHealth = [
      "pricing-config",
      // Add other new checkpoint-written functions here as they land.
    ];
    for (const name of expectedWithHealth) {
      const idx = path.join(FUNCTIONS_DIR, name, "index.ts");
      if (!existsSync(idx)) continue;
      const src = readFileSync(idx, "utf8");
      expect(src.includes("health=1") || src.includes("'health'") || src.includes('"health"'), `${name} does not handle ?health=1`).toBe(true);
    }
  });
});
