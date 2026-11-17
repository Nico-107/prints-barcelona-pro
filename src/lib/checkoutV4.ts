import { EST, estimatePart, priceOrder } from "./estimator/core";
import type { MeshAnalysis, OrderPrice, PartEstimate, QualityKey } from "./estimator/core";
import type { V3Piece, V3Priced, V3Result } from "./checkoutV3";
import { V3_INSTANT } from "./checkoutV3";

// CHECKOUT-V4-START
// =====================================================================================
// Checkout v4 contract: validation, server-side pricing and Stripe line items. Pure TypeScript.
// Builds on V3_INSTANT validation rules; uses priceOrder({ v4: true }) for charm rounding.
// This exact block lives in BOTH src/lib/checkoutV4.ts and the create-instant-checkout edge function.
// scripts/check-estimator-sync.mjs fails the build if either differs.
// =====================================================================================
export interface V4Body { pricingVersion: 4; urgency: string; fulfillment: 'pickup' | 'shipping'; exactPrice: number; promoCode?: string; pieces: V3Piece[] }

const failV4 = (error: string): V3Result<any> => ({ ok: false, error });
const isIntV4 = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x);

export function validateV4(body: any): V3Result<V4Body> {
  if (!body || body.pricingVersion !== 4) return failV4('INVALID_VERSION');
  if (!(body.urgency in EST.urgency)) return failV4('INVALID_URGENCY');
  if (body.fulfillment !== 'pickup' && body.fulfillment !== 'shipping') return failV4('INVALID_FULFILLMENT');
  if (typeof body.exactPrice !== 'number' || !isFinite(body.exactPrice) || body.exactPrice < 0 || body.exactPrice > 10000) return failV4('INVALID_PRICE');
  if (body.promoCode !== undefined && (typeof body.promoCode !== 'string' || body.promoCode.length > 32)) return failV4('INVALID_PROMO');
  const ps = body.pieces;
  if (!Array.isArray(ps) || ps.length < 1 || ps.length > V3_INSTANT.maxPieces) return failV4('INVALID_PIECES');
  for (const p of ps) {
    if (!p || typeof p !== 'object') return failV4('INVALID_PIECES');
    if (typeof p.name !== 'string' || p.name.length < 1) return failV4('INVALID_PIECES');
    if (typeof p.path !== 'string' || p.path.length < 1 || p.path.length > 300 || p.path.includes('..') || p.path.startsWith('/')) return failV4('INVALID_PATH');
    if (p.multicolour === true) return failV4('INSTANT_NOT_AVAILABLE');
    if (typeof p.material !== 'string' || !EST.materials[p.material]?.instant) return failV4('INVALID_MATERIAL');
    if (!isIntV4(p.infill) || !V3_INSTANT.infill.includes(p.infill)) return failV4('INVALID_INFILL');
    if (!isIntV4(p.wallLoops) || !V3_INSTANT.wallLoops.includes(p.wallLoops)) return failV4('INVALID_WALLS');
    if (!isIntV4(p.quantity) || p.quantity < 1 || p.quantity > V3_INSTANT.maxQuantity) return failV4('INVALID_QUANTITY');
    if (typeof p.quality !== 'string' || !V3_INSTANT.quality.includes(p.quality)) return failV4('INVALID_QUALITY');
    if (typeof p.supports !== 'boolean') return failV4('INVALID_SUPPORTS');
    if (!(p.orientation === 'auto' || (isIntV4(p.orientation) && p.orientation >= 0 && p.orientation <= 5))) return failV4('INVALID_ORIENTATION');
  }
  return { ok: true, value: { pricingVersion: 4, urgency: body.urgency, fulfillment: body.fulfillment, exactPrice: body.exactPrice, promoCode: typeof body.promoCode === 'string' ? body.promoCode.slice(0, 32).toUpperCase() : undefined, pieces: ps.map((p: V3Piece) => ({ name: String(p.name).slice(0, V3_INSTANT.maxNameLen), quantity: p.quantity, path: p.path, material: p.material, infill: p.infill, wallLoops: p.wallLoops, quality: p.quality, supports: p.supports, orientation: p.orientation, color: typeof p.color === 'string' ? p.color.slice(0, 60) : null })) } };
}

export function priceV4(v: V4Body, analyses: MeshAnalysis[]): V3Priced {
  const estimates = v.pieces.map((p, i) => estimatePart(analyses[i], { material: p.material, infillPct: p.infill, wallLoops: p.wallLoops, quality: p.quality as QualityKey, supports: p.supports, orientation: p.orientation }));
  const order = priceOrder(v.pieces.map((p, i) => ({ name: p.name, quantity: p.quantity, material: p.material, estimate: estimates[i] })), v.urgency, { v4: true });
  return { estimates, order };
}

