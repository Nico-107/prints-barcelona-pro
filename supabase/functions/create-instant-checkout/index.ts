import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SITE_URL = "https://dimension3dprints.com";

// Anon-callable: same permissive CORS pattern as send-quote-request (no auth required)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_MATERIALS = ["PLA", "PETG", "ABS", "TPU"];
const MAX_PRICE = 56.5;

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = requestCounts.get(ip);
  if (!rec || now > rec.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (rec.count >= MAX_REQUESTS_PER_WINDOW) return true;
  rec.count++;
  return false;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

// ESTIMATOR-START
// =====================================================================================
// Dimension3D estimator v3 — dependency-free, pure TypeScript (no DOM, no Node, no Deno APIs).
// This exact block lives in BOTH src/lib/estimator/core.ts and the create-instant-checkout
// edge function; scripts/check-estimator-sync.mjs fails the build if they differ.
// Calibrated against real OrcaSlicer slices of the Bambu Lab X2D (0.4 nozzle, 0.20 mm, gyroid).
// =====================================================================================
export const EST = {
  version: 3,
  // ---- plastic + time model (fitted; see docs/estimator-v3.md) ----
  wallWidthMm: 0.4425, infillFactor: 0.905, shellFactor: 0.9296,
  topSkinMm: 1.0, bottomSkinMm: 0.6,
  supportCm3PerCm2: 0.3256, supportSecPerCm3: 782.9045,
  overhangNz: 0.85, bedContactMm: 0.4,
  timeCoef: [790.4113, 71.3533, 284.6187, 699.0554, 2.5218] as readonly number[],
  // ---- pricing (EUR) ----
  setupEur: 8, minimumEur: 10, plasticEurPerG: 0.05,
  timeTiers: [ { upToH: 3, eurPerH: 4.5 }, { upToH: 8, eurPerH: 3.5 }, { upToH: Infinity, eurPerH: 2.5 } ] as readonly { upToH: number; eurPerH: number }[],
  instantMaxCents: 10000, shippingCents: 590,
  // ---- printer ----
  plate: { x: 256, y: 256, z: 261, packAreaMm2: 37000, gapMm: 4 },
  // ---- materials / quality / urgency ----
  materials: {
    PLA:   { density: 1.24, priceMult: 1.0, timeMult: 1.00, instant: true },
    PETG:  { density: 1.27, priceMult: 1.1, timeMult: 1.00, instant: true },
    ABS:   { density: 1.04, priceMult: 1.3, timeMult: 1.08, instant: true },
    ASA:   { density: 1.07, priceMult: 1.3, timeMult: 1.00, instant: true },
    TPU:   { density: 1.20, priceMult: 1.3, timeMult: 1.29, instant: true },
    Nylon: { density: 1.14, priceMult: 1.4, timeMult: 1.00, instant: true },
    HIPS: { density: 1.07, priceMult: 1.2, timeMult: 1.00, instant: false },
    PC: { density: 1.20, priceMult: 1.5, timeMult: 1.00, instant: false },
    PVA: { density: 1.23, priceMult: 1.5, timeMult: 1.00, instant: false },
    'PLA-CF': { density: 1.30, priceMult: 1.6, timeMult: 1.00, instant: false },
    'PETG-CF': { density: 1.30, priceMult: 1.6, timeMult: 1.00, instant: false },
    'Nylon-CF': { density: 1.20, priceMult: 1.6, timeMult: 1.00, instant: false },
  } as Record<string, { density: number; priceMult: number; timeMult: number; instant: boolean }>,
  quality: { fast: 0.91, standard: 1.0, fine: 1.22, high: 1.51, ultra: 2.19 } as Record<string, number>,
  urgency: { standard: 1.0, express: 1.25, urgent: 1.6 } as Record<string, number>,
} as const;

export type QualityKey = 'fast' | 'standard' | 'fine' | 'high' | 'ultra';
export interface OrientationFeatures {
  index: number; name: string;
  aUp: number; aDown: number; aSide: number;      // mm2 (projected-normal split of the surface)
  heightMm: number; sizeXMm: number; sizeYMm: number;
  overhangCm2: number;                            // projected area of faces needing support (cm2)
}
export interface MeshAnalysis {
  triangles: number; skipped: number; volumeMm3: number; insideOut: boolean;
  boundsMm: [number, number, number]; orientations: OrientationFeatures[];
}
export interface EstimatorSettings {
  material: string; infillPct: number; wallLoops: number;
  quality: QualityKey; supports: boolean;          // supports=false => customer promises no supports (price ignores overhangs)
  orientation: 'auto' | number;                    // 'auto' = cheapest of the 6, or a fixed index 0..5
}
export interface PartEstimate {
  orientation: number; orientationName: string;
  plasticCm3: number; supportCm3: number; grams: number;
  timeSec: number; fixedSec: number;               // fixedSec = per-plate overhead included in timeSec
  sizeXMm: number; sizeYMm: number; heightMm: number; fitsPlate: boolean;
}

const ORIENTS: ReadonlyArray<{ name: string; m: readonly [readonly [number, number], readonly [number, number], readonly [number, number]] }> = [
  { name: 'as uploaded',         m: [[0, 1], [1, 1], [2, 1]] },
  { name: 'flipped upside down', m: [[0, 1], [1, -1], [2, -1]] },
  { name: 'on its side (+x)',    m: [[0, 1], [2, -1], [1, 1]] },
  { name: 'on its side (-x)',    m: [[0, 1], [2, 1], [1, -1]] },
  { name: 'on its side (+y)',    m: [[2, 1], [1, 1], [0, -1]] },
  { name: 'on its side (-y)',    m: [[2, -1], [1, 1], [0, 1]] },
];

/** Binary or ASCII STL -> Float32Array with 9 floats per triangle. */
export function stlToTriangles(buf: ArrayBuffer): Float32Array {
  const dv = new DataView(buf);
  if (buf.byteLength >= 84) {
    const count = dv.getUint32(80, true);
    if (84 + count * 50 === buf.byteLength) {
      const out = new Float32Array(count * 9);
      for (let i = 0, o = 84; i < count; i++, o += 50) {
        for (let k = 0; k < 9; k++) out[i * 9 + k] = dv.getFloat32(o + 12 + k * 4, true);
      }
      return out;
    }
  }
  const text = new TextDecoder().decode(new Uint8Array(buf));
  const nums: number[] = [];
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) nums.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
  return Float32Array.from(nums.slice(0, Math.floor(nums.length / 9) * 9));
}

