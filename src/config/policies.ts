// owner: set REFUND_IF_UNPRINTABLE to true only if this is your real policy.
// When false, experiment modal_actions_r1 variant C omits the "no se cobra" promise.
export const REFUND_IF_UNPRINTABLE = false;

// AUTUMN-DISCOUNT-START
// Autumn discount settings — kept in sync with create-instant-checkout edge function.
// scripts/check-estimator-sync.mjs fails the build if the two copies differ.
export const AUTUMN_DISCOUNT = {
  pct: 10,
  minCents: 2000,       // minimum print subtotal in cents (20.00 €)
  endsAt: "2026-11-30T22:59:59Z",  // 30 Nov 2026 23:59 Europe/Madrid = UTC 22:59
} as const;
// AUTUMN-DISCOUNT-END
