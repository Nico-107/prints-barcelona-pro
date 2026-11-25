import { describe, it, expect } from "vitest";

// P8 — very small parts note. Largest dimension < 8 mm OR thinnest bbox < 0.8 mm → info
// banner "Pieza muy pequeña: los detalles muy finos pueden no imprimirse". The decision is
// pure math; copy lives in i18n.

export function verySmallNote(bbox: [number, number, number]): boolean {
  const [x, y, z] = bbox;
  const largest = Math.max(x, y, z);
  const thinnest = Math.min(x, y, z);
  return largest < 8 || thinnest < 0.8;
}

describe("P8 very-small-part detection", () => {
  it("2mm cube triggers the note (largest < 8mm)", () => {
    expect(verySmallNote([2, 2, 2])).toBe(true);
  });
  it("20mm cube does not trigger the note", () => {
    expect(verySmallNote([20, 20, 20])).toBe(false);
  });
  it("200×200×0.5 flat plate triggers the note (thinnest < 0.8mm)", () => {
    expect(verySmallNote([200, 200, 0.5])).toBe(true);
  });
  it("200×200×2 flat plate does not trigger", () => {
    expect(verySmallNote([200, 200, 2])).toBe(false);
  });
});
