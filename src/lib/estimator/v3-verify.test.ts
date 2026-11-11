import { describe, it, expect } from 'vitest';
import { EST, priceOrder, tierCostEur } from './core';
import type { OrderPartInput, PartEstimate } from './core';

/** Build a minimal PartEstimate from grams + timeSec (skips real STL analysis) */
function fakePart(grams: number, timeSec: number, material = 'PLA'): OrderPartInput {
  const estimate: PartEstimate = {
    orientation: 0, orientationName: 'as uploaded',
    plasticCm3: grams / (EST.materials[material]?.density ?? 1.24),
    supportCm3: 0, grams,
    timeSec, fixedSec: EST.timeCoef[0],
    sizeXMm: 50, sizeYMm: 50, heightMm: 20, fitsPlate: true,
  };
  return { name: 'part', quantity: 1, material, estimate };
}

/** Approximate timeSec that yields a given EUR total for a single-part order */
function timeSecForEur(targetEur: number, grams: number, material = 'PLA'): number {
  // rawPart = priceMult * (grams * plasticEurPerG + timeCost)
  // timeCost = targetEur/priceMult - grams*plasticEurPerG
  const m = EST.materials[material];
  const plasticEur = grams * EST.plasticEurPerG * m.priceMult;
  const timeCostNeeded = targetEur / m.priceMult - grams * EST.plasticEurPerG;
  // Invert tierCostEur: find hours
  let hours = 0;
  let remaining = timeCostNeeded;
  for (const t of EST.timeTiers) {
    const bandwidth = t.upToH - (hours);
    const cost = bandwidth * t.eurPerH;
    if (remaining <= cost) { hours += remaining / t.eurPerH; break; }
    remaining -= cost; hours = t.upToH;
  }
  // For a single part: orderSec = plates*fixed + marg = fixed + (timeSec - fixed) = timeSec
  // weight = (marg + fixed/1) / orderSec = 1
  // So raw = priceMult*(grams*plasticEurPerG + timeCost*1)
  // We need timeSec such that: timeSec/3600 ≈ hours (for the order-level time), plus fixed
  return hours * 3600 + EST.timeCoef[0];
}

describe('V3/EST engine — pricing verification', () => {
  it('has no setup fee', () => {
    expect(EST.setupEur).toBe(0);
  });

  it('minimum is 10 EUR', () => {
    expect(EST.minimumEur).toBe(10);
  });

  it('5 g PLA alone → 10 € (minimum as explicit minAdjCents, parts at raw value)', () => {
    const part = fakePart(5, EST.timeCoef[0] + 100);
    const order = priceOrder([part], 'standard');
    expect(order.setupCents).toBe(0);
    expect(order.totalCents).toBe(1000); // €10
    expect(order.minAdjCents).toBeGreaterThan(0); // explicit minimum-adjustment line
    // parts stay at raw value (not inflated to fill the minimum)
    expect(order.parts[0].costCents).toBeLessThan(1000);
    expect(order.parts[0].costCents + order.minAdjCents + order.setupCents).toBe(order.baseCents);
  });

  it('300 g PLA (13.6 h print) → ~66 € with no setup fee', () => {
    // 300g at 13.6h: plastic=16.5€, time=49.5€ → raw=66€
    const timeSec = 13.6 * 3600;
    const part = fakePart(300, timeSec);
    const order = priceOrder([part], 'standard');
    expect(order.setupCents).toBe(0);
    // Should be close to 6600 cents (the exact value depends on how timeSec maps to orderSec)
    expect(order.totalCents).toBeGreaterThanOrEqual(6500);
    expect(order.totalCents).toBeLessThanOrEqual(6700);
  });

  it('66 € part + 2 € part → 68 € total (no 8€ setup fee added)', () => {
    // Build parts with timeSec that yield the target EUR each
    const timeSec66 = timeSecForEur(66, 300);
    const timeSec2 = timeSecForEur(2, 10);
    const partA = fakePart(300, timeSec66);
    const partA2: OrderPartInput = { ...partA, name: 'big' };
    const partB = fakePart(10, timeSec2);
    const partB2: OrderPartInput = { ...partB, name: 'small' };
    const order = priceOrder([partA2, partB2], 'standard');
    expect(order.setupCents).toBe(0);
    // Should NOT be 76€ (68 + 8 setup fee)
    expect(order.totalCents).not.toBe(7600);
    // Should be close to 68€ (may differ slightly due to order-level time pooling)
    expect(order.totalCents).toBeGreaterThanOrEqual(6700);
    expect(order.totalCents).toBeLessThanOrEqual(6900);
  });

  it('three tiny parts → 10 € total (minimum once per ORDER, not per part)', () => {
    const tinyPart = fakePart(1, EST.timeCoef[0] + 10);
    const parts: OrderPartInput[] = [
      { ...tinyPart, name: 'a' },
      { ...tinyPart, name: 'b' },
      { ...tinyPart, name: 'c' },
    ];
    const order = priceOrder(parts, 'standard');
    expect(order.setupCents).toBe(0);
    expect(order.totalCents).toBe(1000); // €10, NOT €30 (3×€10)
    expect(order.minAdjCents).toBeGreaterThan(0); // explicit minimum-adjustment line
  });

  it('invariant: parts + setup + minAdj + express === total', () => {
    const part = fakePart(5, EST.timeCoef[0] + 100);
    const order = priceOrder([part], 'standard');
    const sumParts = order.parts.reduce((a, p) => a + p.costCents, 0);
    expect(sumParts + order.setupCents + order.minAdjCents + order.expressCents).toBe(order.totalCents);
  });
});
