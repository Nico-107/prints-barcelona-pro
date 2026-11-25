import { describe, it, expect } from "vitest";
import { analyzeCube, legacyQuote } from "./legacy/quoteLegacy";

// P4 — invariant property tests. Material order PLA ≤ PETG ≤ ABS/ASA ≤ TPU ≤ Nylon.
// Infill / walls / quality / urgency monotonic non-decreasing in price. Deterministic.

const cube = analyzeCube(40);

function priceFor(opts: {
  material: string;
  infill?: number;
  walls?: number;
  quality?: "fast" | "standard" | "fine" | "high" | "ultra";
  urgency?: "standard" | "express" | "urgent";
  quantity?: number;
}): number {
  const q = legacyQuote({
    pieces: [
      {
        analysis: cube,
        material: opts.material,
        infill: opts.infill ?? 15,
        wallLoops: opts.walls ?? 2,
        quality: opts.quality ?? "standard",
        supports: true,
        orientation: "auto",
        quantity: opts.quantity ?? 1,
      },
    ],
    urgency: opts.urgency ?? "standard",
    fulfillment: "pickup",
  });
  return q.totalCents;
}

describe("P4 invariants: material order", () => {
  it("PLA ≤ PETG ≤ ABS, PLA ≤ PETG ≤ ASA, PLA ≤ TPU, PLA ≤ Nylon", () => {
    const pla = priceFor({ material: "PLA" });
    const petg = priceFor({ material: "PETG" });
    const abs = priceFor({ material: "ABS" });
    const asa = priceFor({ material: "ASA" });
    const tpu = priceFor({ material: "TPU" });
    const nylon = priceFor({ material: "Nylon" });
    expect(pla).toBeLessThanOrEqual(petg);
    expect(petg).toBeLessThanOrEqual(abs);
    expect(petg).toBeLessThanOrEqual(asa);
    expect(pla).toBeLessThanOrEqual(tpu);
    expect(pla).toBeLessThanOrEqual(nylon);
  });
});

describe("P4 invariants: non-decreasing in dial-up settings", () => {
  it("infill non-decreasing", () => {
    const seq = [5, 10, 15, 20, 30, 50].map((infill) => priceFor({ material: "PLA", infill }));
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThanOrEqual(seq[i - 1]);
  });
  it("walls non-decreasing", () => {
    const seq = [2, 3, 4].map((walls) => priceFor({ material: "PLA", walls }));
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThanOrEqual(seq[i - 1]);
  });
  it("quality non-decreasing", () => {
    const seq = (["fast", "standard", "fine", "high", "ultra"] as const).map((quality) =>
      priceFor({ material: "PLA", quality }),
    );
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThanOrEqual(seq[i - 1]);
  });
  it("urgency non-decreasing", () => {
    const seq = (["standard", "express", "urgent"] as const).map((urgency) =>
      priceFor({ material: "PLA", urgency }),
    );
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThanOrEqual(seq[i - 1]);
  });
  it("quantity non-decreasing", () => {
    const seq = [1, 2, 3, 5, 10].map((quantity) => priceFor({ material: "PLA", quantity }));
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThanOrEqual(seq[i - 1]);
  });
});

describe("P4 invariants: deterministic", () => {
  it("same input → same cents twice", () => {
    expect(priceFor({ material: "PLA" })).toBe(priceFor({ material: "PLA" }));
    expect(priceFor({ material: "Nylon", infill: 30, walls: 4, quality: "ultra", urgency: "urgent", quantity: 3 })).toBe(
      priceFor({ material: "Nylon", infill: 30, walls: 4, quality: "ultra", urgency: "urgent", quantity: 3 }),
    );
  });
});
