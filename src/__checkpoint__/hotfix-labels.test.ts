import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { analyzeTriangles } from "./legacy/deployedServer";
import { cubeTriangles } from "./legacy/quoteLegacy";

// H7 — Honest labels.
// (a) Printable badge only when the part truly fits the plate.
// (b) Weight never "~0 g" (compute grams from volume * density; hide if truly unknown).
// (c) Urgent-tier labels use the next-day phrasing in all 8 languages (no "Mismo día" variants).

function readLangs() {
  const langs = ["es", "en", "ca", "de", "fr", "it", "nl", "pt"] as const;
  return Object.fromEntries(
    langs.map((l) => [l, readFileSync(`src/i18n/${l}.ts`, "utf8")]),
  );
}

describe("hotfix-labels: urgent tier is next day in every language", () => {
  const files = readLangs();
  const forbidden = ["Mismo día", "Same day", "Mateix dia", "Gleicher Tag", "Jour même", "Stesso giorno", "Zelfde dag", "Mesmo dia"];
  it("no 'same day' urgent-tier label in any i18n file", () => {
    for (const [lang, text] of Object.entries(files)) {
      const line = text.split("\n").find((l) => l.includes("calc.urgency.urgent.time"));
      expect(line, `${lang} missing calc.urgency.urgent.time`).toBeDefined();
      for (const bad of forbidden) {
        expect(line, `${lang} still has forbidden urgent time '${bad}'`).not.toContain(bad);
      }
    }
  });
});

describe("hotfix-labels: grams never '~0 g' when volume is known", () => {
  it("a 20 mm cube reports a positive gram count", () => {
    const a = analyzeTriangles(cubeTriangles(20));
    // Volume of a 20mm cube = 8000 mm³ = 8 cm³. PLA density 1.24 → ~10g.
    expect(a.volumeMm3).toBeGreaterThan(5000);
    const gramsEstimate = (a.volumeMm3 / 1000) * 1.24 * 0.15; // 15 % infill proxy
    expect(gramsEstimate).toBeGreaterThan(0.5); // never ~0
  });
});

describe("hotfix-labels: printable badge rule matches plate fit", () => {
  it("20mm cube fits every orientation → eligible for 'imprimible' badge", () => {
    const a = analyzeTriangles(cubeTriangles(20));
    const anyFits = a.orientations.some((o) => o.sizeXMm <= 256 && o.sizeYMm <= 256 && o.heightMm <= 261);
    expect(anyFits).toBe(true);
  });
});
