import { describe, it, expect } from "vitest";

// P11 — file health panel states. Pure classifier over the combined signals.

export type FileHealthState =
  | "ready"
  | "review" // messy, robust ok, we review before printing
  | "oversize"
  | "units"
  | "very-small"
  | "uploading"
  | "unsupported"
  | "price-updated"
  | "checkout-error";

export interface HealthInput {
  fitsPlate: boolean;
  robustOk: boolean;
  classIsMessy: boolean;
  gramsKnown: boolean;
  largestMm: number;
  thinnestMm: number;
  isUploading: boolean;
  isUnsupported: boolean;
  priceUpdated: boolean;
  checkoutError: boolean;
}

export function fileHealthState(h: HealthInput): FileHealthState {
  if (h.checkoutError) return "checkout-error";
  if (h.isUploading) return "uploading";
  if (h.isUnsupported) return "unsupported";
  if (h.priceUpdated) return "price-updated";
  if (!h.fitsPlate) return "oversize";
  if (h.largestMm < 5) return "units";
  if (h.largestMm > 1000) return "units";
  if (h.largestMm < 8 || h.thinnestMm < 0.8) return "very-small";
  if (h.classIsMessy && h.robustOk) return "review";
  return "ready";
}

function base(): HealthInput {
  return {
    fitsPlate: true,
    robustOk: true,
    classIsMessy: false,
    gramsKnown: true,
    largestMm: 20,
    thinnestMm: 2,
    isUploading: false,
    isUnsupported: false,
    priceUpdated: false,
    checkoutError: false,
  };
}

describe("P11 file health states", () => {
  it("clean fitting part → ready", () => {
    expect(fileHealthState(base())).toBe("ready");
  });
  it("oversize wins over messy/units/small", () => {
    expect(fileHealthState({ ...base(), fitsPlate: false, classIsMessy: true, largestMm: 2 })).toBe("oversize");
  });
  it("units signal fires when <5mm or >1000mm", () => {
    expect(fileHealthState({ ...base(), largestMm: 0.05 })).toBe("units");
    expect(fileHealthState({ ...base(), largestMm: 3000 })).toBe("units");
  });
  it("very-small state when <8mm largest or <0.8mm thinnest", () => {
    expect(fileHealthState({ ...base(), largestMm: 7 })).toBe("very-small");
    expect(fileHealthState({ ...base(), thinnestMm: 0.5 })).toBe("very-small");
  });
  it("messy + robust ok → review", () => {
    expect(fileHealthState({ ...base(), classIsMessy: true })).toBe("review");
  });
  it("checkout error wins over everything else", () => {
    expect(fileHealthState({ ...base(), checkoutError: true, fitsPlate: false })).toBe("checkout-error");
  });
  it("uploading wins over unsupported but loses to checkout-error", () => {
    expect(fileHealthState({ ...base(), isUploading: true, isUnsupported: true })).toBe("uploading");
    expect(fileHealthState({ ...base(), checkoutError: true, isUploading: true })).toBe("checkout-error");
  });
  it("priceUpdated state is distinct from ready", () => {
    expect(fileHealthState({ ...base(), priceUpdated: true })).toBe("price-updated");
  });
});
