export const CHECKOUT_V3_READY = import.meta.env.VITE_CHECKOUT_V3 === "1";

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
