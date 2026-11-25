import { describe, it, expect } from "vitest";
import { suggestUnits } from "../../supabase/functions/_shared/pricing/units";

// P7 — units detection.

describe("P7 suggestUnits", () => {
  it("50mm cube exported in metres (0.05 m) → likely-too-small, ×1000 option", () => {
    const r = suggestUnits(0.05);
    expect(r.kind).toBe("likely-too-small");
    if (r.kind === "likely-too-small") {
      expect(r.options.map((o) => o.factor)).toContain(1000);
    }
  });
  it("2 inch cube (2.0) → likely-too-small, ×25.4 option", () => {
    const r = suggestUnits(2.0);
    expect(r.kind).toBe("likely-too-small");
    if (r.kind === "likely-too-small") {
      expect(r.options.map((o) => o.factor)).toContain(25.4);
    }
  });
  it("20mm cube (20) → ok", () => {
    const r = suggestUnits(20);
    expect(r.kind).toBe("ok");
  });
  it("Suspicious 3000mm → likely-too-large with ÷10 / ÷25.4 / ÷1000 options", () => {
    const r = suggestUnits(3000);
    expect(r.kind).toBe("likely-too-large");
    if (r.kind === "likely-too-large") {
      expect(r.options.map((o) => Math.round(1 / o.factor))).toEqual([10, 25, 1000]);
    }
  });
});
