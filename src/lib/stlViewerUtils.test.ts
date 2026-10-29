import { describe, it, expect } from "vitest";
import { getUnitWarning, gridSizeForPart, COMPARE_NEXT } from "./stlViewerUtils";

describe("getUnitWarning", () => {
  it("returns null for a normal part", () => {
    expect(getUnitWarning({ x: 50, y: 40, z: 30 })).toBeNull();
  });
  it("returns unit-small when any dim < 3 mm", () => {
    expect(getUnitWarning({ x: 2.9, y: 40, z: 30 })).toBe("unit-small");
  });
  it("returns unit-large when any dim > 600 mm", () => {
    expect(getUnitWarning({ x: 601, y: 40, z: 30 })).toBe("unit-large");
  });
  it("returns null at exactly 3 mm min", () => {
    expect(getUnitWarning({ x: 3, y: 3, z: 3 })).toBeNull();
  });
  it("returns null at exactly 600 mm max", () => {
    expect(getUnitWarning({ x: 600, y: 10, z: 10 })).toBeNull();
  });
  it("unit-small wins over unit-large when both axes trigger", () => {
    expect(getUnitWarning({ x: 0.5, y: 700, z: 10 })).toBe("unit-small");
  });
});

describe("gridSizeForPart", () => {
  it("returns 200 for tiny parts", () => {
    expect(gridSizeForPart(5)).toBe(200);
  });
  it("rounds up to next 100", () => {
    expect(gridSizeForPart(201)).toBe(300);
  });
  it("returns exact value when maxDim is a multiple of 100", () => {
    expect(gridSizeForPart(200)).toBe(200);
    expect(gridSizeForPart(400)).toBe(400);
  });
  it("works for large parts", () => {
    expect(gridSizeForPart(450)).toBe(500);
  });
});

describe("COMPARE_NEXT cycle", () => {
  it("cycles off → coin → card → a4 → off", () => {
    expect(COMPARE_NEXT.off).toBe("coin");
    expect(COMPARE_NEXT.coin).toBe("card");
    expect(COMPARE_NEXT.card).toBe("a4");
    expect(COMPARE_NEXT.a4).toBe("off");
  });
});
