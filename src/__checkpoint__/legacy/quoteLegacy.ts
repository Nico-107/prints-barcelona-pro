// Legacy-mode UI quote: computes the total that must appear in the UI (toggle, breakdown,
// sticky total, Buy label, mobile bar, non-local "envío incluido" totals, toasts) while
// `useServerCapabilities()` still reports the pre-v5 server (MASTER_PROMPT §D-2, §H1).
//
// It is a thin bridge over `src/__checkpoint__/legacy/deployedServer.ts` so that every UI
// number equals, to the cent, what the deployed edge function will charge today.
//
// Promo application: DIMENSION11 → 10 % off the charm-rounded print total (promo code behaviour
// of the deployed server, which applies the promo after charm rounding and before shipping).

import {
  EST,
  analyzeTriangles,
  estimatePart,
  priceOrder,
  shippingChargeCents,
  computePromoDiscountCents,
  type MeshAnalysis,
  type QualityKey,
} from "./deployedServer";

export interface LegacyPieceInput {
  analysis: MeshAnalysis;
  material: string;
  infill: number;
  wallLoops: number;
  quality: QualityKey;
  supports: boolean;
  orientation: "auto" | number;
  quantity: number;
  name?: string;
}

export interface LegacyQuoteInput {
  pieces: LegacyPieceInput[];
  urgency: "standard" | "express" | "urgent";
  fulfillment: "pickup" | "shipping";
  promoCode?: string;
}

export interface LegacyQuote {
  partsSubtotalCents: number;
  discountedPartsCents: number;
  promoPct: number;
  promoDiscountCents: number;
  shippingCents: number;
  totalCents: number; // final Buy / Stripe total
  oversize: boolean;
}

export function legacyQuote(input: LegacyQuoteInput): LegacyQuote {
  const estimates = input.pieces.map((p) =>
    estimatePart(p.analysis, {
      material: p.material,
      infillPct: p.infill,
      wallLoops: p.wallLoops,
      quality: p.quality,
      supports: p.supports,
      orientation: p.orientation,
    }),
  );
  const order = priceOrder(
    input.pieces.map((p, i) => ({
      name: p.name ?? `piece-${i + 1}`,
      quantity: p.quantity,
      material: p.material,
      estimate: estimates[i],
    })),
    input.urgency,
    { v4: true },
  );
  const partsSubtotalCents = order.totalCents;
  const { pct, cents } = computePromoDiscountCents(input.promoCode, partsSubtotalCents);
  const discountedPartsCents = Math.max(0, partsSubtotalCents - cents);
  const shipping = shippingChargeCents(input.fulfillment, discountedPartsCents);
  const totalCents = discountedPartsCents + shipping;
  const oversize = order.reasons.some((r) => r.startsWith("oversize"));
  return {
    partsSubtotalCents,
    discountedPartsCents,
    promoPct: pct,
    promoDiscountCents: cents,
    shippingCents: shipping,
    totalCents,
    oversize,
  };
}

// Convenience synthetic mesh builders for deterministic fixture tests.
export function cubeTriangles(sizeMm: number): Float32Array {
  const s = sizeMm;
  // 12 triangles forming an axis-aligned cube from (0,0,0) to (s,s,s).
  const v = (x: number, y: number, z: number) => [x * s, y * s, z * s];
  const faces: number[][] = [
    // -Z (bottom)
    [...v(0, 0, 0), ...v(1, 1, 0), ...v(1, 0, 0)],
    [...v(0, 0, 0), ...v(0, 1, 0), ...v(1, 1, 0)],
    // +Z (top)
    [...v(0, 0, 1), ...v(1, 0, 1), ...v(1, 1, 1)],
    [...v(0, 0, 1), ...v(1, 1, 1), ...v(0, 1, 1)],
    // -Y
    [...v(0, 0, 0), ...v(1, 0, 0), ...v(1, 0, 1)],
    [...v(0, 0, 0), ...v(1, 0, 1), ...v(0, 0, 1)],
    // +Y
    [...v(0, 1, 0), ...v(0, 1, 1), ...v(1, 1, 1)],
    [...v(0, 1, 0), ...v(1, 1, 1), ...v(1, 1, 0)],
    // -X
    [...v(0, 0, 0), ...v(0, 0, 1), ...v(0, 1, 1)],
    [...v(0, 0, 0), ...v(0, 1, 1), ...v(0, 1, 0)],
    // +X
    [...v(1, 0, 0), ...v(1, 1, 0), ...v(1, 1, 1)],
    [...v(1, 0, 0), ...v(1, 1, 1), ...v(1, 0, 1)],
  ];
  return Float32Array.from(faces.flat());
}

export function analyzeCube(sizeMm: number) {
  return analyzeTriangles(cubeTriangles(sizeMm));
}

// EST re-exported for callers that want to format grams/hours consistently.
export { EST };
