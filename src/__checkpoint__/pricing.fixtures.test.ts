import { describe, it, expect } from "vitest";
import { robustAnalyse } from "../../supabase/functions/_shared/pricing/robust";
import { cubeTriangles } from "./legacy/quoteLegacy";

// P3 — robust analysis fixture expectations. Clean fixtures must not change price;
// messy fixtures must land inside their documented range.

describe("P3 robust analysis", () => {
  it("clean 20mm cube → mode 'raw', volume ≈ 8 cm³", () => {
    const r = robustAnalyse(cubeTriangles(20));
    expect(r.mode).toBe("raw");
    expect(r.analysis.volumeMm3).toBeCloseTo(8000, -1);
  });

  it("messy open shell → mode 'union', bbox reflects the open part", () => {
    // Open 100×100×20 box (missing +Z face): 10 triangles.
    const tris: number[] = [];
    const push = (p: number[][]) => { for (const [x, y, z] of p) tris.push(x, y, z); };
    // bottom
    push([[0, 0, 0], [100, 100, 0], [100, 0, 0]]);
    push([[0, 0, 0], [0, 100, 0], [100, 100, 0]]);
    // +X, -X, +Y, -Y walls (8 tris total)
    push([[100, 0, 0], [100, 100, 0], [100, 100, 20]]);
    push([[100, 0, 0], [100, 100, 20], [100, 0, 20]]);
    push([[0, 0, 0], [0, 0, 20], [0, 100, 20]]);
    push([[0, 0, 0], [0, 100, 20], [0, 100, 0]]);
    push([[0, 100, 0], [0, 100, 20], [100, 100, 20]]);
    push([[0, 100, 0], [100, 100, 20], [100, 100, 0]]);
    push([[0, 0, 0], [100, 0, 0], [100, 0, 20]]);
    push([[0, 0, 0], [100, 0, 20], [0, 0, 20]]);
    const r = robustAnalyse(Float32Array.from(tris));
    expect(r.mode).toBe("union");
    expect(r.analysis.boundsMm[0]).toBeGreaterThanOrEqual(100);
    expect(r.analysis.boundsMm[1]).toBeGreaterThanOrEqual(100);
    expect(r.analysis.boundsMm[2]).toBeGreaterThanOrEqual(20);
    // Conservative union volume ≥ 30 % of bbox so pricing never collapses to 9,90.
    expect(r.analysis.volumeMm3).toBeGreaterThanOrEqual(0.3 * 100 * 100 * 20 * 0.99);
  });

  it("monotonic determinism: same input twice → same volume", () => {
    const a = robustAnalyse(cubeTriangles(30));
    const b = robustAnalyse(cubeTriangles(30));
    expect(a.analysis.volumeMm3).toBe(b.analysis.volumeMm3);
  });
});
