export const CHECKOUT_V3_READY = import.meta.env.VITE_CHECKOUT_V3 !== "0";

/** Countries supported by instant checkout (flat €5.90 shipping).
 *  Keep in sync with SHIP_COUNTRIES in supabase/functions/create-instant-checkout/index.ts */
export const SHIP_COUNTRIES = ["ES","PT","FR","DE","IT","NL","BE","LU","AT","IE","PL","DK","SE","FI"] as const;
export type ShipCountryCode = typeof SHIP_COUNTRIES[number];

/** Reason why instant buy is not available for an order. */
export type IneligibleReason =
  | 'over-limit'
  | `material:${string}`
  | `oversize:${string}`
  | 'multicolour'
  | 'file-too-large'
  | 'city-not-shipped'
  | 'manual-review-open'
  | 'flag-off';

export interface InstantBuyStatusParams {
  adminMode: boolean;
  anyMulticolour: boolean;
  /** `order.reasons` from `priceOrder()` — over-limit, material:x, oversize:x */
  orderReasons: string[];
  filesWithinVerifyLimit: boolean;
  flagReady: boolean;
  forceQuoteOnly: boolean;
  showManualReview: boolean;
}

export interface InstantBuyStatus {
  eligible: boolean;
  reasons: IneligibleReason[];
}

/** Single source of truth for instant-buy eligibility.
 *  `instantBuyEligible` in the UI must come only from this function. */
export function getInstantBuyStatus(p: InstantBuyStatusParams): InstantBuyStatus {
  const reasons: IneligibleReason[] = [];

  if (!p.flagReady || p.adminMode) reasons.push('flag-off');
  if (p.forceQuoteOnly) reasons.push('city-not-shipped');
  if (!p.filesWithinVerifyLimit) reasons.push('file-too-large');
  if (p.anyMulticolour) reasons.push('multicolour');
  if (p.showManualReview) reasons.push('manual-review-open');

  // Reasons from priceOrder: over-limit, material:<x>, oversize:<x>
  for (const r of p.orderReasons) {
    if (!reasons.some(x => x === r)) reasons.push(r as IneligibleReason);
  }

  return { eligible: reasons.length === 0, reasons };
}

// Legacy params interface kept for existing tests — use getInstantBuyStatus for new code.
export interface InstantBuyParams {
  adminMode: boolean;
  anyMulticolour: boolean;
  eligible: boolean;
  filesWithinVerifyLimit: boolean;
  flagReady: boolean;
}

export function instantBuyAllowed(p: InstantBuyParams): boolean {
  return !p.adminMode && !p.anyMulticolour && p.eligible && p.filesWithinVerifyLimit && p.flagReady;
}
