// Phase 3 item 3.1: single source of truth for the quote-flow's free-shipping
// threshold. Pieces-subtotal ≥ this amount → free shipping. Applied in the
// quote-send flow ONLY; the instant checkout keeps its own shipping policy
// until a follow-up aligns both.
export const FREE_SHIPPING_FROM_EUR = 100;
