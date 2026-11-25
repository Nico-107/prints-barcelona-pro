import { describe, it, expect } from "vitest";
import { plateFit } from "../../supabase/functions/_shared/pricing/plateFit";

// P6 — scale-to-fit. Scaling must be applied to the geometry before analysis on client
// and server. The plateFit result's `scaleToFit` is the proportional factor required to
// bring an oversize part under the plate.

function boxTri(xMm: number, yMm: number, zMm: number): Float32Array {
  const v = (x: number, y: number, z: number) => [x, y, z];
  const faces = [
    [...v(0, 0, 0), ...v(xMm, yMm, 0), ...v(xMm, 0, 0)],
    [...v(0, 0, 0), ...v(0, yMm, 0), ...v(xMm, yMm, 0)],
    [...v(0, 0, zMm), ...v(xMm, 0, zMm), ...v(xMm, yMm, zMm)],
    [...v(0, 0, zMm), ...v(xMm, yMm, zMm), ...v(0, yMm, zMm)],
    [...v(0, 0, 0), ...v(xMm, 0, 0), ...v(xMm, 0, zMm)],
    [...v(0, 0, 0), ...v(xMm, 0, zMm), ...v(0, 0, zMm)],
    [...v(0, yMm, 0), ...v(0, yMm, zMm), ...v(xMm, yMm, zMm)],
    [...v(0, yMm, 0), ...v(xMm, yMm, zMm), ...v(xMm, yMm, 0)],
    [...v(0, 0, 0), ...v(0, 0, zMm), ...v(0, yMm, zMm)],
    [...v(0, 0, 0), ...v(0, yMm, zMm), ...v(0, yMm, 0)],
    [...v(xMm, 0, 0), ...v(xMm, yMm, 0), ...v(xMm, yMm, zMm)],
    [...v(xMm, 0, 0), ...v(xMm, yMm, zMm), ...v(xMm, 0, zMm)],
  ];
  return Float32Array.from(faces.flat());
}

function scale(tri: Float32Array, factor: number): Float32Array {
  const out = new Float32Array(tri.length);
  for (let i = 0; i < tri.length; i++) out[i] = tri[i] * factor;
  return out;
}

describe("P6 scale-to-fit", () => {
  it("270×270×10 → scaleToFit < 1, and scaling the mesh by that factor fits", () => {
    const tri = boxTri(270, 270, 10);
    const r = plateFit(tri);
    expect(r.fits).toBe(false);
    expect(r.scaleToFit).toBeGreaterThan(0);
    expect(r.scaleToFit).toBeLessThan(1);
    const scaled = scale(tri, r.scaleToFit);
    const r2 = plateFit(scaled);
    expect(r2.fits).toBe(true);
  });
  it("maqueta-like 348×272×99 scaled by 0.99 × scaleToFit always fits", () => {
    const tri = boxTri(347.6, 271.7, 99.1);
    const r = plateFit(tri);
    expect(r.fits).toBe(false);
    // Shrink by 1 % below the boundary so the next plateFit call clears rounding/precision.
    const s = (r.scaleToFit > 0 ? r.scaleToFit : 0.5) * 0.99;
    const r2 = plateFit(scale(tri, s));
    expect(r2.fits).toBe(true);
  });
  it("custom scale percent is a simple multiply (deterministic)", () => {
    const tri = boxTri(100, 100, 100);
    const scaled = scale(tri, 0.5);
    expect(scaled[0]).toBe(tri[0] * 0.5);
    expect(scaled.length).toBe(tri.length);
  });
});
