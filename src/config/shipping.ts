/**
 * Prompt 3 — ONE place for every shipping number, label and page-group rule.
 *
 * Why. Of 22 visitors who clicked Buy on quotes under €15, only 2 paid.
 * The old shipping surcharge only appeared at Stripe, so a €9.90 part
 * looked like a much larger total by surprise. Rule: the number next to Buy
 * is the number Stripe charges. All shipping maths lives here; grepping
 * the repo for old hardcoded shipping constants must now only land in this
 * file (plus server-side tests for the legacy edge function, which still
 * runs the pre-Prompt-3 rate until Lovable ships the mirror patch).
 */

// ─── Numbers ─────────────────────────────────────────────────────────────────

export const SHIPPING_EUR = 4.90;
export const SHIPPING_CENTS = 490;
export const FREE_SHIPPING_FROM_EUR = 30;
export const FREE_SHIPPING_FROM_CENTS = 3000;

/** Cap the delivered price so no "under-€30 + shipping" pushes past the
 *  free-shipping threshold (it would be a cliff: €25 + €4.90 = €29.90
 *  rounded to €30.90, but €30 pays €30 — looks broken). */
export const DELIVERED_CAP_CENTS = 3090;

// ─── Page-group routing ──────────────────────────────────────────────────────
//
// LOCAL     — Barcelona (homepage in every language + Barcelona city/landing/
//             service pages) and Sevilla (/impresion-3d-sevilla,
//             /3d-printing-sevilla). Pickup is offered here.
// NON-LOCAL — every other page: international hubs/cities (/de, /fr, /it,
//             /nl, /pt), and Spanish cities that are not Barcelona or
//             Sevilla (Madrid, Valencia, …). No pickup; shipping-only.

export type PageGroup = 'local' | 'non_local';

/** Paths that explicitly offer pickup (Sevilla local-maker addresses live
 *  in cityDeliveryPages.ts; we keep the slug list here so page classification
 *  is one import). */
const SEVILLA_SLUGS = new Set<string>([
  '/impresion-3d-sevilla',
  '/3d-printing-sevilla',
]);

/** Non-local language prefixes. A page under any of these is NEVER local. */
const NON_LOCAL_LANG_PREFIXES = ['/de', '/fr', '/it', '/nl', '/pt'] as const;

/** Spanish cities that aren't Barcelona/Sevilla — also non-local. */
const NON_LOCAL_CITY_SLUG_PATTERNS = [
  /\bmadrid\b/i,
  /\bvalencia\b/i,
  /\bzaragoza\b/i,
  /\bmalaga\b/i,
  /\bbilbao\b/i,
];

/** Pages where PICKUP is offered and the shipping A/B test applies. */
export function isLocalPage(pathname: string): boolean {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  if (SEVILLA_SLUGS.has(p)) return true;
  // Non-local language prefix anywhere in the path wins.
  for (const pre of NON_LOCAL_LANG_PREFIXES) {
    if (p === pre || p.startsWith(pre + '/')) return false;
  }
  // Non-local Spanish cities (skip Barcelona which contains 'barcelona').
  for (const re of NON_LOCAL_CITY_SLUG_PATTERNS) {
    if (re.test(p)) return false;
  }
  // Explicit Barcelona markers.
  if (/\bbarcelona\b/i.test(p)) return true;
  // The ES/EN/CA homepage and generic landing pages (no city qualifier) are
  // Barcelona-focused, so they're local by default.
  return true;
}

export function pageGroup(pathname: string): PageGroup {
  return isLocalPage(pathname) ? 'local' : 'non_local';
}

// ─── Shipping-mode & amount helpers ──────────────────────────────────────────

export type ShippingMode = 'delivered' | 'upfront';
export type FulfillmentChoice = 'pickup' | 'shipping';

/** Round a cent value to the nearest x.90, minimum 9.90. Mirrors
 *  `charmCents` in estimator/core but kept standalone so shipping.ts has
 *  no cross-file dependency. */
export function roundToCharm90(cents: number): number {
  return Math.max(990, Math.floor((cents - 90) / 100 + 0.5) * 100 + 90);
}

/** DELIVERED total (cents) for a parts subtotal.
 *  - subtotal ≥ FREE_SHIPPING_FROM_CENTS → subtotal (free shipping).
 *  - else → min( roundToCharm90(subtotal + SHIPPING_CENTS), DELIVERED_CAP_CENTS ). */
export function deliveredTotalCents(partsSubtotalCents: number): number {
  if (partsSubtotalCents >= FREE_SHIPPING_FROM_CENTS) return partsSubtotalCents;
  const withShip = partsSubtotalCents + SHIPPING_CENTS;
  return Math.min(roundToCharm90(withShip), DELIVERED_CAP_CENTS);
}

/** UPFRONT total (cents): subtotal + shipping line (never rounded; the UI
 *  shows "parts + shipping"). Shipping is free from FREE_SHIPPING_FROM. */
export function upfrontTotalCents(partsSubtotalCents: number): number {
  return partsSubtotalCents + upfrontShippingCents(partsSubtotalCents);
}

export function upfrontShippingCents(partsSubtotalCents: number): number {
  return partsSubtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
}

/** Shipping amount implied by the DELIVERED total (variable, since we round
 *  to charm). Used to split the single "delivered" number into
 *  parts + shipping_line for Stripe. */
export function deliveredShippingCents(partsSubtotalCents: number): number {
  return deliveredTotalCents(partsSubtotalCents) - partsSubtotalCents;
}

/**
 * The canonical total the Buy button and Stripe both must show for a given
 * page group, shipping mode and fulfillment choice. ONE function → no drift.
 *
 *   local  + pickup                     → subtotal (free pickup)
 *   local  + shipping + mode=delivered  → deliveredTotalCents
 *   local  + shipping + mode=upfront    → upfrontTotalCents
 *   non_local + shipping (always)       → deliveredTotalCents
 */
export function finalTotalCents(args: {
  partsSubtotalCents: number;
  pageGroup: PageGroup;
  shippingMode: ShippingMode;
  fulfillment: FulfillmentChoice;
}): number {
  const { partsSubtotalCents, pageGroup, shippingMode, fulfillment } = args;
  if (fulfillment === 'pickup') return partsSubtotalCents;
  if (pageGroup === 'non_local') return deliveredTotalCents(partsSubtotalCents);
  return shippingMode === 'delivered'
    ? deliveredTotalCents(partsSubtotalCents)
    : upfrontTotalCents(partsSubtotalCents);
}

/** Shipping amount sent as a separate Stripe line item. */
export function shippingLineCents(args: {
  partsSubtotalCents: number;
  pageGroup: PageGroup;
  shippingMode: ShippingMode;
  fulfillment: FulfillmentChoice;
}): number {
  const { partsSubtotalCents, pageGroup, shippingMode, fulfillment } = args;
  if (fulfillment === 'pickup') return 0;
  if (pageGroup === 'non_local') return deliveredShippingCents(partsSubtotalCents);
  return shippingMode === 'delivered'
    ? deliveredShippingCents(partsSubtotalCents)
    : upfrontShippingCents(partsSubtotalCents);
}