/** One analysis of the mesh -> features for all six print orientations. O(triangles), two passes. */
export function analyzeTriangles(tri: Float32Array): MeshAnalysis {
  const n = Math.floor(tri.length / 9);
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  let vol6 = 0;
  for (let i = 0; i < n; i++) {
    const b = i * 9;
    const x0 = tri[b], y0 = tri[b + 1], z0 = tri[b + 2], x1 = tri[b + 3], y1 = tri[b + 4], z1 = tri[b + 5], x2 = tri[b + 6], y2 = tri[b + 7], z2 = tri[b + 8];
    if (x0 < mn[0]) mn[0] = x0; if (x1 < mn[0]) mn[0] = x1; if (x2 < mn[0]) mn[0] = x2;
    if (y0 < mn[1]) mn[1] = y0; if (y1 < mn[1]) mn[1] = y1; if (y2 < mn[1]) mn[1] = y2;
    if (z0 < mn[2]) mn[2] = z0; if (z1 < mn[2]) mn[2] = z1; if (z2 < mn[2]) mn[2] = z2;
    if (x0 > mx[0]) mx[0] = x0; if (x1 > mx[0]) mx[0] = x1; if (x2 > mx[0]) mx[0] = x2;
    if (y0 > mx[1]) mx[1] = y0; if (y1 > mx[1]) mx[1] = y1; if (y2 > mx[1]) mx[1] = y2;
    if (z0 > mx[2]) mx[2] = z0; if (z1 > mx[2]) mx[2] = z1; if (z2 > mx[2]) mx[2] = z2;
    vol6 += x0 * (y1 * z2 - y2 * z1) + y0 * (z1 * x2 - z2 * x1) + z0 * (x1 * y2 - x2 * y1);
  }
  const sgn = vol6 < 0 ? -1 : 1;
  const ext = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
  const acc = ORIENTS.map(() => ({ up: 0, dn: 0, side: 0, oa: 0 }));
  const zMinO = ORIENTS.map(o => { const [ax, s] = o.m[2]; return s > 0 ? mn[ax] : -mx[ax]; });
  let skipped = 0;
  const n3 = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const b = i * 9;
    const x0 = tri[b], y0 = tri[b + 1], z0 = tri[b + 2];
    const ex1 = tri[b + 3] - x0, ey1 = tri[b + 4] - y0, ez1 = tri[b + 5] - z0, ex2 = tri[b + 6] - x0, ey2 = tri[b + 7] - y0, ez2 = tri[b + 8] - z0;
    const cx = ey1 * ez2 - ez1 * ey2, cy = ez1 * ex2 - ex1 * ez2, cz = ex1 * ey2 - ey1 * ex2;
    const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
    if (len < 1e-9) { skipped++; continue; }
    const area = len / 2;
    n3[0] = (cx / len) * sgn; n3[1] = (cy / len) * sgn; n3[2] = (cz / len) * sgn;
    for (let o = 0; o < 6; o++) {
      const [ax, s] = ORIENTS[o].m[2];
      const nz = s * n3[ax];
      const a = acc[o];
      if (nz > 0) a.up += area * nz; else a.dn += area * -nz;
      a.side += area * Math.sqrt(Math.max(1 - nz * nz, 0));
      if (nz < -EST.overhangNz) {
        // z' of the three vertices (source axis `ax`, sign `s`): a face resting on the bed needs no support
        const zTop = Math.max(s * tri[b + ax], s * tri[b + 3 + ax], s * tri[b + 6 + ax]);
        if (zTop - zMinO[o] > EST.bedContactMm) a.oa += area * -nz;
      }
    }
  }
  const V = Math.abs(vol6) / 6;
  const orientations: OrientationFeatures[] = ORIENTS.map((o, k) => ({
    index: k, name: o.name, aUp: acc[k].up, aDown: acc[k].dn, aSide: acc[k].side,
    heightMm: ext[o.m[2][0]], sizeXMm: ext[o.m[0][0]], sizeYMm: ext[o.m[1][0]], overhangCm2: acc[k].oa / 100,
  }));
  return { triangles: n, skipped, volumeMm3: V, insideOut: sgn < 0, boundsMm: [ext[0], ext[1], ext[2]], orientations };
}

export function tierCostEur(hours: number): number {
  let prev = 0, cost = 0;
  for (const t of EST.timeTiers) { if (hours > prev) cost += (Math.min(hours, t.upToH) - prev) * t.eurPerH; prev = t.upToH; }
  return cost;
}

function fits(f: OrientationFeatures): boolean {
  const p = EST.plate; return f.sizeXMm <= p.x && f.sizeYMm <= p.y && f.heightMm <= p.z;
}

export function estimateForOrientation(a: MeshAnalysis, o: number, s: EstimatorSettings): PartEstimate {
  const f = a.orientations[o], mat = EST.materials[s.material] ?? EST.materials.PLA;
  const infill = s.infillPct / 100, walls = s.wallLoops, V = a.volumeMm3;
  const shell = Math.min(f.aSide * walls * EST.wallWidthMm + f.aUp * EST.topSkinMm + f.aDown * EST.bottomSkinMm, V);
  const plastic = (EST.shellFactor * shell + Math.max(V - shell, 0) * infill * EST.infillFactor) / 1000;
  const support = s.supports ? EST.supportCm3PerCm2 * f.overhangCm2 : 0;
  const inf = Math.max(V - shell, 0) * infill / 1000;
  const c = EST.timeCoef;
  const base = c[0] + c[1] * (f.aSide * walls / 1000) + c[2] * inf + c[3] * inf * infill + c[4] * (f.heightMm / 0.2);
  const q = EST.quality[s.quality] ?? 1;
  const timeSec = c[0] + (base - c[0]) * mat.timeMult * q + EST.supportSecPerCm3 * support;
  return {
    orientation: o, orientationName: f.name, plasticCm3: plastic, supportCm3: support, grams: (plastic + support) * mat.density,
    timeSec, fixedSec: c[0], sizeXMm: f.sizeXMm, sizeYMm: f.sizeYMm, heightMm: f.heightMm, fitsPlate: fits(f),
  };
}

/** Cost of ONE copy used only to rank orientations (no setup, no minimum). */
function rankCostEur(e: PartEstimate, material: string): number {
  const m = EST.materials[material] ?? EST.materials.PLA;
  return m.priceMult * (e.grams * EST.plasticEurPerG + tierCostEur(e.timeSec / 3600));
}

