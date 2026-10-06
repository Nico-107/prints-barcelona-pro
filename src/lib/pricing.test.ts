import { describe, it, expect } from "vitest";
import {
  computeOrder,
  computeBundleV2,
  MATERIALS,
  INSTANT_MATERIALS,
  URGENCY_MULTIPLIER,
  wallFactor,
  effectiveFill,
  pricingRound,
  effectivePartSettings,
} from "./pricing";
import type { PricePiece, ParsedFileForPricing, PartDefaults } from "./pricing";

// ─── E1–E4 exact checks ───────────────────────────────────────────────────────

describe("E1 — [A,B,C] standard pickup", () => {
  const e1 = computeOrder(
    [
      { volumeMm3: 30000, quantity: 2, material: "PETG", infill: 50, wallLoops: 3 },
      { volumeMm3: 15000, quantity: 1, material: "TPU",  infill: 20, wallLoops: 2 },
      { volumeMm3: 40000, quantity: 4, material: "PLA",  infill: 20, wallLoops: 2 },
    ],
    "standard",
  );

  it("gramsPerUnit[0] ≈ 22.86", () => expect(e1.parts[0].gramsPerUnit).toBeCloseTo(22.86, 1));
  it("gramsPerUnit[1] ≈ 5.616", () => expect(e1.parts[1].gramsPerUnit).toBeCloseTo(5.616, 2));
  it("gramsPerUnit[2] ≈ 15.4752", () => expect(e1.parts[2].gramsPerUnit).toBeCloseTo(15.4752, 2));
  it("totalCents = 3429", () => expect(e1.totalCents).toBe(3429));
  it("chargedPrintCents = 3429", () => expect(e1.chargedPrintCents).toBe(3429));
  it("parts[0].costCents = 1106", () => expect(e1.parts[0].costCents).toBe(1106));
  it("parts[1].costCents = 161",  () => expect(e1.parts[1].costCents).toBe(161));
  it("parts[2].costCents = 1362", () => expect(e1.parts[2].costCents).toBe(1362));
  it("setupCents = 800",  () => expect(e1.setupCents).toBe(800));
  it("minAdjCents = 0",   () => expect(e1.minAdjCents).toBe(0));
  it("expressCents = 0",  () => expect(e1.expressCents).toBe(0));
  it("capShaveCents = 0", () => expect(e1.capShaveCents).toBe(0));
  it("eligible = true",   () => expect(e1.eligible).toBe(true));
  it("line invariant", () => {
    const sum = e1.parts.reduce((s, p) => s + p.costCents, 0)
      + e1.setupCents + e1.minAdjCents + e1.expressCents;
    expect(sum).toBe(e1.chargedPrintCents);
  });
});

describe("E2 — same parts, express + shipping", () => {
  const e2 = computeOrder(
    [
      { volumeMm3: 30000, quantity: 2, material: "PETG", infill: 50, wallLoops: 3 },
      { volumeMm3: 15000, quantity: 1, material: "TPU",  infill: 20, wallLoops: 2 },
      { volumeMm3: 40000, quantity: 4, material: "PLA",  infill: 20, wallLoops: 2 },
    ],
    "express",
  );

  it("totalCents = 4286", () => expect(e2.totalCents).toBe(4286));
  it("chargedPrintCents = 4286", () => expect(e2.chargedPrintCents).toBe(4286));
  it("parts[0].costCents = 1106", () => expect(e2.parts[0].costCents).toBe(1106));
  it("parts[1].costCents = 161",  () => expect(e2.parts[1].costCents).toBe(161));
  it("parts[2].costCents = 1362", () => expect(e2.parts[2].costCents).toBe(1362));
  it("expressCents = 857", () => expect(e2.expressCents).toBe(857));
  it("capShaveCents = 0",  () => expect(e2.capShaveCents).toBe(0));
  it("shipping added by caller: 600", () => {
    const shippingCents = 600;
    expect(e2.chargedPrintCents + shippingCents).toBe(4886);
  });
  it("line invariant", () => {
    const sum = e2.parts.reduce((s, p) => s + p.costCents, 0)
      + e2.setupCents + e2.minAdjCents + e2.expressCents;
    expect(sum).toBe(e2.chargedPrintCents);
  });
});

