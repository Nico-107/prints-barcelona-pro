import { EST, estimatePart, priceOrder } from "./estimator/core";
import type { MeshAnalysis, OrderPrice, PartEstimate, QualityKey } from "./estimator/core";

// CHECKOUT-V3-START
// =====================================================================================
// Checkout v3 contract: validation, server-side pricing and Stripe line items. Pure TypeScript.
// This exact block lives in BOTH src/lib/checkoutV3.ts and the create-instant-checkout edge function
// (pasted AFTER the ESTIMATOR block). scripts/check-estimator-sync.mjs fails the build if either differs.
// =====================================================================================
export const V3_INSTANT = {
  infill: [5, 10, 15, 20, 30, 50] as readonly number[],     // validated range (80% is not validated -> manual review)
  wallLoops: [2, 3, 4] as readonly number[],                  // validated range
  quality: ['fast', 'standard', 'fine', 'high', 'ultra'] as readonly string[],
  maxPieces: 20, maxQuantity: 999, maxNameLen: 120,
} as const;

export interface V3Piece { name: string; quantity: number; path: string; material: string; infill: number; wallLoops: number; quality: string; supports: boolean; orientation: 'auto' | number; multicolour?: boolean; color?: string | null }
export interface V3Body { pricingVersion: 3; urgency: string; fulfillment: 'pickup' | 'shipping'; exactPrice: number; pieces: V3Piece[] }
export interface V3Result<T> { ok: boolean; value?: T; error?: string }
const fail = (error: string): V3Result<any> => ({ ok: false, error });

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x);

/** Shape + range validation. Returns an error CODE (never throws). */
export function validateV3(body: any): V3Result<V3Body> {
  if (!body || body.pricingVersion !== 3) return fail('INVALID_VERSION');
  if (!(body.urgency in EST.urgency)) return fail('INVALID_URGENCY');
  if (body.fulfillment !== 'pickup' && body.fulfillment !== 'shipping') return fail('INVALID_FULFILLMENT');
  if (typeof body.exactPrice !== 'number' || !isFinite(body.exactPrice) || body.exactPrice < 0 || body.exactPrice > 10000) return fail('INVALID_PRICE');
  const ps = body.pieces;
  if (!Array.isArray(ps) || ps.length < 1 || ps.length > V3_INSTANT.maxPieces) return fail('INVALID_PIECES');
  for (const p of ps) {
    if (!p || typeof p !== 'object') return fail('INVALID_PIECES');
    if (typeof p.name !== 'string' || p.name.length < 1) return fail('INVALID_PIECES');
    if (typeof p.path !== 'string' || p.path.length < 1 || p.path.length > 300 || p.path.includes('..') || p.path.startsWith('/')) return fail('INVALID_PATH');
    if (p.multicolour === true) return fail('INSTANT_NOT_AVAILABLE');
    if (typeof p.material !== 'string' || !EST.materials[p.material]?.instant) return fail('INVALID_MATERIAL');
    if (!isInt(p.infill) || !V3_INSTANT.infill.includes(p.infill)) return fail('INVALID_INFILL');
    if (!isInt(p.wallLoops) || !V3_INSTANT.wallLoops.includes(p.wallLoops)) return fail('INVALID_WALLS');
    if (!isInt(p.quantity) || p.quantity < 1 || p.quantity > V3_INSTANT.maxQuantity) return fail('INVALID_QUANTITY');
    if (typeof p.quality !== 'string' || !V3_INSTANT.quality.includes(p.quality)) return fail('INVALID_QUALITY');
    if (typeof p.supports !== 'boolean') return fail('INVALID_SUPPORTS');
    if (!(p.orientation === 'auto' || (isInt(p.orientation) && p.orientation >= 0 && p.orientation <= 5))) return fail('INVALID_ORIENTATION');
  }
  return { ok: true, value: { pricingVersion: 3, urgency: body.urgency, fulfillment: body.fulfillment, exactPrice: body.exactPrice, pieces: ps.map((p: V3Piece) => ({ name: String(p.name).slice(0, V3_INSTANT.maxNameLen), quantity: p.quantity, path: p.path, material: p.material, infill: p.infill, wallLoops: p.wallLoops, quality: p.quality, supports: p.supports, orientation: p.orientation, color: typeof p.color === 'string' ? p.color.slice(0, 60) : null })) } };
}

