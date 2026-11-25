// D-2 / S4 — Shipping v5 rules. Used on client (via @pricing) and server (via relative import).
// Legacy numbers continue to live in `src/__checkpoint__/legacy/deployedServer.ts` for the
// hotfix oracle; this module is what the UI/server use once `useServerCapabilities()` reports
// `quote_v5`.

export interface ShippingConfig {
  flatCents: number; // default 490 — €4,90
  freeFromCents: number; // default 3000 — free from €30 parts subtotal (after discounts)
  charmCapCents: number; // default 3090 — delivered price cap below the free threshold
}

export const DEFAULT_SHIPPING: ShippingConfig = {
  flatCents: 490,
  freeFromCents: 3000,
  charmCapCents: 3090,
};

export type Fulfillment = "pickup" | "shipping";

export interface DeliveryInput {
  partsSubtotalCents: number;
  discountedPartsCents: number;
  fulfillment: Fulfillment;
  pageGroup: "local" | "non_local";
  variant?: "A" | "B";
}

export interface DeliveryResult {
  shippingCents: number;
  totalCents: number;
  mode: "pickup" | "included" | "upfront" | "free";
  label: "pickup" | "delivered" | "upfront" | "free";
}

function charmCents(cents: number): number {
  return Math.max(990, Math.floor((cents - 90) / 100 + 0.5) * 100 + 90);
}

export function deliveryV5(input: DeliveryInput, cfg: ShippingConfig = DEFAULT_SHIPPING): DeliveryResult {
  if (input.fulfillment === "pickup") {
    return {
      shippingCents: 0,
      totalCents: input.discountedPartsCents,
      mode: "pickup",
      label: "pickup",
    };
  }
  if (input.discountedPartsCents >= cfg.freeFromCents) {
    return {
      shippingCents: 0,
      totalCents: input.discountedPartsCents,
      mode: "free",
      label: "free",
    };
  }
  if (input.pageGroup === "non_local") {
    const rawTotal = input.discountedPartsCents + cfg.flatCents;
    const totalCents = Math.min(charmCents(rawTotal), cfg.charmCapCents);
    const shippingCents = totalCents - input.discountedPartsCents;
    return { shippingCents, totalCents, mode: "included", label: "delivered" };
  }
  // Local page with shipping fulfillment: A = delivered (one total), B = upfront "+4,90 €".
  if (input.variant === "B") {
    return {
      shippingCents: cfg.flatCents,
      totalCents: input.discountedPartsCents + cfg.flatCents,
      mode: "upfront",
      label: "upfront",
    };
  }
  const rawTotal = input.discountedPartsCents + cfg.flatCents;
  const totalCents = charmCents(rawTotal);
  const shippingCents = totalCents - input.discountedPartsCents;
  return { shippingCents, totalCents, mode: "included", label: "delivered" };
}
