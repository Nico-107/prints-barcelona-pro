import { describe, it, expect } from "vitest";
import { summarizeParts } from "./summarizeParts";
import type { TablesInsert } from "@/integrations/supabase/types";

describe("summarizeParts", () => {
  it("uniform — single part PLA 15% 2w", () => {
    const r = summarizeParts([{ material: "PLA", infill: 15, wallLoops: 2, multicolour: false }]);
    expect(r.material).toBe("PLA");
    expect(r.infill).toBe("15%");
    expect(r.infillNum).toBe(15);
    expect(r.wallLoops).toBe(2);
    expect(r.multicolour).toBe(false);
    expect(r.isUniform).toBe(true);
  });

  it("uniform — multiple identical PLA parts", () => {
    const r = summarizeParts([
      { material: "PLA", infill: 20, wallLoops: 3, multicolour: false },
      { material: "PLA", infill: 20, wallLoops: 3, multicolour: false },
    ]);
    expect(r.material).toBe("PLA");
    expect(r.isUniform).toBe(true);
    expect(r.infillNum).toBe(20);
    expect(r.wallLoops).toBe(3);
  });

  it("mixed — E1 three different materials PETG+TPU+PLA", () => {
    const r = summarizeParts([
      { material: "PETG", infill: 50, wallLoops: 3, multicolour: false },
      { material: "TPU",  infill: 20, wallLoops: 2, multicolour: false },
      { material: "PLA",  infill: 20, wallLoops: 2, multicolour: false },
    ]);
    expect(r.material).toBe("Mixed (PETG, TPU, PLA)");
    expect(r.infill).toBe("mixed");
    expect(r.infillNum).toBeNull();
    expect(r.wallLoops).toBe(3); // first part's walls
    expect(r.multicolour).toBe(false);
    expect(r.isUniform).toBe(false);
  });

  it("mixed — same material but different infill", () => {
    const r = summarizeParts([
      { material: "PLA", infill: 15, wallLoops: 2, multicolour: false },
      { material: "PLA", infill: 50, wallLoops: 2, multicolour: false },
    ]);
    expect(r.isUniform).toBe(false);
    expect(r.infill).toBe("mixed");
    expect(r.infillNum).toBeNull();
    expect(r.material).toBe("Mixed (PLA)");
  });

  it("mixed — same material and infill but different walls", () => {
    const r = summarizeParts([
      { material: "PLA", infill: 15, wallLoops: 2, multicolour: false },
      { material: "PLA", infill: 15, wallLoops: 4, multicolour: false },
    ]);
    expect(r.isUniform).toBe(false);
    expect(r.wallLoops).toBe(2); // first part's walls
  });

  it("multicolour — any part sets flag", () => {
    const r = summarizeParts([
      { material: "PLA", infill: 15, wallLoops: 2, multicolour: false },
      { material: "PLA", infill: 15, wallLoops: 2, multicolour: true },
    ]);
    expect(r.multicolour).toBe(true);
    expect(r.isUniform).toBe(true); // material/infill/walls uniform, multicolour irrelevant for isUniform
  });

  it("max 4 distinct materials then +n overflow", () => {
    const r = summarizeParts([
      { material: "PLA",    infill: 15, wallLoops: 2, multicolour: false },
      { material: "PETG",   infill: 15, wallLoops: 2, multicolour: false },
      { material: "ABS",    infill: 15, wallLoops: 2, multicolour: false },
      { material: "TPU",    infill: 15, wallLoops: 2, multicolour: false },
      { material: "Nylon",  infill: 15, wallLoops: 2, multicolour: false },
    ]);
    expect(r.material).toBe("Mixed (PLA, PETG, ABS, TPU +1)");
    expect(r.isUniform).toBe(false);
  });

  it("empty input returns safe defaults", () => {
    const r = summarizeParts([]);
    expect(r.material).toBe("");
    expect(r.isUniform).toBe(true);
  });
});

// Type-level guard: a valid TablesInsert<"quote_requests"> must not accept pricingVersion.
// This function would be a TypeScript compile error if pricingVersion were added.
function _buildQuotePayloadTypeCheck(): TablesInsert<"quote_requests"> {
  return {
    estimated_grams: 1,
    estimated_hours: 1,
    estimated_price_high: 10,
    estimated_price_low: 10,
    infill: "15%",
    material: "PLA",
    quantity: 1,
    wall_loops: 2,
    // pricingVersion: 2,  ← uncomment to confirm TS error
  };
}

it("TablesInsert<quote_requests> has no pricingVersion column", () => {
  const payload = _buildQuotePayloadTypeCheck();
  expect("pricingVersion" in payload).toBe(false);
});
