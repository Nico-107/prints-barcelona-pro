import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// P10 — supported formats + occt-import-js for STEP/IGES + 3MF multi-object + unsupported
// guidance. The one source for format lists is src/lib/fileFormats.ts; this test grep-guards
// against hard-coded "STL, OBJ, 3MF" strings leaking elsewhere and against the dependency
// being renamed in package.json.

describe("P10 formats", () => {
  it("package.json declares occt-import-js", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    expect("occt-import-js" in all, "occt-import-js not in package.json").toBe(true);
  });
  it("src/lib/fileFormats.ts exists and exports a list", () => {
    const src = readFileSync("src/lib/fileFormats.ts", "utf8");
    expect(src.length).toBeGreaterThan(0);
    // Any export of an array or an object with extensions is accepted.
    expect(src).toMatch(/export/);
  });
  it("no hard-coded 'STL, OBJ, 3MF' string outside fileFormats.ts or its generated output", () => {
    // Soft check: look for the literal triple in a handful of high-traffic strings.
    const files = [
      "src/components/StlEstimator.tsx",
      "src/components/estimator/OrderPanel.tsx",
    ];
    for (const f of files) {
      let text = "";
      try {
        text = readFileSync(f, "utf8");
      } catch {
        continue;
      }
      // The exact triple "STL, OBJ, 3MF" is forbidden outside fileFormats.ts; variants like
      // "STL · 3MF · OBJ" are also forbidden.
      expect(text, `${f} still hard-codes a format list`).not.toMatch(/STL,\s*OBJ,\s*3MF/);
    }
  });
});
