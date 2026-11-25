// Deterministic build identifier for every edge function. Written by
// scripts/checkpoint/bump-version.mjs (prebuild) to the first 10 hex chars of a sha256
// over the paths and contents of every file under supabase/functions/ except this one.
// Never a date or git SHA, so the tree stays clean after a build.

export const BUILD_ID = "v5-38b933f302";
export const PRICING_VERSION = 5;
export const CAPABILITIES: readonly string[] = [
  "quote_v5",
  "shipping_v5",
  "price_updated",
  "scale",
  "chunked_upload",
  "pickup_sevilla",
  "test_orders",
  "owner_email_v2",
];

export interface HealthResponse {
  fn: string;
  build: string;
  pricingVersion: number;
  capabilities: readonly string[];
}

export function healthResponse(fnName: string): HealthResponse {
  return { fn: fnName, build: BUILD_ID, pricingVersion: PRICING_VERSION, capabilities: CAPABILITIES };
}
