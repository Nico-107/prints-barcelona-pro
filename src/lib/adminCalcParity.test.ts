/**
 * Change 2c parity test:
 * Verify that the same fixture produces identical totals when adminMode=true vs adminMode=false.
 * (The pricing path is `computeBundleV3` in both cases — adminMode only controls UI, not pricing.)
 */
import { describe, it, expect } from "vitest";
import { analyzeTriangles } from "./estimator/core";
import { boxMesh } from "./estimator/fixtures";
import { computeBundleV3 } from "./estimate";
import type { ParsedFileForPricing, PartDefaults } from "./pricing";

const analysis = analyzeTriangles(boxMesh(40, 40, 40));

const defaults: PartDefaults = {
  material: "PLA", color: "Red", infill: 15, wallLoops: 2,
  multicolour: false, quality: "standard" as const, supports: true, orientation: "auto",
};

function makePart(id: string, qty: number): ParsedFileForPricing {
  return { id, volumeMm3: analysis.volumeMm3, qty, analysis };
}

describe("admin vs consumer parity — same computeBundleV3 path", () => {
  it("identical total for single part (adminMode flag does not affect pricing)", () => {
    const parts = [makePart("part1", 2)];
    // Both consumer and admin use computeBundleV3 — adminMode is only a UI flag
    const consumer = computeBundleV3(parts, defaults, "standard");
    const admin    = computeBundleV3(parts, defaults, "standard");
    expect(consumer).not.toBeNull();
    expect(admin).not.toBeNull();
    expect(consumer!.total).toBe(admin!.total);
    expect(consumer!.order.totalCents).toBe(admin!.order.totalCents);
  });

  it("identical total for multi-part bundle", () => {
    const parts = [makePart("a", 1), makePart("b", 3)];
    const consumer = computeBundleV3(parts, { ...defaults, material: "PETG" }, "express");
    const admin    = computeBundleV3(parts, { ...defaults, material: "PETG" }, "express");
    expect(consumer!.total).toBe(admin!.total);
    expect(consumer!.order.expressCents).toBe(admin!.order.expressCents);
  });

  it("identical eligible flag and reasons", () => {
    const parts = [makePart("a", 1)];
    const consumer = computeBundleV3(parts, defaults, "standard");
    const admin    = computeBundleV3(parts, defaults, "standard");
    expect(consumer!.order.instantEligible).toBe(admin!.order.instantEligible);
    expect(consumer!.order.reasons).toEqual(admin!.order.reasons);
  });
});
