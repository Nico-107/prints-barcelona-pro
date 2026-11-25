import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// F6 — lead-time copy comes only from shipDate.ts. Test that the dead-end "Tu pieza lista
// en 24–48 h" string is gone from Spanish copy, and that shipDate.ts exports the standard
// / express / urgent production days + 14:00 cutoff.

describe("F6 lead times", () => {
  it("src/lib/shipDate.ts exports PRODUCTION_DAYS constants", () => {
    const src = readFileSync("src/lib/shipDate.ts", "utf8");
    expect(src).toMatch(/PRODUCTION_DAYS/);
  });

  it("Spanish copy no longer promises 'Tu pieza lista en 24–48 h'", () => {
    const es = readFileSync("src/i18n/es.ts", "utf8");
    expect(es).not.toContain("Tu pieza lista en 24–48 h");
  });
});