/** Server decision for v4: validation -> pricing -> limits -> price match. exactPrice = charm-rounded print total in EUR, excluding shipping. */
export function evaluateV4(body: any, analyses: MeshAnalysis[]): V3Result<{ body: V4Body; priced: V3Priced; shippingCents: number; chargeCents: number }> {
  const v = validateV4(body);
  if (!v.ok) return failV4(v.error as string);
  const val = v.value as V4Body;
  if (analyses.length !== val.pieces.length) return failV4('INVALID_PIECES');
  const priced = priceV4(val, analyses);
  const r = priced.order.reasons;
  if (r.some(x => x.startsWith('oversize'))) return failV4('OVERSIZE_PART');
  if (r.includes('over-limit')) return failV4('PRICE_ABOVE_INSTANT_LIMIT');
  if (!priced.order.instantEligible) return failV4('INSTANT_NOT_AVAILABLE');
  if (Math.abs(Math.round(val.exactPrice * 100) - priced.order.totalCents) > 2) return failV4('PRICE_MISMATCH');
  // v4: free shipping threshold is 9990 (9,90 €), v3 was 10000
  const shippingCents = val.fulfillment === 'shipping' && priced.order.totalCents < 9990 ? 590 : 0;
  return { ok: true, value: { body: val, priced, shippingCents, chargeCents: priced.order.totalCents + shippingCents } };
}

/**
 * Stripe line items for v4 — no autumn discount; promoDiscountCents applied proportionally across print lines.
 * Sum == order.totalCents (before promo), or (order.totalCents - promoDiscountCents) with promo.
 */
export function stripeLinesV4(
  priced: V3Priced,
  pieces: V3Piece[],
  language: string,
  promoCode = '',
  promoPct = 0,
  promoDiscountCents = 0,
): { name: string; cents: number }[] {
  const L = language === 'es'
    ? { fill: 'relleno', setup: 'Preparación del pedido', min: 'Ajuste al pedido mínimo (9,90 €)', exp: 'Suplemento express', disc: (c: string, p: number) => `Descuento ${c} −${p} %` }
    : language === 'ca'
    ? { fill: 'farciment', setup: 'Preparació de la comanda', min: 'Ajust a la comanda mínima (9,90 €)', exp: 'Suplement exprés', disc: (c: string, p: number) => `Descompte ${c} −${p} %` }
    : language === 'de'
    ? { fill: 'Füllung', setup: 'Auftragseinrichtung', min: 'Anpassung auf Mindestbestellung (9,90 €)', exp: 'Expressaufschlag', disc: (c: string, p: number) => `Rabatt ${c} −${p} %` }
    : language === 'fr'
    ? { fill: 'remplissage', setup: 'Préparation de la commande', min: "Ajustement au minimum (9,90 €)", exp: 'Supplément express', disc: (c: string, p: number) => `Remise ${c} −${p} %` }
    : language === 'nl'
    ? { fill: 'vulling', setup: 'Ordervoorbereiding', min: 'Aanpassing aan minimumbestelling (9,90 €)', exp: 'Expresstoeslag', disc: (c: string, p: number) => `Korting ${c} −${p} %` }
    : language === 'it'
    ? { fill: 'riempimento', setup: 'Preparazione ordine', min: "Adeguamento al minimo d'ordine (9,90 €)", exp: 'Supplemento express', disc: (c: string, p: number) => `Sconto ${c} −${p} %` }
    : language === 'pt'
    ? { fill: 'preenchimento', setup: 'Preparação do pedido', min: "Ajuste ao mínimo do pedido (9,90 €)", exp: 'Suplemento expresso', disc: (c: string, p: number) => `Desconto ${c} −${p} %` }
    : { fill: 'infill', setup: 'Order setup', min: 'Adjustment to the €9.90 minimum', exp: 'Express surcharge', disc: (c: string, p: number) => `Discount ${c} −${p} %` };

  const printLines: { name: string; cents: number }[] = [];
  priced.order.parts.forEach((pl, i) => {
    if (pl.costCents <= 0) return;
    const p = pieces[i];
    printLines.push({ name: `${p.name} — ${p.material}, ${p.infill}% ${L.fill}, ×${p.quantity}`.slice(0, 120), cents: pl.costCents });
  });

  if (promoDiscountCents > 0 && promoCode && promoPct > 0 && printLines.length > 0) {
    const printTotal = printLines.reduce((s, l) => s + l.cents, 0);
    let distributed = 0;
    for (let i = 0; i < printLines.length - 1; i++) {
      const share = Math.round((printLines[i].cents / printTotal) * promoDiscountCents);
      printLines[i].cents -= share;
      printLines[i].name = `${printLines[i].name} · ${L.disc(promoCode, promoPct)}`.slice(0, 120);
      distributed += share;
    }
    const last = printLines[printLines.length - 1];
    last.cents -= (promoDiscountCents - distributed);
    last.name = `${last.name} · ${L.disc(promoCode, promoPct)}`.slice(0, 120);
  }

  const lines: { name: string; cents: number }[] = [...printLines];
  if (priced.order.setupCents > 0) lines.push({ name: L.setup, cents: priced.order.setupCents });
  if (priced.order.minAdjCents > 0) lines.push({ name: L.min, cents: priced.order.minAdjCents });
  if (priced.order.expressCents > 0) lines.push({ name: L.exp, cents: priced.order.expressCents });
  return lines;
}
// CHECKOUT-V4-END
