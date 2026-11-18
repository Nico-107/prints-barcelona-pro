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

// Kept for checkoutV3.ts type-compatibility only; discount period is past so it never fires.
export const AUTUMN_DISCOUNT = {
  pct: 10,
  minCents: 2000,
  endsAt: "2024-11-30T22:59:59Z",
} as const;