export function estimatePart(a: MeshAnalysis, s: EstimatorSettings): PartEstimate {
  if (s.orientation !== 'auto') return estimateForOrientation(a, Math.max(0, Math.min(5, s.orientation | 0)), s);
  let best: PartEstimate | null = null, bestCost = Infinity;
  for (let o = 0; o < 6; o++) {
    const e = estimateForOrientation(a, o, s);
    const cost = rankCostEur(e, s.material) + (e.fitsPlate ? 0 : 1e6);      // never prefer an orientation that does not fit
    if (cost < bestCost - 1e-9) { bestCost = cost; best = e; }
  }
  return best as PartEstimate;
}

export interface OrderPartInput { name: string; quantity: number; material: string; estimate: PartEstimate }
export interface OrderPartLine { name: string; quantity: number; material: string; grams: number; timeSec: number; costCents: number }
export interface OrderPrice {
  parts: OrderPartLine[]; setupCents: number; minAdjCents: number; expressCents: number;
  totalCents: number; baseCents: number; plates: number; orderHours: number;
  instantEligible: boolean; reasons: string[];
}
const rnd = (x: number) => Math.floor(x + 0.5);

/** Price an order (all parts) — setup once, long-job time tiers on the ORDER's print hours, one line per part. */
export function priceOrder(parts: OrderPartInput[], urgency: string): OrderPrice {
  const reasons: string[] = [];
  const up = EST.urgency[urgency] ?? 1;
  const p = EST.plate;
  let footprint = 0, marg = 0;
  const margs = parts.map(x => Math.max(x.estimate.timeSec - x.estimate.fixedSec, 0) * x.quantity);
  parts.forEach((x, i) => { footprint += x.quantity * (x.estimate.sizeXMm + p.gapMm) * (x.estimate.sizeYMm + p.gapMm); marg += margs[i]; });
  const plates = Math.max(1, Math.ceil(footprint / p.packAreaMm2));
  const fixed = parts.length ? parts[0].estimate.fixedSec : 0;
  const orderSec = plates * fixed + marg;
  const orderHours = orderSec / 3600;
  const timeCost = tierCostEur(orderHours);
  const nTypes = Math.max(parts.length, 1);
  const raw: number[] = parts.map((x, i) => {
    const m = EST.materials[x.material] ?? EST.materials.PLA;
    const weight = orderSec > 0 ? (margs[i] + (plates * fixed) / nTypes) / orderSec : 1 / nTypes;
    return m.priceMult * (x.quantity * x.estimate.grams * EST.plasticEurPerG + timeCost * weight);
  });
  const rawTotal = EST.setupEur + raw.reduce((a, b) => a + b, 0);
  const base = Math.max(rawTotal, EST.minimumEur);
  const total = base * up;
  const baseCents = rnd(base * 100), totalCents = rnd(total * 100);
  const setupCents = rnd(EST.setupEur * 100);
  const partCents = raw.map(r => rnd(r * 100));
  const residual = baseCents - (setupCents + partCents.reduce((a, b) => a + b, 0));
  let minAdjCents = 0;
  if (rawTotal < EST.minimumEur) minAdjCents = residual;
  else if (partCents.length) { let bi = 0; partCents.forEach((c, i) => { if (c > partCents[bi]) bi = i; }); partCents[bi] += residual; }
  const expressCents = totalCents - baseCents;
  let instantEligible = totalCents <= EST.instantMaxCents;
  if (!instantEligible) reasons.push('over-limit');
  for (const x of parts) {
    if (!(EST.materials[x.material]?.instant)) { instantEligible = false; reasons.push('material:' + x.material); }
    if (!x.estimate.fitsPlate) { instantEligible = false; reasons.push('oversize:' + x.name); }
  }
  return {
    parts: parts.map((x, i) => ({ name: x.name, quantity: x.quantity, material: x.material, grams: x.estimate.grams, timeSec: x.estimate.timeSec, costCents: partCents[i] })),
    setupCents, minAdjCents, expressCents, totalCents, baseCents, plates, orderHours, instantEligible, reasons,
  };
}
// ESTIMATOR-END

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
  lines.push({ name: L.setup, cents: priced.order.setupCents });
  if (priced.order.minAdjCents > 0) lines.push({ name: L.min, cents: priced.order.minAdjCents });
  if (priced.order.expressCents > 0) lines.push({ name: L.exp, cents: priced.order.expressCents });
  return lines;
}
// CHECKOUT-V3-END

// PRICING-START
const SETUP_FEE = 8;
const RATE_PER_GRAM = 0.22;
const MIN_PRICE = 10;
const INSTANT_BUY_MAX = 52.5;

const MATERIALS: Record<string, { density: number; multiplier: number }> = {
  PLA:      { density: 1.24, multiplier: 1.0 },
  PETG:     { density: 1.27, multiplier: 1.1 },
  HIPS:     { density: 1.07, multiplier: 1.2 },
  ABS:      { density: 1.04, multiplier: 1.3 },
  ASA:      { density: 1.07, multiplier: 1.3 },
  TPU:      { density: 1.20, multiplier: 1.3 },
  Nylon:    { density: 1.14, multiplier: 1.4 },
  PC:       { density: 1.20, multiplier: 1.5 },
  PVA:      { density: 1.23, multiplier: 1.5 },
  "PLA-CF": { density: 1.30, multiplier: 1.6 },
  "PETG-CF":{ density: 1.30, multiplier: 1.6 },
  "Nylon-CF":{ density: 1.20, multiplier: 1.6 },
};

const URGENCY_MULTIPLIER: Record<string, number> = {
  standard: 1.0,
  express:  1.25,
  urgent:   1.6,
};

const INSTANT_MATERIALS = ["PLA", "PETG", "ABS", "TPU"];

function wallFactor(loops: number): number {
  if (loops <= 2) return 0.14;
  if (loops === 3) return 0.20;
  if (loops === 4) return 0.27;
  return Math.min(0.27 + (loops - 4) * 0.07, 0.80);
}

function effectiveFill(infillPct: number, loops: number): number {
  const wf = wallFactor(loops);
  return wf + (infillPct / 100) * (1 - wf);
}

function pricingRound(x: number): number {
  return Math.floor(x + 0.5);
}