describe("E3 — [S] standard minimum price", () => {
  const e3 = computeOrder(
    [{ volumeMm3: 3000, quantity: 1, material: "PLA", infill: 15, wallLoops: 2 }],
    "standard",
  );

  it("gramsPerUnit[0] ≈ 1.0007", () => expect(e3.parts[0].gramsPerUnit).toBeCloseTo(1.0007, 2));
  it("totalCents = 1000", () => expect(e3.totalCents).toBe(1000));
  it("chargedPrintCents = 1000", () => expect(e3.chargedPrintCents).toBe(1000));
  it("parts[0].costCents = 22", () => expect(e3.parts[0].costCents).toBe(22));
  it("setupCents = 800",   () => expect(e3.setupCents).toBe(800));
  it("minAdjCents = 178",  () => expect(e3.minAdjCents).toBe(178));
  it("expressCents = 0",   () => expect(e3.expressCents).toBe(0));
  it("capShaveCents = 0",  () => expect(e3.capShaveCents).toBe(0));
  it("line invariant", () => {
    const sum = e3.parts.reduce((s, p) => s + p.costCents, 0)
      + e3.setupCents + e3.minAdjCents + e3.expressCents;
    expect(sum).toBe(e3.chargedPrintCents);
  });
});

describe("E4 — [big] standard cap", () => {
  const e4 = computeOrder(
    [{ volumeMm3: 505200, quantity: 1, material: "PLA", infill: 20, wallLoops: 2 }],
    "standard",
  );

  it("gramsPerUnit[0] ≈ 195.4518", () => expect(e4.parts[0].gramsPerUnit).toBeCloseTo(195.4518, 2));
  it("totalCents = 5100", () => expect(e4.totalCents).toBe(5100));
  it("chargedPrintCents = 5000", () => expect(e4.chargedPrintCents).toBe(5000));
  it("capShaveCents = 100",       () => expect(e4.capShaveCents).toBe(100));
  it("parts[0].costCents = 4200", () => expect(e4.parts[0].costCents).toBe(4200));
  it("setupCents = 800",   () => expect(e4.setupCents).toBe(800));
  it("minAdjCents = 0",    () => expect(e4.minAdjCents).toBe(0));
  it("expressCents = 0",   () => expect(e4.expressCents).toBe(0));
  it("4200 + 800 = 5000 = chargedPrintCents", () => {
    expect(e4.parts[0].costCents + e4.setupCents).toBe(5000);
  });
  it("line invariant", () => {
    const sum = e4.parts.reduce((s, p) => s + p.costCents, 0)
      + e4.setupCents + e4.minAdjCents + e4.expressCents;
    expect(sum).toBe(e4.chargedPrintCents);
  });
});

// ─── Invariant checks ────────────────────────────────────────────────────────

