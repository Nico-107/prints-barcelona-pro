// owner: set REFUND_IF_UNPRINTABLE to true only if this is your real policy.
// When false, experiment modal_actions_r1 variant C omits the "no se cobra" promise.
export const REFUND_IF_UNPRINTABLE = false;

/**
 * Stripe payment capture mode (R3). Switches the guarantee line under the buy button.
 * - 'immediate' (default): card is charged immediately on checkout, standard copy.
 * - 'after_review': Stripe manual capture — card is authorised, not charged until Nico
 *   reviews the file. First sentence of guarantee becomes "No te cobramos hasta…".
 * Lovable flips this when the create-instant-checkout edge function is configured
 * for manual capture; keep as 'immediate' until that ships.
 */
export const PAYMENT_CAPTURE_MODE: 'immediate' | 'after_review' = 'immediate';

// AUTUMN-DISCOUNT-START
// Autumn discount settings — kept in sync with create-instant-checkout edge function.
// scripts/check-estimator-sync.mjs fails the build if the two copies differ.
export const AUTUMN_DISCOUNT = {
  pct: 10,
  minCents: 2000,       // minimum print subtotal in cents (20.00 €)
  endsAt: "2026-11-30T22:59:59Z",  // 30 Nov 2026 23:59 Europe/Madrid = UTC 22:59
} as const;
// AUTUMN-DISCOUNT-END
