export const CHECKOUT_V3_READY = import.meta.env.VITE_CHECKOUT_V3 === "1";

/** Countries supported by instant checkout (flat €5.90 shipping).
 *  Keep in sync with SHIP_COUNTRIES in supabase/functions/create-instant-checkout/index.ts */
export const SHIP_COUNTRIES = ["ES","PT","FR","DE","IT","NL","BE","LU","AT","IE","PL","DK","SE","FI"] as const;
export type ShipCountryCode = typeof SHIP_COUNTRIES[number];

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
