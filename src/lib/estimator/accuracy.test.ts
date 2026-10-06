import { describe, it, expect } from "vitest";
import { analyzeTriangles, estimatePart } from "./core";
import { boxMesh, prismMesh, tBeamMesh } from "./fixtures";

// ACCURACY GATE: estimator vs REAL slices of the Bambu Lab X2D (OrcaSlicer 2.4.2, 0.4 nozzle, 0.20 mm Standard, gyroid, 15% infill, 2 walls).
// [name, mesh, real plastic cm3, real print minutes]  (no supports needed in these orientations)
const SHAPES: [string, Float32Array, number, number][] = [
  ["box 40x40x40", boxMesh(40, 40, 40), 15.89, 77.6], ["cube 15", boxMesh(15, 15, 15), 1.36, 14.8], ["box 100x100x20", boxMesh(100, 100, 20), 47.95, 195.9],
  ["plate 100x60x3", boxMesh(100, 60, 3), 11.38, 32.3], ["plate 100x60x8", boxMesh(100, 60, 8), 16.84, 60.4], ["slab 20x20x80", boxMesh(20, 20, 80), 9.68, 56.6],
  ["cylinder d10 h10", prismMesh(5, 10, 64), 0.4, 10.6], ["cylinder d20 h60", prismMesh(10, 60, 96), 5.77, 39.3], ["puck d60 h20", prismMesh(30, 20, 96), 14.6, 67.0],
  ["cylinder d50 h100", prismMesh(25, 100, 120), 42.05, 204.5], ["hex prism d40 h30", prismMesh(20, 30, 6), 8.45, 46.0],
  ["tube d30 wall 2", prismMesh(15, 60, 96, 13), 9.67, 39.2], ["tube d30 wall 5", prismMesh(15, 60, 96, 10), 10.92, 56.7], ["ring d40 h10", prismMesh(20, 10, 96, 17), 2.48, 15.3],
];
const S = (o: number, sup = false) => ({ material: 'PLA', infillPct: 15, wallLoops: 2, quality: 'standard' as const, supports: sup, orientation: o });

describe("accuracy gate vs real slicer results", () => {
  it("simple shapes: plastic within 8% each / 5.5% on average; time within 60% each / 27% on average", () => {
    let sp = 0, st = 0;
    for (const [name, mesh, realCm3, realMin] of SHAPES) {
      const e = estimatePart(analyzeTriangles(mesh), S(0));
      const ep = Math.abs(e.plasticCm3 / realCm3 - 1), et = Math.abs(e.timeSec / 60 / realMin - 1);
      expect(ep, `${name} plastic`).toBeLessThan(0.08); expect(et, `${name} time`).toBeLessThan(0.60); sp += ep; st += et;
    }
    expect(sp / SHAPES.length).toBeLessThan(0.055); expect(st / SHAPES.length).toBeLessThan(0.27);
  });
  it("T-beam (overhang): supports are estimated correctly in both orientations", () => {
    const a = analyzeTriangles(tBeamMesh());
    const up = estimatePart(a, S(0, true));      // real: 23.28 cm3 and 188 min with tree supports
    expect(Math.abs((up.plasticCm3 + up.supportCm3) / 23.28 - 1)).toBeLessThan(0.08); expect(Math.abs(up.timeSec / 60 / 188 - 1)).toBeLessThan(0.15);
    const flipped = estimatePart(a, S(1, true)); // real: 14.07 cm3 and 59 min
    expect(Math.abs((flipped.plasticCm3 + flipped.supportCm3) / 14.07 - 1)).toBeLessThan(0.10); expect(Math.abs(flipped.timeSec / 60 / 59 - 1)).toBeLessThan(0.15);
    expect(estimatePart(a, { ...S(0, true), orientation: 'auto' }).orientation).toBe(1);
  });
});
