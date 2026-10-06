import { describe, it, expect } from "vitest";
import { analyzeTriangles, priceOrder, estimatePart } from "./estimator/core";
import { boxMesh, tBeamMesh } from "./estimator/fixtures";
import { computeBundleV3 } from "./estimate";
import type { ParsedFileForPricing, PartDefaults } from "./pricing";

const boxAnalysis = analyzeTriangles(boxMesh(40, 40, 40));
const tAnalysis = analyzeTriangles(tBeamMesh());

const defaults: PartDefaults = {
  material: "PETG", color: "", infill: 15, wallLoops: 2,
  multicolour: false, quality: "standard" as const, supports: true, orientation: "auto",
};

function makePart(id: string, qty: number, analysis = boxAnalysis, settings?: Partial<PartDefaults>): ParsedFileForPricing {
  return { id, volumeMm3: analysis.volumeMm3, qty, analysis, settings };
}

describe("computeBundleV3 invariants", () => {
  it("returns null when no valid parts", () => {
    expect(computeBundleV3([], defaults, "standard")).toBeNull();
    expect(computeBundleV3([{ id: "x", volumeMm3: 0, qty: 1, parseError: "bad" }], defaults, "standard")).toBeNull();
  });

  it("Stripe lines add up to order.totalCents", () => {
    const b = computeBundleV3([makePart("a", 2), makePart("b", 1, tAnalysis, { material: "Nylon", quality: "high" })], defaults, "standard")!;
    expect(b).not.toBeNull();
    const sum = b.orderResult.parts.reduce((s, p) => s + p.costCents, 0)
      + b.orderResult.setupCents + b.orderResult.minAdjCents + b.orderResult.expressCents;
    expect(sum).toBe(b.order.totalCents);
  });

  it("express adds to totalCents but not baseCents", () => {
    const std = computeBundleV3([makePart("a", 1)], defaults, "standard")!;
    const exp = computeBundleV3([makePart("a", 1)], defaults, "express")!;
    expect(exp.order.expressCents).toBeGreaterThan(0);
    expect(exp.order.totalCents).toBeGreaterThan(std.order.totalCents);
    expect(exp.orderResult.chargedPrintCents).toBe(exp.order.totalCents);
  });

  it("eligible rules: instant materials pass, non-instant fail", () => {
    const eligible = computeBundleV3([makePart("a", 1)], { ...defaults, material: "PLA" }, "standard")!;
    expect(eligible.orderResult.eligible).toBe(true);
    const notEligible = computeBundleV3([makePart("a", 1)], { ...defaults, material: "HIPS" }, "standard")!;
    expect(notEligible.orderResult.eligible).toBe(false);
  });

  it("savedByOrientationEur is >= 0", () => {
    const b = computeBundleV3([makePart("a", 1, tAnalysis)], defaults, "standard")!;
    expect(b.savedByOrientationEur).toBeGreaterThanOrEqual(0);
  });

  it("fixture order: two box PETG x2, one tBeam Nylon high x1 — values match priceOrder directly", () => {
    const parts = [makePart("a", 2), makePart("b", 1, tAnalysis, { material: "Nylon", quality: "high" })];
    const b = computeBundleV3(parts, defaults, "standard")!;

    const estA = estimatePart(boxAnalysis, { material: "PETG", infillPct: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto" });
    const estB = estimatePart(tAnalysis, { material: "Nylon", infillPct: 15, wallLoops: 2, quality: "high", supports: true, orientation: "auto" });
    const expected = priceOrder([
      { name: "a", quantity: 2, material: "PETG", estimate: estA },
      { name: "b", quantity: 1, material: "Nylon", estimate: estB },
    ], "standard");

    expect(b.order.totalCents).toBe(expected.totalCents);
    expect(b.order.setupCents).toBe(expected.setupCents);
    expect(b.order.orderHours).toBeCloseTo(expected.orderHours, 5);
    expect(b.total).toBe(expected.totalCents / 100);
    expect(b.low).toBe(b.total);
    expect(b.high).toBe(b.total);
  });

  it("low === high === total (no range)", () => {
    const b = computeBundleV3([makePart("a", 3)], defaults, "standard")!;
    expect(b.low).toBe(b.total);
    expect(b.high).toBe(b.total);
  });
});