interface PricePiece {
  volumeMm3: number;
  quantity: number;
  material: string;
  infill: number;
  wallLoops: number;
}

interface OrderResult {
  parts: Array<{ gramsPerUnit: number; costCents: number }>;
  setupCents: number;
  minAdjCents: number;
  expressCents: number;
  capShaveCents: number;
  totalCents: number;
  chargedPrintCents: number;
  eligible: boolean;
}

function computeOrder(pieces: PricePiece[], urgency: string): OrderResult {
  const um = URGENCY_MULTIPLIER[urgency] ?? 1.0;

  const gramsPerUnit: number[] = [];
  const partRaw: number[] = [];

  for (const p of pieces) {
    const mat = MATERIALS[p.material];
    const ef = effectiveFill(p.infill, p.wallLoops);
    const gpu = (p.volumeMm3 / 1000) * mat.density * ef;
    const pr = gpu * p.quantity * RATE_PER_GRAM * mat.multiplier;
    gramsPerUnit.push(gpu);
    partRaw.push(pr);
  }

  const sumPartRaw = partRaw.reduce((s, v) => s + v, 0);
  const raw = SETUP_FEE + sumPartRaw;
  const base = Math.max(raw, MIN_PRICE);
  const total = base * um;

  const baseCents = pricingRound(base * 100);
  const totalCents = pricingRound(total * 100);

  const partCents = partRaw.map((pr) => pricingRound(pr * 100));
  const setupCents = 800;

  const sumPartCents = partCents.reduce((s, v) => s + v, 0);
  const residual = baseCents - (setupCents + sumPartCents);

  let minAdjCents = 0;
  if (raw < MIN_PRICE) {
    minAdjCents = residual;
  } else {
    // Add residual to largest part (first on ties)
    let maxIdx = 0;
    for (let i = 1; i < partCents.length; i++) {
      if (partCents[i] > partCents[maxIdx]) maxIdx = i;
    }
    partCents[maxIdx] += residual;
  }

  const expressCents = totalCents - baseCents;

  const eligible = totalCents <= pricingRound(INSTANT_BUY_MAX * 100);

  let capShaveCents = 0;
  if (eligible && totalCents > 5000) {
    capShaveCents = totalCents - 5000;
    // Subtract cap from the largest line (after residual)
    let maxIdx = 0;
    for (let i = 1; i < partCents.length; i++) {
      if (partCents[i] > partCents[maxIdx]) maxIdx = i;
    }
    partCents[maxIdx] -= capShaveCents;
  }

  const chargedPrintCents = totalCents - capShaveCents;

  const parts = gramsPerUnit.map((gpu, i) => ({
    gramsPerUnit: gpu,
    costCents: partCents[i],
  }));

  return {
    parts,
    setupCents,
    minAdjCents,
    expressCents,
    capShaveCents,
    totalCents,
    chargedPrintCents,
    eligible,
  };
}

