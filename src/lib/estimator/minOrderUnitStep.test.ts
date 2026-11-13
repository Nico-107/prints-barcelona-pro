import { describe, it, expect } from "vitest";
import { priceOrder } from "./core";
import type { OrderPartInput, PartEstimate } from "./core";

/**
 * Conv 1.3 — subtotal = max(sum, 10 € + 1 € × (units − 1)).
 *
 * The spec gives this canonical table for a 4,02 € part (both sides —
 * client engine and server — must return identical cents):
 *   1 unit  → 10,00 €
 *   2 units → 11,00 €
 *   3 units → 12,06 €   (3 × 4,02 = 12,06 > step-floor 12,00)
 *   4 units → 16,08 €   (4 × 4,02 = 16,08 > step-floor 13,00)
 *
 * The rule must never drop below today's price and must never exceed
 * the plain sum once the sum is above the step-floor.
 */

/**
 * Hand-rolled 4,02 € part at "standard" urgency.
 * At EST.plasticEurPerG=0.055 and PLA.priceMult=1, the material cost
 * for 1 unit of 73.0 g ≈ 4,02 €; fixedSec=0 and timeSec=0 isolate the
 * material-only line we need for the canonical table.
 */
function mkPart(grams: number): PartEstimate {
  return {
    plasticCm3: grams / 1.24,
    supportCm3: 0,
    grams,
    timeSec: 0,
    fixedSec: 0,
    sizeXMm: 40,
    sizeYMm: 40,
    heightMm: 30,
    fitsPlate: true,
    orientation: 0,
    orientationName: "as uploaded",
  };
}

// 4,02 € at 0,055 €/g → 73.09 g; pick 73.1 to land at exactly 4,02 cents.
const PART = mkPart(73.09);

describe("MIN_ORDER_UNIT_STEP flag off (default) — unchanged behaviour", () => {
  it("1 small part is still 10,00 €", () => {
    const inp: OrderPartInput = { name: "p", quantity: 1, material: "PLA", estimate: PART };
    const res = priceOrder([inp], "standard");
    expect(res.baseCents).toBe(1000);
  });

  it("2 units of a small part are still 10,00 € (plain min)", () => {
    const inp: OrderPartInput = { name: "p", quantity: 2, material: "PLA", estimate: PART };
    const res = priceOrder([inp], "standard");
    // 2 × 4,02 = 8,04 < 10 → still 10,00 under the plain minimum.
    expect(res.baseCents).toBe(1000);
  });

  it("3 units lift the price above the 10 € floor via the raw sum", () => {
    const inp: OrderPartInput = { name: "p", quantity: 3, material: "PLA", estimate: PART };
    const res = priceOrder([inp], "standard");
    // 3 × 4,02 = 12,06 > 10 → engine returns the raw sum (1206 cents).
    expect(res.baseCents).toBe(1206);
  });
});

describe("MIN_ORDER_UNIT_STEP flag on — Conv 1.3 canonical table", () => {
  const F = { minOrderUnitStep: true } as const;

  it("1 unit → 10,00 €", () => {
    const inp: OrderPartInput = { name: "p", quantity: 1, material: "PLA", estimate: PART };
    const res = priceOrder([inp], "standard", F);
    expect(res.baseCents).toBe(1000);
  });

  it("2 units → 11,00 €", () => {
    const inp: OrderPartInput = { name: "p", quantity: 2, material: "PLA", estimate: PART };
    const res = priceOrder([inp], "standard", F);
    // sum = 2 × 4,02 = 8,04; step-floor = 10 + 1 × 1 = 11 → 11,00 €.
    expect(res.baseCents).toBe(1100);
  });

  it("3 units → 12,06 € (sum beats the step-floor)", () => {
    const inp: OrderPartInput = { name: "p", quantity: 3, material: "PLA", estimate: PART };
    const res = priceOrder([inp], "standard", F);
    // sum = 12,06; step-floor = 10 + 2 × 1 = 12 → max is 12,06.
    expect(res.baseCents).toBe(1206);
  });

  it("4 units → 16,08 € (sum well above the step-floor)", () => {
    const inp: OrderPartInput = { name: "p", quantity: 4, material: "PLA", estimate: PART };
    const res = priceOrder([inp], "standard", F);
    // sum = 16,08; step-floor = 10 + 3 × 1 = 13 → max is 16,08.
    expect(res.baseCents).toBe(1608);
  });

  it("flag-on never drops below flag-off behaviour", () => {
    for (const qty of [1, 2, 3, 4, 5, 10, 20]) {
      const inp: OrderPartInput = { name: "p", quantity: qty, material: "PLA", estimate: PART };
      const off = priceOrder([inp], "standard").baseCents;
      const on = priceOrder([inp], "standard", F).baseCents;
      expect(on).toBeGreaterThanOrEqual(off);
    }
  });
});
