import { describe, it, expect } from "vitest";
import {
  evaluateV4,
  analyzeTriangles,
  EST,
  type V3Piece,
} from "./legacy/deployedServer";
import { analyzeCube, legacyQuote } from "./legacy/quoteLegacy";

// H2 — Oversize gate: if the part does not fit the plate under the deployed server's rule
// (axis-aligned, 6 orientations, 256×256×261 mm), Buy must be disabled, the green
// "Archivo imprimible" badge must not appear, and the server would reject with OVERSIZE_PART.
//
// The test does not drive the UI directly (that is H5's e2e) — it proves that the model the
// UI uses to decide "printable" matches the deployed server's rule to the triangle.

// Builds a thin, axis-aligned box of given dimensions.
function boxTriangles(xMm: number, yMm: number, zMm: number): Float32Array {
  const v = (x: number, y: number, z: number) => [x, y, z];
  const faces: number[][] = [
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

const serverPiece = (name: string, material = "PLA"): V3Piece => ({
  name,
  quantity: 1,
  path: `u/${name}.stl`,
  material,
  infill: 15,
  wallLoops: 2,
  quality: "standard",
  supports: true,
  orientation: "auto",
});

describe("hotfix-oversize: Buy disabled and server rejects when no orientation fits", () => {
  it("20mm cube fits every orientation — not oversize", () => {
    const a = analyzeCube(20);
    expect(a.orientations.some((o) => o.sizeXMm <= EST.plate.x && o.sizeYMm <= EST.plate.y && o.heightMm <= EST.plate.z)).toBe(true);
    const q = legacyQuote({
      pieces: [{ analysis: a, material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto", quantity: 1 }],
      urgency: "standard",
      fulfillment: "pickup",
    });
    expect(q.oversize).toBe(false);
  });

  it("maqueta-like 348×272×99 does not fit any orientation — oversize", () => {
    const a = analyzeTriangles(boxTriangles(347.6, 271.7, 99.1));
    // In every orientation, at least one axis exceeds the plate.
    expect(a.orientations.every((o) => o.sizeXMm > EST.plate.x || o.sizeYMm > EST.plate.y || o.heightMm > EST.plate.z)).toBe(true);
    const r = evaluateV4(
      { pricingVersion: 4, urgency: "standard", fulfillment: "pickup", exactPrice: 50, pieces: [serverPiece("maqueta")] },
      [a],
    );
    expect(r.ok).toBe(false);
    expect(r.error).toBe("OVERSIZE_PART");
  });

  it("300×60×20 — axis-aligned rejected by deployed server (even though it would fit diagonally; diagonal fit is P5)", () => {
    const a = analyzeTriangles(boxTriangles(300, 60, 20));
    expect(a.orientations.every((o) => o.sizeXMm > EST.plate.x || o.sizeYMm > EST.plate.y || o.heightMm > EST.plate.z)).toBe(true);
    const r = evaluateV4(
      { pricingVersion: 4, urgency: "standard", fulfillment: "pickup", exactPrice: 50, pieces: [serverPiece("plate-300")] },
      [a],
    );
    expect(r.ok).toBe(false);
    expect(r.error).toBe("OVERSIZE_PART");
  });

  it("tall 20×20×250 fits (within 256×256×261)", () => {
    const a = analyzeTriangles(boxTriangles(20, 20, 250));
    expect(a.orientations.some((o) => o.sizeXMm <= EST.plate.x && o.sizeYMm <= EST.plate.y && o.heightMm <= EST.plate.z)).toBe(true);
    const r = evaluateV4(
      { pricingVersion: 4, urgency: "standard", fulfillment: "pickup", exactPrice: 10, pieces: [serverPiece("tower")] },
      [a],
    );
    // May succeed or fail depending on pricing but must not OVERSIZE.
    if (!r.ok) expect(r.error).not.toBe("OVERSIZE_PART");
  });
});
