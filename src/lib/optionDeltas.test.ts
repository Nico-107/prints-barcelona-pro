import { describe, it, expect } from "vitest";
import { analyzeTriangles } from "./estimator/core";
import { boxMesh } from "./estimator/fixtures";
import type { ParsedFile, PartDefaults } from "./pricing";
import { computeBundleV3 } from "./estimate";
import { materialDelta, qualityDelta, strengthDelta, orientationDelta } from "./optionDeltas";

const ANALYSIS = analyzeTriangles(boxMesh(50, 40, 30));
const FILE: ParsedFile = { id: "t1", name: "test.stl", sizeBytes: 1000, volumeMm3: ANALYSIS.volumeMm3, qty: 1, analysis: ANALYSIS };
const DEFAULTS: PartDefaults = { material: "PLA", color: "", infill: 15, wallLoops: 2, multicolour: false, quality: "standard", supports: true, orientation: "auto" };

describe("optionDeltas", () => {
  it("ASA costs more than PLA (positive delta)", () => {
    const d = materialDelta([FILE], DEFAULTS, "standard", "ASA");
    expect(d.deltaEur).toBeGreaterThan(0);
    expect(d.formatted).toMatch(/^\+€/);
  });

  it("PLA to PLA delta is zero (Included)", () => {
    const d = materialDelta([FILE], DEFAULTS, "standard", "PLA");
    expect(d.deltaEur).toBe(0);
    expect(d.formatted).toBe("Included");
  });

  it("ultra quality costs more than standard", () => {
    const d = qualityDelta([FILE], DEFAULTS, "standard", "ultra");
    expect(d.deltaEur).toBeGreaterThan(0);
  });

  it("fast quality costs less than standard (negative delta)", () => {
    const d = qualityDelta([FILE], DEFAULTS, "standard", "fast");
    expect(d.deltaEur).toBeLessThan(0);
    expect(d.formatted).toMatch(/^−€/);
  });

  it("orientation delta: auto vs keep (0) equals savedByOrientationEur negated when auto is cheaper", () => {
    const bundle = computeBundleV3([FILE], DEFAULTS, "standard")!;
    const d = orientationDelta([FILE], DEFAULTS, "standard", 0);
    // switching from auto to 0 (keep) changes cost by -(savedByOrientationEur)
    expect(Math.abs(d.deltaEur - bundle.savedByOrientationEur)).toBeLessThan(0.02);
  });

  it("strength delta: maximum costs more than standard", () => {
    const d = strengthDelta([FILE], DEFAULTS, "standard", "maximum", 50, 4);
    expect(d.deltaEur).toBeGreaterThan(0);
  });

  it("deltas sum correctly when applied", () => {
    // If we apply ASA material delta, result should equal ASA direct price
    const basePla = computeBundleV3([FILE], DEFAULTS, "standard")!.total;
    const d = materialDelta([FILE], DEFAULTS, "standard", "ASA");
    const asaDirect = computeBundleV3([FILE], { ...DEFAULTS, material: "ASA" }, "standard")!.total;
    expect(Math.abs((basePla + d.deltaEur) - asaDirect)).toBeLessThan(0.02);
  });
});
