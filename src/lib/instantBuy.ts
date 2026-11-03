export const CHECKOUT_V3_READY = import.meta.env.VITE_CHECKOUT_V3 !== "0";

/** Countries supported by instant checkout (flat €5.90 shipping).
 *  Keep in sync with SHIP_COUNTRIES in supabase/functions/create-instant-checkout/index.ts */
export const SHIP_COUNTRIES = ["ES","PT","FR","DE","IT","NL","BE","LU","AT","IE","PL","DK","SE","FI"] as const;
export type ShipCountryCode = typeof SHIP_COUNTRIES[number];

/** Client-side instant-buy cap in euros (after discount, excluding shipping).
 *  The shared estimator block (core.ts / supabase edge) still carries the older
 *  €100 ceiling; the server ceiling is raised to match via a separate Lovable
 *  change. Until then, parts between €100–€200 depend on that server change. */
export const INSTANT_LIMIT_EUR = 200;

/** Legitimate maximum single-charge total shown to Stripe = €200 print + €5,90 ship. */
export const MAX_INSTANT_CHARGE = 205.90;

/** Materials that always require human review when urgency is express/urgent. */
export const HARD_MATERIALS = new Set(['Nylon']);

/** Quote-only materials (never instant). */
export const QUOTE_ONLY_MATERIALS = new Set(['HIPS', 'PC', 'PVA', 'PLA-CF', 'PETG-CF', 'Nylon-CF']);

/** Reason why instant buy is not available for an order. */
export type IneligibleReason =
  | 'over-limit'
  | `material:${string}`
  | `oversize:${string}`
  | 'multicolour'
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
  /** Discounted total in EUR, excluding shipping. If provided and ≤ INSTANT_LIMIT_EUR,
   *  the 'over-limit' reason from the shared estimator block is ignored (client cap override). */
  totalAfterDiscountEur?: number;
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
  // file-too-large removed: preparation (ASCII→binary + simplification) ensures checkout
  // copies are always ≤ 28 MB before upload, so the server's re-measure always passes.
  if (p.anyMulticolour) reasons.push('multicolour');
  if (p.showManualReview) reasons.push('manual-review-open');

  // Reasons from priceOrder: over-limit, material:<x>, oversize:<x>
  // Override: when totalAfterDiscountEur ≤ INSTANT_LIMIT_EUR (€200), ignore 'over-limit'
  // from the shared estimator (which still enforces the older €100 cap).
  const withinClientCap = typeof p.totalAfterDiscountEur === 'number'
    && p.totalAfterDiscountEur <= INSTANT_LIMIT_EUR + 0.005;
  for (const r of p.orderReasons) {
    if (r === 'over-limit' && withinClientCap) continue;
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
