// Shared quote builder used by the UI, the admin calculator and the create-instant-checkout
// server. In v5 mode it applies the deliveryV5 shipping rules; in legacy mode the UI calls
// `src/__checkpoint__/legacy/quoteLegacy.ts` instead, so this module only needs the v5 path.

import { estimatePart, priceOrder, type MeshAnalysis, type QualityKey } from "./engine.ts";
import { deliveryV5, type Fulfillment, DEFAULT_SHIPPING } from "./shipping.ts";

export interface QuoteV5PieceInput {
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

export interface QuoteV5Input {
  pieces: QuoteV5PieceInput[];
  urgency: "standard" | "express" | "urgent";
  fulfillment: Fulfillment;
  pageGroup: "local" | "non_local";
  variant?: "A" | "B";
  promoCode?: string;
}

export interface QuoteV5 {
  partsSubtotalCents: number;
  discountedPartsCents: number;
  promoPct: number;
  promoDiscountCents: number;
  shippingCents: number;
  totalCents: number;
  oversize: boolean;
}

const PROMO_CODES: Record<string, { pct: number }> = {
  DIMENSION11: { pct: 10 },
};

export function quoteV5(input: QuoteV5Input): QuoteV5 {
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
  const promo = input.promoCode ? PROMO_CODES[input.promoCode.toUpperCase()] : undefined;
  const promoPct = promo?.pct ?? 0;
  const promoDiscountCents = promo ? Math.round(partsSubtotalCents * promo.pct / 100) : 0;
  const discountedPartsCents = Math.max(0, partsSubtotalCents - promoDiscountCents);
  const delivery = deliveryV5(
    {
      partsSubtotalCents,
      discountedPartsCents,
      fulfillment: input.fulfillment,
      pageGroup: input.pageGroup,
      variant: input.variant,
    },
    DEFAULT_SHIPPING,
  );
  const oversize = order.reasons.some((r) => r.startsWith("oversize"));
  return {
    partsSubtotalCents,
    discountedPartsCents,
    promoPct,
    promoDiscountCents,
    shippingCents: delivery.shippingCents,
    totalCents: delivery.totalCents,
    oversize,
  };
}
