/**
 * Shared pricing flags for the Conv 1.3 price-rule changes.
 * Every entry is OFF by default. When a flag is flipped on, the client
 * engine and every server function that computes or validates a price
 * must read the same flag so the client never shows a price the server
 * would not charge.
 */

export const PRICING_FLAGS = {
  /**
   * Conv 1.3: order subtotal (pre-shipping) is
   *   subtotal = max(sum, 10 € + 1 € × (units − 1))
   * where `sum` is the engine's current raw total and `units` is the
   * sum of all part quantities. Never drops below today's price;
   * never exceeds the plain sum once the sum is above the floor.
   *
   * When OFF, priceOrder() behaves exactly as before (plain 10 €
   * minimum).
   */
  MIN_ORDER_UNIT_STEP: false,
} as const;

export type PricingFlag = keyof typeof PRICING_FLAGS;