function buildStripeLineItems(
  order: OrderResult,
  pieces: Array<{ name: string; quantity: number; material: string; infill: number; wallLoops: number; color?: string }>,
  language: string,
): Array<{ name: string; amount: number }> {
  const lang = language?.toLowerCase() ?? "";
  const isEs = lang.startsWith("es");
  const isCa = lang.startsWith("ca");

  const fillWord = isEs ? "relleno" : isCa ? "farciment" : "infill";
  const setupLabel = isEs ? "Preparación del pedido" : isCa ? "Preparació de la comanda" : "Order setup";
  const minAdjLabel = isEs
    ? "Ajuste al pedido mínimo (10 €)"
    : isCa
    ? "Ajust a la comanda mínima (10 €)"
    : "Adjustment to the €10 minimum";
  const expressLabel = isEs ? "Suplemento express" : isCa ? "Suplement exprés" : "Express surcharge";

  const lines: Array<{ name: string; amount: number }> = [];

  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    const cost = order.parts[i].costCents;
    if (cost <= 0) continue;
    const raw = `${p.name} — ${p.material}, ${p.infill}% ${fillWord}, ×${p.quantity}`;
    lines.push({ name: raw.slice(0, 120), amount: cost });
  }

  lines.push({ name: setupLabel, amount: order.setupCents });

  if (order.minAdjCents > 0) {
    lines.push({ name: minAdjLabel, amount: order.minAdjCents });
  }

  if (order.expressCents > 0) {
    lines.push({ name: expressLabel, amount: order.expressCents });
  }

  return lines;
}
// PRICING-END

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(clientIP)) {
      return json({ error: "Too many requests. Please try again later." }, 429);
    }

    const body = await req.json();

    // ── V3 PATH ────────────────────────────────────────────────────────────────
    if (body?.pricingVersion === 3) {
      const pre = validateV3(body);
      if (!pre.ok) return json({ error: pre.error }, 400);
      const val = pre.value as V3Body;

      if (!STRIPE_SECRET_KEY) return json({ error: "STRIPE_NOT_CONFIGURED" }, 500);

      const supabaseV3 = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      // Server re-measures each STL from storage (never trust client geometry)
      const analyses: MeshAnalysis[] = [];
      let totalBytes = 0;
      const MAX_FILE_BYTES = 30 * 1024 * 1024;
      const MAX_TOTAL_BYTES = 60 * 1024 * 1024;
      for (let pi = 0; pi < val.pieces.length; pi++) {
        const piece = val.pieces[pi];
        const { data: fileBlob, error: dlErr } = await supabaseV3.storage
          .from("print-requests")
          .download(piece.path);
        if (dlErr || !fileBlob) {
          console.error(`STL download failed for piece ${pi}:`, dlErr?.message);
          return json({ error: "FILE_NOT_FOUND" }, 400);
        }
        if (fileBlob.size > MAX_FILE_BYTES) {
          return json({ error: "FILE_TOO_LARGE_FOR_INSTANT" }, 400);
        }
        totalBytes += fileBlob.size;
        if (totalBytes > MAX_TOTAL_BYTES) {
          return json({ error: "FILE_TOO_LARGE_FOR_INSTANT" }, 400);
        }
        const buf = await fileBlob.arrayBuffer();
        const tri = stlToTriangles(buf);
        const analysis = analyzeTriangles(tri);
        if (tri.length === 0 || !Number.isFinite(analysis.volumeMm3) || analysis.volumeMm3 <= 0) {
          return json({ error: "INVALID_FILE" }, 400);
        }
        analyses.push(analysis);
      }

      const evalResult = evaluateV3(body, analyses);
      if (!evalResult.ok) return json({ error: evalResult.error }, 400);
      const { body: vBody, priced, shippingCents: v3ShipCents, chargeCents } = evalResult.value!;

      // Enriched pieces for DB (server-computed grams)
      const v3Pieces = vBody.pieces.map((p, i) => ({
        name: p.name,
        quantity: p.quantity,
        path: p.path,
        material: p.material,
        infill: p.infill,
        wallLoops: p.wallLoops,
        quality: p.quality,
        supports: p.supports,
        orientation: p.orientation,
        color: p.color ?? null,
        multicolour: false,
        gramsPerUnit: priced.order.parts[i].grams,
        hoursPerUnit: parseFloat((priced.order.parts[i].timeSec / 3600).toFixed(4)),
        costCents: priced.order.parts[i].costCents,
      }));

      const v3UniqueMats = [...new Set(v3Pieces.map(p => p.material))];
      const v3IsUniform = v3UniqueMats.length === 1;
      const v3TotalQty = v3Pieces.reduce((s, p) => s + p.quantity, 0);
      const v3TotalEur = (chargeCents / 100).toFixed(2);

      const v3PartsSummary = v3Pieces.map(p => {
        const orient = p.orientation === 'auto' ? 'auto' : `orient${p.orientation}`;
        return `${p.name} x${p.quantity} [${p.material} ${p.infill}% ${p.wallLoops}w ${p.quality} ${orient}]`;
      }).join("; ");

      const v3Notes = [
        "Instant checkout v3 (self-service, ≤ €100).",
        `Material: ${v3IsUniform ? v3UniqueMats[0] : `Mixed (${v3UniqueMats.join(", ")})`}.`,
        `Qty ${v3TotalQty}, urgency ${vBody.urgency}, fulfillment ${vBody.fulfillment}.`,
        `Precio calculado: EUR ${v3TotalEur}.`,
        `Parts: ${v3PartsSummary}.`,
        vBody.fulfillment === "shipping" ? `Shipping: EUR ${(v3ShipCents / 100).toFixed(2)}.` : "",
        body.language ? `Language: ${body.language}.` : "",
      ].filter(Boolean).join(" ");

      const v3ProductTitle = v3IsUniform
        ? `3D Print — ${v3UniqueMats[0]}${v3Pieces[0].color ? ` (${v3Pieces[0].color})` : ""}`
        : `3D Print — Mixed (${v3UniqueMats.join(", ")})`;

      const { data: v3OrderRow, error: v3OrderErr } = await supabaseV3
        .from("orders")
        .insert({
          product_title: v3ProductTitle,
          customer_phone: (typeof body.contactPhone === "string" && body.contactPhone.trim()) || "see notes",
          customer_email: (typeof body.contactEmail === "string" && body.contactEmail.trim()) || null,
          status: "awaiting_payment",
          fulfillment: vBody.fulfillment,
          notes: v3Notes,
          photos: [],
          payment_method: "stripe",
          payment_status: "pending",
          file_paths: Array.isArray(body.filePaths) ? body.filePaths.map(String) : [],
          pieces: v3Pieces,
        })
        .select("id, order_number")
        .single();

      if (v3OrderErr || !v3OrderRow) {
        console.error("Order insert failed (v3):", v3OrderErr);
        return json({ error: "ORDER_INSERT_FAILED", details: v3OrderErr?.message }, 500);
      }

      const v3LangStr = typeof body.language === "string" ? body.language : "";
      const v3Lines = stripeLinesV3(priced, vBody.pieces, v3LangStr);

      const v3Params = new URLSearchParams({ "mode": "payment" });
      v3Lines.forEach((line, i) => {
        v3Params.set(`line_items[${i}][quantity]`, "1");
        v3Params.set(`line_items[${i}][price_data][currency]`, "eur");
        v3Params.set(`line_items[${i}][price_data][unit_amount]`, String(line.cents));
        v3Params.set(`line_items[${i}][price_data][product_data][name]`, line.name);
      });

      v3Params.set("metadata[order_id]", v3OrderRow.id);
      v3Params.set("metadata[order_number]", String(v3OrderRow.order_number));
      v3Params.set("metadata[fulfillment]", vBody.fulfillment);
      v3Params.set("metadata[pricing_version]", "3");
      v3Params.set("metadata[part_count]", String(v3Pieces.length));
      v3Params.set("metadata[materials]", v3UniqueMats.join(",").slice(0, 200));
      v3Params.set("success_url", `${SITE_URL}/?checkout=success`);
      v3Params.set("cancel_url", `${SITE_URL}/?checkout=cancelled`);

      const { ph_distinct_id, ph_session_id, utm_source, utm_medium, utm_content, utm_campaign, product_type, customer_ref } = body;
      if (typeof ph_distinct_id === "string" && ph_distinct_id.trim()) v3Params.set("metadata[ph_distinct_id]", ph_distinct_id.trim().slice(0, 500));
      if (typeof ph_session_id === "string" && ph_session_id.trim()) v3Params.set("metadata[ph_session_id]", ph_session_id.trim().slice(0, 500));
      if (typeof utm_source === "string" && utm_source.trim()) v3Params.set("metadata[utm_source]", utm_source.trim().slice(0, 100));
      if (typeof utm_medium === "string" && utm_medium.trim()) v3Params.set("metadata[utm_medium]", utm_medium.trim().slice(0, 100));
      if (typeof utm_content === "string" && utm_content.trim()) v3Params.set("metadata[utm_content]", utm_content.trim().slice(0, 100));
      if (typeof utm_campaign === "string" && utm_campaign.trim()) v3Params.set("metadata[utm_campaign]", utm_campaign.trim().slice(0, 100));
      if (typeof product_type === "string" && product_type.trim()) v3Params.set("metadata[product_type]", product_type.trim().slice(0, 100));
      if (typeof customer_ref === "string" && customer_ref.trim()) v3Params.set("metadata[customer_ref]", customer_ref.trim().slice(0, 100));

      if (vBody.fulfillment === "shipping") {
        v3Params.set("shipping_address_collection[allowed_countries][0]", "ES");
        v3Params.set("phone_number_collection[enabled]", "true");
        const isEs3 = v3LangStr.toLowerCase().startsWith("es");
        const isCa3 = v3LangStr.toLowerCase().startsWith("ca");
        const v3ShipLabel = isEs3 ? "Envío estándar" : isCa3 ? "Enviament estàndard" : "Standard shipping";
        v3Params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
        v3Params.set("shipping_options[0][shipping_rate_data][display_name]", v3ShipLabel);
        v3Params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(EST.shippingCents));
        v3Params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
      }

      if (typeof body.contactEmail === "string" && body.contactEmail.trim()) {
        v3Params.set("customer_email", body.contactEmail.trim());
      }

      const v3Res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: v3Params,
      });

      if (!v3Res.ok) {
        const err = await v3Res.text();
        console.error("Stripe v3 checkout session failed:", err);
        return json({ error: "STRIPE_SESSION_FAILED", details: err }, 502);
      }

      const v3Session = await v3Res.json();
      console.log(`Instant checkout v3 session created for order ${v3OrderRow.id} (#${v3OrderRow.order_number})`);
      return json({ checkoutUrl: v3Session.url });
    }

    // ── V2 PATH ────────────────────────────────────────────────────────────────
    const isV2 =
      body?.pricingVersion === 2 &&
      Array.isArray(body?.pieces) &&
      body.pieces.length > 0 &&
      body.pieces.every((p: unknown) => typeof (p as Record<string, unknown>)?.material === "string");

    if (isV2) {
      const {
        urgency, fulfillment, exactPrice, pieces,
        contactEmail, contactPhone, language,
        filePaths, fileNames,
        ph_distinct_id, ph_session_id,
        utm_source, utm_medium, utm_content, utm_campaign,
        product_type, customer_ref,
        color: topColor, infill: topInfill, wallLoops: topWallLoops,
        quantity: topQuantity,
      } = body;

      // ── Validation ──────────────────────────────────────────────────────────
      if (!Array.isArray(pieces) || pieces.length === 0 || pieces.length > 20) {
        return json({ error: "INVALID_PIECES" }, 400);
      }

      const VALID_INFILL = [5, 15, 30, 50, 80];

      for (const p of pieces) {
        if (!INSTANT_MATERIALS.includes(p.material)) {
          return json({ error: "INVALID_MATERIAL" }, 400);
        }
        if (!VALID_INFILL.includes(Number(p.infill))) {
          return json({ error: "INVALID_INFILL" }, 400);
        }
        const walls = Number(p.wallLoops);
        if (!Number.isInteger(walls) || walls < 2 || walls > 8) {
          return json({ error: "INVALID_WALLS" }, 400);
        }
        const qty = Number(p.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
          return json({ error: "INVALID_QUANTITY" }, 400);
        }
        const vol = Number(p.volumeMm3);
        if (!Number.isFinite(vol) || vol <= 0 || vol > 50_000_000) {
          return json({ error: "INVALID_VOLUME" }, 400);
        }
        if (p.multicolour === true) {
          return json({ error: "INSTANT_NOT_AVAILABLE" }, 400);
        }
      }

      if (!URGENCY_MULTIPLIER[urgency]) {
        return json({ error: "INVALID_URGENCY" }, 400);
      }

      if (fulfillment !== "pickup" && fulfillment !== "shipping") {
        return json({ error: "INVALID_FULFILLMENT" }, 400);
      }

      if (!STRIPE_SECRET_KEY) return json({ error: "STRIPE_NOT_CONFIGURED" }, 500);

      // ── Server-side pricing ─────────────────────────────────────────────────
      const piecesForCalc: PricePiece[] = pieces.map((p: Record<string, unknown>) => ({
        volumeMm3: Number(p.volumeMm3),
        quantity:  Number(p.quantity),
        material:  String(p.material),
        infill:    Number(p.infill),
        wallLoops: Number(p.wallLoops),
      }));

      const order = computeOrder(piecesForCalc, urgency);

      if (!order.eligible || order.totalCents > 5250) {
        return json({ error: "PRICE_ABOVE_INSTANT_LIMIT" }, 400);
      }

      const exactPriceCents = pricingRound(Number(exactPrice) * 100);
      if (Math.abs(exactPriceCents - order.chargedPrintCents) > 2) {
        console.log(`PRICE_MISMATCH: client=${exactPriceCents} server=${order.chargedPrintCents}`);
        return json({ error: "PRICE_MISMATCH" }, 400);
      }

      // ── Sanitise & enrich pieces ────────────────────────────────────────────
      const KNOWN_MATERIALS = new Set(Object.keys(MATERIALS));
      const enrichedPieces = pieces.map((p: Record<string, unknown>, i: number) => {
        const mat = KNOWN_MATERIALS.has(String(p.material)) ? String(p.material) : String(p.material);
        return {
          name:         String(p.name ?? "").slice(0, 80),
          quantity:     Number(p.quantity),
          path:         typeof p.path === "string" ? p.path : null,
          material:     mat,
          color:        typeof p.color === "string" ? p.color.slice(0, 60) : null,
          infill:       Number(p.infill),
          wallLoops:    Number(p.wallLoops),
          multicolour:  p.multicolour === true,
          gramsPerUnit: order.parts[i].gramsPerUnit,
          costCents:    order.parts[i].costCents,
        };
      });

      // ── Product title ───────────────────────────────────────────────────────
      const allMats = enrichedPieces.map((p: { material: string }) => p.material);
      const uniqueMats = [...new Set(allMats)];
      const isUniform = uniqueMats.length === 1;

      let resolvedProductTitle: string;
      if (isUniform) {
        const firstColor = enrichedPieces.find((p: { color: string | null }) => p.color)?.color ?? null;
        resolvedProductTitle = `3D Print — ${uniqueMats[0]}${firstColor ? ` (${firstColor})` : ""}`;
      } else {
        resolvedProductTitle = `3D Print — Mixed (${uniqueMats.join(", ")})`;
      }

      // ── Notes ────────────────────────────────────────────────────────────────
      const names: string[] = Array.isArray(fileNames) ? fileNames.map(String) : [];
      const paths: string[] = Array.isArray(filePaths) ? filePaths.map(String) : [];
      const totalQty = enrichedPieces.reduce((s: number, p: { quantity: number }) => s + p.quantity, 0);

      const allInfill = [...new Set(enrichedPieces.map((p: { infill: number }) => p.infill))];
      const allWalls  = [...new Set(enrichedPieces.map((p: { wallLoops: number }) => p.wallLoops))];
      const uniformInfill = allInfill.length === 1;
      const uniformWalls  = allWalls.length === 1;

      const shippingCentsV2 = fulfillment === "shipping" ? 600 : 0;
      const totalPaidEuros = ((order.chargedPrintCents + shippingCentsV2) / 100).toFixed(2);

      let notes: string;
      if (isUniform && uniformInfill && uniformWalls) {
        // Exactly legacy format when all parts share material, infill, walls
        const singleMat = uniqueMats[0];
        const firstColor = enrichedPieces.find((p: { color: string | null }) => p.color)?.color ?? null;
        const piecesStr = enrichedPieces.length > 0
          ? `Pieces: ${enrichedPieces.map((p: { name: string; quantity: number }) => `${p.name} x${p.quantity}`).join(", ")}.`
          : "";
        notes = [
          "Instant checkout (self-service, ≤ €35).",
          contactEmail ? `Email: ${contactEmail}.` : "",
          `Material: ${singleMat}${firstColor ? ` / ${firstColor}` : ""}.`,
          `Infill: ${allInfill[0]}, ${allWalls[0]} walls, qty ${totalQty}.`,
          `Total price: €${totalPaidEuros}.`,
          names.length ? `Files: ${names.join(", ")}.` : "",
          paths.length ? `Paths: ${paths.join(", ")}.` : "",
          language ? `Language: ${language}.` : "",
          piecesStr,
        ].filter(Boolean).join(" ");
      } else {
        const matsLabel = uniqueMats.join(", ");
        const partsSummary = enrichedPieces
          .map((p: { name: string; quantity: number; material: string; infill: number; wallLoops: number; color: string | null }) => {
            const spec = `[${p.material} ${p.infill}% ${p.wallLoops}w${p.color ? ` ${p.color}` : ""}]`;
            return `${p.name} x${p.quantity} ${spec}`;
          })
          .join("; ");
        notes = [
          "Instant checkout (self-service).",
          contactEmail ? `Email: ${contactEmail}.` : "",
          `Material: Mixed (${matsLabel}).`,
          `Infill: mixed, mixed walls, qty ${totalQty}.`,
          `Total price: €${totalPaidEuros}.`,
          names.length ? `Files: ${names.join(", ")}.` : "",
          paths.length ? `Paths: ${paths.join(", ")}.` : "",
          language ? `Language: ${language}.` : "",
          `Parts: ${partsSummary}.`,
        ].filter(Boolean).join(" ");
      }

      // ── DB insert ────────────────────────────────────────────────────────────
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
          product_title: resolvedProductTitle,
          customer_phone: (typeof contactPhone === "string" && contactPhone.trim()) || "see notes",
          customer_email: (typeof contactEmail === "string" && contactEmail.trim()) || null,
          status: "awaiting_payment",
          fulfillment,
          notes,
          photos: [],
          payment_method: "stripe",
          payment_status: "pending",
          file_paths: paths,
          pieces: enrichedPieces,
        })
        .select("id, order_number")
        .single();

      if (orderErr || !orderRow) {
        console.error("Order insert failed:", orderErr);
        return json({ error: "ORDER_INSERT_FAILED", details: orderErr?.message }, 500);
      }

      // ── Stripe session ───────────────────────────────────────────────────────
      const langStr = typeof language === "string" ? language : "";
      const lineItems = buildStripeLineItems(
        order,
        enrichedPieces.map((p: { name: string; quantity: number; material: string; infill: number; wallLoops: number; color: string | null }) => ({
          name: p.name,
          quantity: p.quantity,
          material: p.material,
          infill: p.infill,
          wallLoops: p.wallLoops,
          color: p.color ?? undefined,
        })),
        langStr,
      );

      const params = new URLSearchParams({ "mode": "payment" });

      for (let i = 0; i < lineItems.length; i++) {
        params.set(`line_items[${i}][quantity]`, "1");
        params.set(`line_items[${i}][price_data][currency]`, "eur");
        params.set(`line_items[${i}][price_data][unit_amount]`, String(lineItems[i].amount));
        params.set(`line_items[${i}][price_data][product_data][name]`, lineItems[i].name);
      }

      params.set("metadata[order_id]", orderRow.id);
      params.set("metadata[order_number]", String(orderRow.order_number));
      params.set("metadata[fulfillment]", fulfillment);
      params.set("metadata[pricing_version]", "2");
      params.set("metadata[part_count]", String(enrichedPieces.length));
      params.set("metadata[materials]", uniqueMats.join(",").slice(0, 200));

      params.set("success_url", `${SITE_URL}/?checkout=success`);
      params.set("cancel_url", `${SITE_URL}/?checkout=cancelled`);

      if (typeof ph_distinct_id === "string" && ph_distinct_id.trim()) params.set("metadata[ph_distinct_id]", ph_distinct_id.trim().slice(0, 500));
      if (typeof ph_session_id === "string" && ph_session_id.trim()) params.set("metadata[ph_session_id]", ph_session_id.trim().slice(0, 500));
      if (typeof utm_source === "string" && utm_source.trim()) params.set("metadata[utm_source]", utm_source.trim().slice(0, 100));
      if (typeof utm_medium === "string" && utm_medium.trim()) params.set("metadata[utm_medium]", utm_medium.trim().slice(0, 100));
      if (typeof utm_content === "string" && utm_content.trim()) params.set("metadata[utm_content]", utm_content.trim().slice(0, 100));
      if (typeof utm_campaign === "string" && utm_campaign.trim()) params.set("metadata[utm_campaign]", utm_campaign.trim().slice(0, 100));
      if (typeof product_type === "string" && product_type.trim()) params.set("metadata[product_type]", product_type.trim().slice(0, 100));
      if (typeof customer_ref === "string" && customer_ref.trim()) params.set("metadata[customer_ref]", customer_ref.trim().slice(0, 100));

      if (fulfillment === "shipping") {
        params.set("shipping_address_collection[allowed_countries][0]", "ES");
        params.set("phone_number_collection[enabled]", "true");
        const isEs2 = langStr.toLowerCase().startsWith("es");
        const isCa2 = langStr.toLowerCase().startsWith("ca");
        const shippingLabel = isEs2 ? "Envío estándar" : isCa2 ? "Enviament estàndard" : "Standard shipping";
        params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
        params.set("shipping_options[0][shipping_rate_data][display_name]", shippingLabel);
        params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", "600");
        params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
      }

      if (typeof contactEmail === "string" && contactEmail.trim()) {
        params.set("customer_email", contactEmail.trim());
      }

      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Stripe v2 checkout session failed:", err);
        return json({ error: "STRIPE_SESSION_FAILED", details: err }, 502);
      }

      const session = await res.json();
      console.log(`Instant checkout v2 session created for order ${orderRow.id} (#${orderRow.order_number})`);

      return json({ checkoutUrl: session.url });
    }

    // ── LEGACY PATH (untouched) ────────────────────────────────────────────────
    const {
      material, color, infill, wallLoops, quantity,
      filePaths, fileNames, exactPrice, contactEmail, contactPhone, language,
      fulfillment,
      productName,       // optional: human-readable product name (parts pages)
      shippingRateEuros, // optional: add a separate shipping_option line (parts pages)
      pieces,
      // B1: visitor identity threaded from client for Stripe metadata
      ph_distinct_id, ph_session_id,
      utm_source, utm_medium, utm_content, utm_campaign,
      product_type, part_slug, customer_ref,
    } = body ?? {};

    const price = Number(exactPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return json({ error: "INVALID_PRICE" }, 400);
    }
    if (price > MAX_PRICE) {
      console.warn(`Rejected instant checkout: price ${price} exceeds ceiling (IP: ${clientIP})`);
      return json({ error: "PRICE_ABOVE_INSTANT_LIMIT" }, 400);
    }
    if (typeof material !== "string" || !ALLOWED_MATERIALS.includes(material)) {
      return json({ error: "INVALID_MATERIAL" }, 400);
    }
    if (fulfillment !== "pickup" && fulfillment !== "shipping") {
      return json({ error: "INVALID_FULFILLMENT" }, 400);
    }
    if (!STRIPE_SECRET_KEY) return json({ error: "STRIPE_NOT_CONFIGURED" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const names: string[] = Array.isArray(fileNames) ? fileNames.map(String) : [];
    const paths: string[] = Array.isArray(filePaths) ? filePaths.map(String) : [];
    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    const piecesStr = Array.isArray(pieces) && pieces.length > 0
      ? `Pieces: ${pieces.map((p: { name: string; quantity: number }) => `${p.name} x${p.quantity}`).join(", ")}.`
      : "";

    const notes = [
      "Instant checkout (self-service, ≤ €35).",
      contactEmail ? `Email: ${contactEmail}.` : "",
      `Material: ${material}${color ? ` / ${color}` : ""}.`,
      `Infill: ${infill ?? "n/a"}, ${wallLoops ?? "n/a"} walls, qty ${qty}.`,
      `Total price: €${price.toFixed(2)}.`,
      names.length ? `Files: ${names.join(", ")}.` : "",
      paths.length ? `Paths: ${paths.join(", ")}.` : "",
      language ? `Language: ${language}.` : "",
      piecesStr,
    ].filter(Boolean).join(" ");

    const resolvedProductTitle =
      typeof productName === "string" && productName.trim()
        ? productName.trim()
        : `3D Print — ${material}${color ? ` (${color})` : ""}`;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        product_title: resolvedProductTitle,
        customer_phone: (typeof contactPhone === "string" && contactPhone.trim()) || "see notes",
        customer_email:
          (typeof contactEmail === "string" && contactEmail.trim()) || null,
        status: "awaiting_payment",
        fulfillment,
        notes,
        photos: [],
        payment_method: "stripe",
        payment_status: "pending",
        file_paths: paths,
        pieces: Array.isArray(pieces) ? pieces : null,
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      console.error("Order insert failed:", orderErr);
      return json({ error: "ORDER_INSERT_FAILED", details: orderErr?.message }, 500);
    }

    const params = new URLSearchParams({
      "mode": "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][unit_amount]": String(Math.round(price * 100)),
      "line_items[0][price_data][product_data][name]":
        resolvedProductTitle,
      "metadata[order_id]": order.id,
      "metadata[order_number]": String(order.order_number),
      "metadata[fulfillment]": fulfillment,
      "success_url": `${SITE_URL}/?checkout=success`,
      "cancel_url": `${SITE_URL}/?checkout=cancelled`,
    });
    // B1: visitor identity — added to metadata for server-side order_paid event
    if (typeof ph_distinct_id === "string" && ph_distinct_id.trim()) params.set("metadata[ph_distinct_id]", ph_distinct_id.trim().slice(0, 500));
    if (typeof ph_session_id === "string" && ph_session_id.trim()) params.set("metadata[ph_session_id]", ph_session_id.trim().slice(0, 500));
    if (typeof utm_source === "string" && utm_source.trim()) params.set("metadata[utm_source]", utm_source.trim().slice(0, 100));
    if (typeof utm_medium === "string" && utm_medium.trim()) params.set("metadata[utm_medium]", utm_medium.trim().slice(0, 100));
    if (typeof utm_content === "string" && utm_content.trim()) params.set("metadata[utm_content]", utm_content.trim().slice(0, 100));
    if (typeof utm_campaign === "string" && utm_campaign.trim()) params.set("metadata[utm_campaign]", utm_campaign.trim().slice(0, 100));
    if (typeof product_type === "string" && product_type.trim()) params.set("metadata[product_type]", product_type.trim().slice(0, 100));
    if (typeof part_slug === "string" && part_slug.trim()) params.set("metadata[part_slug]", part_slug.trim().slice(0, 200));
    if (typeof customer_ref === "string" && customer_ref.trim()) params.set("metadata[customer_ref]", customer_ref.trim().slice(0, 100));
    if (fulfillment === "shipping") {
      params.set("shipping_address_collection[allowed_countries][0]", "ES");
      params.set("phone_number_collection[enabled]", "true");
    }
    const shippingCents =
      typeof shippingRateEuros === "number" && shippingRateEuros > 0
        ? Math.round(shippingRateEuros * 100)
        : 0;
    if (shippingCents > 0) {
      params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
      params.set("shipping_options[0][shipping_rate_data][display_name]", "Envío estándar");
      params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(shippingCents));
      params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
    }
    if (typeof contactEmail === "string" && contactEmail.trim()) {
      params.set("customer_email", contactEmail.trim());
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Stripe checkout session failed:", err);
      return json({ error: "STRIPE_SESSION_FAILED", details: err }, 502);
    }

    const session = await res.json();
    console.log(`Instant checkout session created for order ${order.id} (#${order.order_number})`);

    return json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error("create-instant-checkout error:", err?.message);
    return json({ error: "INTERNAL_ERROR", message: err?.message ?? "unknown" }, 500);
  }
});
