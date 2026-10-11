import { describe, it, expect } from "vitest";
import {
  BATCH_TABLE,
  BATCH_REF_PART,
  BATCH_QUANTITIES,
  BATCH_MATERIALS,
  ASA_50_UNIT_CENTS,
  BatchRow,
} from "./B2BLanding";
import { EST, priceOrder } from "@/lib/estimator/core";
import type { PartEstimate, OrderPartInput } from "@/lib/estimator/core";

// Re-implement the function under test inline so the test is independent of
// internal module scope — any deviation from the spec fails the test.
function refUnitPriceCents(material: string, qty: number): number {
  const estimate: PartEstimate = {
    ...(BATCH_REF_PART as PartEstimate),
    orientation: 0,
    orientationName: "as uploaded",
    plasticCm3: BATCH_REF_PART.grams / (EST.materials[material]?.density ?? 1.27),
  };
  const input: OrderPartInput = { name: "ref", quantity: qty, material, estimate };
  const order = priceOrder([input], "standard");
  return Math.round(order.baseCents / qty);
}

describe("BATCH_TABLE", () => {
  it("covers exactly the declared materials and quantities", () => {
    expect(BATCH_TABLE.map((r) => r.material)).toEqual([...BATCH_MATERIALS]);
    for (const row of BATCH_TABLE) {
      expect(row.prices).toHaveLength(BATCH_QUANTITIES.length);
    }
  });

  it("matches priceOrder() for every material × quantity combination", () => {
    for (const row of BATCH_TABLE as BatchRow[]) {
      BATCH_QUANTITIES.forEach((qty, i) => {
        const expected = refUnitPriceCents(row.material, qty);
        expect(row.prices[i]).toBe(expected);
      });
    }
  });

  it("unit price decreases or stays flat as quantity increases (volume discount)", () => {
    for (const row of BATCH_TABLE as BatchRow[]) {
      for (let i = 1; i < row.prices.length; i++) {
        expect(row.prices[i]).toBeLessThanOrEqual(row.prices[i - 1]);
      }
    }
  });

  it("minimum order price is applied: unit price × 1 >= minimumEur × 100", () => {
    for (const row of BATCH_TABLE as BatchRow[]) {
      expect(row.prices[0]).toBeGreaterThanOrEqual(EST.minimumEur * 100);
    }
  });

  it("HeroVisual unit price (ASA_50_UNIT_CENTS) matches the batch table helper for 50 units ASA", () => {
    // ASA_50_UNIT_CENTS is the value passed to HeroVisual as unitPrice50ASACents
    const expectedCents = refUnitPriceCents("ASA", 50);
    expect(ASA_50_UNIT_CENTS).toBe(expectedCents);

    // Sanity: value is a positive number and formats correctly
    expect(ASA_50_UNIT_CENTS).toBeGreaterThan(0);
    const formatted = `€${(ASA_50_UNIT_CENTS / 100).toFixed(2)}`;
    expect(formatted).toMatch(/^€\d+\.\d{2}$/);
  });
});
