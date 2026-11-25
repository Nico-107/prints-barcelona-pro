// H4 — server-parity guard.
// Before sending a Buy to Stripe, compute what the deployed server will price for the same cart
// and decide: match (±2 cents) → go; moderate overprice → show adjusted price and Buy at that;
// severe overprice (> 1.3×) → force the review path with the shown price confirmed in < 1 h.

export type ServerParityDecision =
  | { kind: "match"; totalCents: number }
  | { kind: "adjust"; totalCents: number; shownCents: number }
  | { kind: "review"; shownCents: number; rawCents: number };

const EXACT_TOLERANCE_CENTS = 2;
const REVIEW_RATIO = 1.3;

export function serverParity(shownCents: number, serverCents: number): ServerParityDecision {
  if (Math.abs(serverCents - shownCents) <= EXACT_TOLERANCE_CENTS) {
    return { kind: "match", totalCents: shownCents };
  }
  if (serverCents <= REVIEW_RATIO * shownCents) {
    return { kind: "adjust", totalCents: serverCents, shownCents };
  }
  return { kind: "review", shownCents, rawCents: serverCents };
}
