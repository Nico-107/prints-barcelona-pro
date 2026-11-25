import { describe, it, expect } from "vitest";
import { checkOversize } from "../../supabase/functions/_shared/checkout/evaluate";

// S5 — server oversize + scale: uses plateFit's rotation-aware convex-hull enclosing
// rectangle. OVERSIZE only reported when no orientation fits after applied scale.

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

describe("S5 server oversize + scale", () => {
  it("20mm cube fits (scale 1)", () => {
    const r = checkOversize(boxTri(20, 20, 20));
    expect(r.fits).toBe(true);
    expect(r.scaleToFit).toBe(1);
  });
  it("270×270×10 doesn't fit at scale 1", () => {
    const r = checkOversize(boxTri(270, 270, 10));
    expect(r.fits).toBe(false);
    expect(r.scaleToFit).toBeLessThan(1);
  });
  it("300×60×20 fits diagonally at scale 1 (plateFit rotation)", () => {
    const r = checkOversize(boxTri(300, 60, 20));
    expect(r.fits).toBe(true);
  });
  it("Scaling down 270×270×10 by the returned scaleToFit (minus 1 %) fits", () => {
    const tri = boxTri(270, 270, 10);
    const { scaleToFit } = checkOversize(tri);
    const r = checkOversize(tri, scaleToFit * 0.99);
    expect(r.fits).toBe(true);
  });
});