export interface V3Priced { estimates: PartEstimate[]; order: OrderPrice }
/** Prices the order from mesh analyses (one per piece, SAME order as pieces). The server recomputes the analyses from the stored files. */
export function priceV3(v: V3Body, analyses: MeshAnalysis[]): V3Priced {
  const estimates = v.pieces.map((p, i) => estimatePart(analyses[i], { material: p.material, infillPct: p.infill, wallLoops: p.wallLoops, quality: p.quality as QualityKey, supports: p.supports, orientation: p.orientation }));
  const order = priceOrder(v.pieces.map((p, i) => ({ name: p.name, quantity: p.quantity, material: p.material, estimate: estimates[i] })), v.urgency);
  return { estimates, order };
}

/** Full server decision: validation -> pricing -> limits -> price match. exactPrice = print total in EUR AFTER urgency, EXCLUDING shipping. */
export function evaluateV3(body: any, analyses: MeshAnalysis[]): V3Result<{ body: V3Body; priced: V3Priced; shippingCents: number; chargeCents: number }> {
  const v = validateV3(body);
  if (!v.ok) return fail(v.error as string);
  const val = v.value as V3Body;
  if (analyses.length !== val.pieces.length) return fail('INVALID_PIECES');
  const priced = priceV3(val, analyses);
  const r = priced.order.reasons;
  if (r.some(x => x.startsWith('oversize'))) return fail('OVERSIZE_PART');
  if (r.includes('over-limit')) return fail('PRICE_ABOVE_INSTANT_LIMIT');
  if (!priced.order.instantEligible) return fail('INSTANT_NOT_AVAILABLE');
  if (Math.abs(Math.round(val.exactPrice * 100) - priced.order.totalCents) > 2) return fail('PRICE_MISMATCH');
  const shippingCents = val.fulfillment === 'shipping' ? EST.shippingCents : 0;
  return { ok: true, value: { body: val, priced, shippingCents, chargeCents: priced.order.totalCents + shippingCents } };
}

/** Stripe line items (cents) — one per part with cost > 0, plus setup / minimum-adjustment / express. Sum == order.totalCents. */
export function stripeLinesV3(priced: V3Priced, pieces: V3Piece[], language: string): { name: string; cents: number }[] {
  const L = language === 'es' ? { fill: 'relleno', setup: 'Preparación del pedido', min: 'Ajuste al pedido mínimo (10 €)', exp: 'Suplemento express' }
    : language === 'ca' ? { fill: 'farciment', setup: 'Preparació de la comanda', min: 'Ajust a la comanda mínima (10 €)', exp: 'Suplement exprés' }
    : { fill: 'infill', setup: 'Order setup', min: 'Adjustment to the €10 minimum', exp: 'Express surcharge' };
  const lines: { name: string; cents: number }[] = [];
  priced.order.parts.forEach((pl, i) => {
    if (pl.costCents <= 0) return;
    const p = pieces[i];
    lines.push({ name: `${p.name} — ${p.material}, ${p.infill}% ${L.fill}, ×${p.quantity}`.slice(0, 120), cents: pl.costCents });
  });
  if (priced.order.setupCents > 0) lines.push({ name: L.setup, cents: priced.order.setupCents });
  if (priced.order.minAdjCents > 0) lines.push({ name: L.min, cents: priced.order.minAdjCents });
  if (priced.order.expressCents > 0) lines.push({ name: L.exp, cents: priced.order.expressCents });
  return lines;
}
// CHECKOUT-V3-END
