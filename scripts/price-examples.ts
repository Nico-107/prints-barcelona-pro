// Generates every example price shown on pricing pages by calling the real V3 engine (priceOrder).
// Run: bun scripts/price-examples.ts
import { EST, priceOrder, type PartEstimate } from '../src/lib/estimator/core';

export const EXAMPLES: Array<{ id: string; material: string; grams: number; hours: number }> = [
  { id: 'clip-5g-pla', material: 'PLA', grams: 5, hours: 0.5 },
  { id: 'deco-30g-pla', material: 'PLA', grams: 30, hours: 0.5 },
  { id: 'shelf-25g-pla', material: 'PLA', grams: 25, hours: 1.5 },
  { id: 'vesa-40g-pla', material: 'PLA', grams: 40, hours: 2 },
  { id: 'phone-40g-pla', material: 'PLA', grams: 40, hours: 2.5 },
  { id: 'figure-90g-pla', material: 'PLA', grams: 90, hours: 5 },
  { id: 'figure-200g-pla', material: 'PLA', grams: 200, hours: 12 },
  { id: 'helmet-350g-pla', material: 'PLA', grams: 350, hours: 16 },
  { id: 'wheel-25g-petg', material: 'PETG', grams: 25, hours: 1.5 },
  { id: 'dish-35g-petg', material: 'PETG', grams: 35, hours: 1.5 },
  { id: 'bracket-80g-petg', material: 'PETG', grams: 80, hours: 2 },
  { id: 'proto-120g-petg', material: 'PETG', grams: 120, hours: 6 },
  { id: 'proto-150g-petg', material: 'PETG', grams: 150, hours: 7 },
  { id: 'case-200g-abs', material: 'ABS', grams: 200, hours: 5 },
  { id: 'cover-35g-tpu', material: 'TPU', grams: 35, hours: 2 },
  { id: 'adapter-60g-nylon', material: 'Nylon', grams: 60, hours: 4 },
];

export function engineCents(material: string, grams: number, hours: number): number {
  const estimate: PartEstimate = {
    orientation: 0, orientationName: 'as uploaded', plasticCm3: 0, supportCm3: 0, grams,
    timeSec: hours * 3600, fixedSec: EST.timeCoef[0], sizeXMm: 40, sizeYMm: 40, heightMm: 20, fitsPlate: true,
  };
  return priceOrder([{ name: 'x', quantity: 1, material, estimate }], 'standard').totalCents;
}

if ((import.meta as { main?: boolean }).main) {
  console.log('| example | material | grams | hours | engine € |');
  for (const e of EXAMPLES) console.log(`| ${e.id} | ${e.material} | ${e.grams} | ${e.hours} | ${(engineCents(e.material, e.grams, e.hours) / 100).toFixed(2)} |`);
}
