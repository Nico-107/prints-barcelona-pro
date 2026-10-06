import { describe, it, expect } from "vitest";
import { instantBuyAllowed } from "./instantBuy";

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