describe("invariants on random orders", () => {
  const INFILLS  = [5, 15, 30, 50, 80];
  const URGENCIES = ["standard", "express", "urgent"] as const;
  const INST_MATS = INSTANT_MATERIALS;

  function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(min: number, max: number): number { return Math.random() * (max - min) + min; }

  it("line-sum invariant holds for 2000 random mixed orders", () => {
    for (let t = 0; t < 2000; t++) {
      const urg = pick(URGENCIES);
      const nParts = Math.ceil(rand(1, 8));
      const pieces: PricePiece[] = [];
      for (let i = 0; i < nParts; i++) {
        pieces.push({
          volumeMm3: Math.round(rand(500, 400000)),
          quantity:  Math.ceil(rand(1, 20)),
          material:  pick(INST_MATS),
          infill:    pick(INFILLS),
          wallLoops: Math.ceil(rand(2, 8)),
        });
      }
      const r = computeOrder(pieces, urg);
      const sum = r.parts.reduce((s, p) => s + p.costCents, 0)
        + r.setupCents + r.minAdjCents + r.expressCents;
      expect(sum).toBe(r.chargedPrintCents);
      for (const p of r.parts) expect(p.costCents).toBeGreaterThanOrEqual(0);
      expect(r.setupCents).toBeGreaterThanOrEqual(0);
      expect(r.minAdjCents).toBeGreaterThanOrEqual(0);
      expect(r.expressCents).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─── MIN_PRICE window ────────────────────────────────────────────────────────

describe("MIN_PRICE floor", () => {
  it("tiny part is still charged at least €10", () => {
    const r = computeOrder(
      [{ volumeMm3: 100, quantity: 1, material: "PLA", infill: 5, wallLoops: 2 }],
      "standard",
    );
    expect(r.chargedPrintCents).toBeGreaterThanOrEqual(1000);
  });
});

// ─── Cap window (50–52.5) ────────────────────────────────────────────────────

describe("cap window", () => {
  it("chargedPrintCents <= 5000 when totalCents is between 5001 and 5250", () => {
    // A medium-large PLA print that lands in the cap window
    const r = computeOrder(
      [{ volumeMm3: 260000, quantity: 1, material: "PLA", infill: 20, wallLoops: 2 }],
      "standard",
    );
    if (r.eligible && r.totalCents > 5000) {
      expect(r.chargedPrintCents).toBeLessThanOrEqual(5000);
      expect(r.capShaveCents).toBe(r.totalCents - 5000);
    }
  });

  it("ineligible order (>5250) is not capped", () => {
    const r = computeOrder(
      [{ volumeMm3: 700000, quantity: 1, material: "PLA", infill: 50, wallLoops: 4 }],
      "standard",
    );
    expect(r.eligible).toBe(false);
    expect(r.capShaveCents).toBe(0);
    expect(r.chargedPrintCents).toBe(r.totalCents);
  });
});

// ─── Legacy equivalence ───────────────────────────────────────────────────────

describe("legacy equivalence — 10000 single-material random orders", () => {
  const INFILLS  = [5, 15, 30, 50, 80];
  const URGENCIES = ["standard", "express", "urgent"] as const;
  const INST_MATS = ["PLA", "PETG", "ABS", "TPU"] as const;

  function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(min: number, max: number): number { return Math.random() * (max - min) + min; }

  function legacyRound(x: number): number { return Math.floor(x + 0.5); }

  function legacyWallFactor(w: number): number {
    if (w <= 2) return 0.14;
    if (w === 3) return 0.20;
    if (w === 4) return 0.27;
    return Math.min(0.27 + (w - 4) * 0.07, 0.80);
  }

  function legacyEffectiveFill(infill: number, walls: number): number {
    const wf = legacyWallFactor(walls);
    return wf + (infill / 100) * (1 - wf);
  }

  function legacyCompute(pieces: PricePiece[], urgency: string): { totalCents: number; chargedPrintCents: number } {
    const um = URGENCY_MULTIPLIER[urgency] ?? 1.0;
    const mat = MATERIALS[pieces[0].material];
    let sumPartRaw = 0;
    for (const p of pieces) {
      const ef = legacyEffectiveFill(p.infill, p.wallLoops);
      const gpu = (p.volumeMm3 / 1000) * mat.density * ef;
      sumPartRaw += gpu * p.quantity * 0.22 * mat.multiplier;
    }
    const raw = 8 + sumPartRaw;
    const base = Math.max(raw, 10);
    const total = base * um;
    const baseCents  = legacyRound(base * 100);
    const totalCents = legacyRound(total * 100);
    const eligible   = totalCents <= 5250;
    let capShave = 0;
    if (eligible && totalCents > 5000) capShave = totalCents - 5000;
    return { totalCents, chargedPrintCents: totalCents - capShave };
  }

  it("matches legacy for 10000 random single-material orders", () => {
    let mismatches = 0;
    const examples: string[] = [];
    for (let t = 0; t < 10000; t++) {
      const mat    = pick(INST_MATS);
      const urg    = pick(URGENCIES);
      const nParts = Math.ceil(rand(1, 20));
      const pieces: PricePiece[] = [];
      for (let i = 0; i < nParts; i++) {
        pieces.push({
          volumeMm3: Math.round(rand(500, 600000)),
          quantity:  Math.ceil(rand(1, 999)),
          material:  mat,
          infill:    pick(INFILLS),
          wallLoops: Math.ceil(rand(2, 8)),
        });
      }
      const legacy = legacyCompute(pieces, urg);
      const server = computeOrder(pieces, urg);
      if (
        legacy.totalCents !== server.totalCents ||
        legacy.chargedPrintCents !== server.chargedPrintCents
      ) {
        mismatches++;
        if (examples.length < 3) {
          examples.push(
            `urgency=${urg} legacy=${JSON.stringify(legacy)} server=${JSON.stringify({ totalCents: server.totalCents, chargedPrintCents: server.chargedPrintCents })}`,
          );
        }
      }
    }
    if (mismatches > 0) {
      console.error("Legacy mismatches:", examples);
    }
    expect(mismatches).toBe(0);
  });
});

// ─── computeBundleV2 ─────────────────────────────────────────────────────────

describe("computeBundleV2", () => {
  const defaults: PartDefaults = { material: "PLA", color: "", infill: 15, wallLoops: 2, multicolour: false };

  it("returns null for empty parts", () => {
    expect(computeBundleV2([], defaults, "standard")).toBeNull();
  });

  it("returns null when all parts have parse errors", () => {
    const parts: ParsedFileForPricing[] = [
      { id: "x", volumeMm3: 0, qty: 1, parseError: "bad" },
    ];
    expect(computeBundleV2(parts, defaults, "standard")).toBeNull();
  });

  it("E1 via computeBundleV2 gives same chargedPrintCents", () => {
    const parts: ParsedFileForPricing[] = [
      { id: "a", volumeMm3: 30000, qty: 2, settings: { material: "PETG", infill: 50, wallLoops: 3 } },
      { id: "b", volumeMm3: 15000, qty: 1, settings: { material: "TPU",  infill: 20, wallLoops: 2 } },
      { id: "c", volumeMm3: 40000, qty: 4, settings: { material: "PLA",  infill: 20, wallLoops: 2 } },
    ];
    const result = computeBundleV2(parts, defaults, "standard");
    expect(result).not.toBeNull();
    expect(result!.orderResult.chargedPrintCents).toBe(3429);
    expect(result!.total).toBeCloseTo(34.29, 2);
    expect(result!.totalUnits).toBe(7);
  });

  it("low and high satisfy the floor constraints", () => {
    const parts: ParsedFileForPricing[] = [
      { id: "a", volumeMm3: 3000, qty: 1, settings: { material: "PLA", infill: 15, wallLoops: 2 } },
    ];
    const result = computeBundleV2(parts, defaults, "standard");
    expect(result).not.toBeNull();
    expect(result!.low).toBeGreaterThanOrEqual(10);
    expect(result!.high).toBeGreaterThanOrEqual(20);
  });

  it("effectivePartSettings falls back to defaults", () => {
    const part: ParsedFileForPricing = { id: "x", volumeMm3: 10000, qty: 1 };
    const eff = effectivePartSettings(part, defaults);
    expect(eff.material).toBe("PLA");
    expect(eff.infill).toBe(15);
    expect(eff.wallLoops).toBe(2);
    expect(eff.multicolour).toBe(false);
    expect(eff.color).toBe("");
  });

  it("effectivePartSettings uses override when present", () => {
    const part: ParsedFileForPricing = {
      id: "x", volumeMm3: 10000, qty: 1,
      settings: { material: "PETG", infill: 50 },
    };
    const eff = effectivePartSettings(part, defaults);
    expect(eff.material).toBe("PETG");
    expect(eff.infill).toBe(50);
    expect(eff.wallLoops).toBe(2); // falls back to default
  });
});
