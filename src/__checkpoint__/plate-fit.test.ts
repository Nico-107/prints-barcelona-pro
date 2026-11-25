import { describe, it, expect } from "vitest";
import { plateFit } from "../../supabase/functions/_shared/pricing/plateFit";

// P5 — plate fit with rotation about Z.

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

describe("P5 plateFit", () => {
  it("20mm cube fits", () => {
    const r = plateFit(boxTri(20, 20, 20));
    expect(r.fits).toBe(true);
  });
  it("20×20×250 fits (tall but within z=261)", () => {
    const r = plateFit(boxTri(20, 20, 250));
    expect(r.fits).toBe(true);
  });
  it("300×60×20 fits diagonally (the key hotfix win over axis-aligned rule)", () => {
    const r = plateFit(boxTri(300, 60, 20));
    // 300×60 at ~45° shrinks the bounding rectangle enough to fit 256×256.
    expect(r.fits).toBe(true);
  });
  it("270×270×10 does not fit", () => {
    const r = plateFit(boxTri(270, 270, 10));
    expect(r.fits).toBe(false);
    // scaleToFit should be < 1 but > 0
    expect(r.scaleToFit).toBeGreaterThan(0);
    expect(r.scaleToFit).toBeLessThan(1);
  });
});
