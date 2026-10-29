import { describe, it, expect } from "vitest";
import { instantBuyAllowed, getInstantBuyStatus } from "./instantBuy";

const base = { adminMode: false, anyMulticolour: false, eligible: true, filesWithinVerifyLimit: true, flagReady: true };

describe("instantBuyAllowed", () => {
  it("returns true when all conditions met", () => expect(instantBuyAllowed(base)).toBe(true));
  it("returns false when adminMode", () => expect(instantBuyAllowed({ ...base, adminMode: true })).toBe(false));
  it("returns false when anyMulticolour", () => expect(instantBuyAllowed({ ...base, anyMulticolour: true })).toBe(false));
  it("returns false when not eligible", () => expect(instantBuyAllowed({ ...base, eligible: false })).toBe(false));
  it("returns false when files exceed verify limit", () => expect(instantBuyAllowed({ ...base, filesWithinVerifyLimit: false })).toBe(false));
  it("returns false when flag not ready", () => expect(instantBuyAllowed({ ...base, flagReady: false })).toBe(false));
  it("returns false when multiple conditions fail", () => expect(instantBuyAllowed({ ...base, adminMode: true, flagReady: false })).toBe(false));
});

const statusBase = {
  adminMode: false,
  anyMulticolour: false,
  orderReasons: [] as string[],
  filesWithinVerifyLimit: true,
  flagReady: true,
  forceQuoteOnly: false,
  showManualReview: false,
};

describe("getInstantBuyStatus", () => {
  it("eligible when all conditions met", () => {
    expect(getInstantBuyStatus(statusBase).eligible).toBe(true);
    expect(getInstantBuyStatus(statusBase).reasons).toHaveLength(0);
  });

  it("flag-off when flagReady false", () => {
    const r = getInstantBuyStatus({ ...statusBase, flagReady: false });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('flag-off');
  });

  it("flag-off when adminMode", () => {
    const r = getInstantBuyStatus({ ...statusBase, adminMode: true });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('flag-off');
  });

  it("city-not-shipped when forceQuoteOnly", () => {
    const r = getInstantBuyStatus({ ...statusBase, forceQuoteOnly: true });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('city-not-shipped');
  });

  it("file-too-large when filesWithinVerifyLimit false", () => {
    const r = getInstantBuyStatus({ ...statusBase, filesWithinVerifyLimit: false });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('file-too-large');
  });

  it("multicolour when anyMulticolour", () => {
    const r = getInstantBuyStatus({ ...statusBase, anyMulticolour: true });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('multicolour');
  });

  it("manual-review-open when showManualReview", () => {
    const r = getInstantBuyStatus({ ...statusBase, showManualReview: true });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('manual-review-open');
  });

  it("over-limit from orderReasons", () => {
    const r = getInstantBuyStatus({ ...statusBase, orderReasons: ['over-limit'] });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('over-limit');
  });

  it("oversize from orderReasons", () => {
    const r = getInstantBuyStatus({ ...statusBase, orderReasons: ['oversize:part.stl'] });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('oversize:part.stl');
  });

  it("material from orderReasons", () => {
    const r = getInstantBuyStatus({ ...statusBase, orderReasons: ['material:PC'] });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('material:PC');
  });

  it("multiple reasons accumulated", () => {
    const r = getInstantBuyStatus({
      ...statusBase,
      anyMulticolour: true,
      orderReasons: ['over-limit'],
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('multicolour');
    expect(r.reasons).toContain('over-limit');
  });
});
