import { EST, estimatePart, priceOrder, estimateForOrientation } from "./estimator/core";
import type { MeshAnalysis, PartEstimate, OrderPrice } from "./estimator/core";
import type { ParsedFileForPricing, PartDefaults, BundleEstimate } from "./pricing";
import { effectivePartSettings } from "./pricing";

export interface BundleEstimateV3 extends BundleEstimate {
  estimates: PartEstimate[];
  order: OrderPrice;
  orderResult: {
    parts: { costCents: number; gramsPerUnit: number }[];
    setupCents: number;
    minAdjCents: number;
    expressCents: number;
    chargedPrintCents: number;
    eligible: boolean;
  };
  savedByOrientationEur: number;
}

export function computeBundleV3(
  parts: ParsedFileForPricing[],
  defaults: PartDefaults,
  urgency: string,
): BundleEstimateV3 | null {
  const validParts = parts.filter(p => !p.parseError && p.analysis && p.analysis.volumeMm3 > 0);
  if (validParts.length === 0) return null;

  const inputs = validParts.map(p => {
    const eff = effectivePartSettings(p, defaults);
    const estimate = estimatePart(p.analysis!, {
      material: eff.material,
      infillPct: eff.infill,
      wallLoops: eff.wallLoops,
      quality: eff.quality,
      supports: eff.supports,
      orientation: eff.orientation,
    });
    return { name: p.id, quantity: p.qty, material: eff.material, estimate };
  });

  const order = priceOrder(inputs, urgency);

  // savedByOrientationEur: price with orientation 0 minus chosen price (>= 0)
  const worstInputs = validParts.map(p => {
    const eff = effectivePartSettings(p, defaults);
    const e0 = estimateForOrientation(p.analysis!, 0, {
      material: eff.material,
      infillPct: eff.infill,
      wallLoops: eff.wallLoops,
      quality: eff.quality,
      supports: eff.supports,
      orientation: 0,
    });
    return { name: p.id, quantity: p.qty, material: eff.material, estimate: e0 };
  });
  const worstOrder = priceOrder(worstInputs, urgency);
  const savedByOrientationEur = Math.max(0, (worstOrder.totalCents - order.totalCents) / 100);

  let totalGrams = 0;
  let totalUnits = 0;
  for (let i = 0; i < validParts.length; i++) {
    totalGrams += order.parts[i].grams * validParts[i].qty;
    totalUnits += validParts[i].qty;
  }

  const total = order.totalCents / 100;
  const supportHeavy = inputs.some(x => {
    const plasticCm3 = x.estimate.plasticCm3;
    return x.estimate.supportCm3 > 0.10 * plasticCm3;
  });

  return {
    totalGrams,
    totalHours: order.orderHours,
    totalUnits,
    bundlePrice: total,
    total,
    low: total,
    high: total,
    supportHeavy,
    estimates: inputs.map(x => x.estimate),
    order,
    orderResult: {
      parts: order.parts.map(p => ({ costCents: p.costCents, gramsPerUnit: p.grams })),
      setupCents: order.setupCents,
      minAdjCents: order.minAdjCents,
      expressCents: order.expressCents,
      chargedPrintCents: order.totalCents,
      eligible: order.instantEligible,
    },
    savedByOrientationEur,
  };
}
