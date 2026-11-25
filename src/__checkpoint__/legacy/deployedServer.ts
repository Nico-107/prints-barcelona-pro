// Oracle: pure logic of the deployed edge function at commit 0aebcd6 (18 Nov 2026).
// Used by hotfix tests (H1/H2/H3/H4) to prove the UI matches what Stripe actually charges today.
// Do not edit to "improve" behaviour — the point of this file is to freeze what the server does.
// Extracted from supabase/functions/create-instant-checkout/{index.ts,checkout-policy.ts} @ 0aebcd6.

export const MAX_CHARGE_CENTS = 20590;
export const SHIP_COUNTRIES = ["ES","PT","FR","DE","IT","NL","BE","LU","AT","IE","PL","DK","SE","FI"] as const;

export function shippingChargeCents(fulfillment: string, discountedSubtotalCents: number): number {
  return fulfillment === "shipping" && discountedSubtotalCents < 10000 ? 590 : 0;
}

export function chargeAllowed(subtotalCents: number, fulfillment: string): boolean {
  return Number.isFinite(subtotalCents) && subtotalCents > 0 &&
    subtotalCents + shippingChargeCents(fulfillment, subtotalCents) <= MAX_CHARGE_CENTS;
}

export const EST = {
  version: 3,
  wallWidthMm: 0.4425, infillFactor: 0.905, shellFactor: 0.9296,
  topSkinMm: 1.0, bottomSkinMm: 0.6,
  supportCm3PerCm2: 0.3256, supportSecPerCm3: 782.9045,
  overhangNz: 0.85, bedContactMm: 0.4,
  timeCoef: [790.4113, 71.3533, 284.6187, 699.0554, 2.5218] as readonly number[],
  setupEur: 0, minimumEur: 10, plasticEurPerG: 0.055,
  timeTiers: [ { upToH: 3, eurPerH: 4.95 }, { upToH: 8, eurPerH: 3.85 }, { upToH: Infinity, eurPerH: 2.75 } ] as readonly { upToH: number; eurPerH: number }[],
  instantMaxCents: 20000, shippingCents: 590,
  plate: { x: 256, y: 256, z: 261, packAreaMm2: 37000, gapMm: 4 },
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
  aUp: number; aDown: number; aSide: number;
  heightMm: number; sizeXMm: number; sizeYMm: number;
  overhangCm2: number;
}
export interface MeshAnalysis {
  triangles: number; skipped: number; volumeMm3: number; insideOut: boolean;
  boundsMm: [number, number, number]; orientations: OrientationFeatures[];
}
export interface EstimatorSettings {
  material: string; infillPct: number; wallLoops: number;
  quality: QualityKey; supports: boolean;
  orientation: 'auto' | number;
}
export interface PartEstimate {
  orientation: number; orientationName: string;
  plasticCm3: number; supportCm3: number; grams: number;
  timeSec: number; fixedSec: number;
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

export const EST_V4 = {
  minimumEur: 9.9,
  timeTiers: [ { upToH: 3, eurPerH: 4.95 }, { upToH: 8, eurPerH: 3.85 }, { upToH: Infinity, eurPerH: 1.95 } ] as readonly { upToH: number; eurPerH: number }[],
};

export function charmCents(cents: number): number {
  return Math.max(990, Math.floor((cents - 90) / 100 + 0.5) * 100 + 90);
}

export function tierCostEur(hours: number, tiers: readonly { upToH: number; eurPerH: number }[] = EST.timeTiers): number {
  let prev = 0, cost = 0;
  for (const t of tiers) { if (hours > prev) cost += (Math.min(hours, t.upToH) - prev) * t.eurPerH; prev = t.upToH; }
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

function rankCostEur(e: PartEstimate, material: string): number {
  const m = EST.materials[material] ?? EST.materials.PLA;
  return m.priceMult * (e.grams * EST.plasticEurPerG + tierCostEur(e.timeSec / 3600));
}

export function estimatePart(a: MeshAnalysis, s: EstimatorSettings): PartEstimate {
  if (s.orientation !== 'auto') return estimateForOrientation(a, Math.max(0, Math.min(5, s.orientation | 0)), s);
  let best: PartEstimate | null = null, bestCost = Infinity;
  for (let o = 0; o < 6; o++) {
    const e = estimateForOrientation(a, o, s);
    const cost = rankCostEur(e, s.material) + (e.fitsPlate ? 0 : 1e6);
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

function applyUnitStepMinimum(rawTotalEur: number, totalUnits: number, minimumEur: number = EST.minimumEur): number {
  const stepFloorEur = minimumEur + 1 * Math.max(0, totalUnits - 1);
  return Math.max(rawTotalEur, stepFloorEur);
}

export function priceOrder(
  parts: OrderPartInput[],
  urgency: string,
  flags: { minOrderUnitStep?: boolean; v4?: boolean } = {},
): OrderPrice {
  const reasons: string[] = [];
  const up = EST.urgency[urgency] ?? 1;
  const p = EST.plate;
  const tiers = flags.v4 ? EST_V4.timeTiers : EST.timeTiers;
  const minimumEur = flags.v4 ? EST_V4.minimumEur : EST.minimumEur;
  let footprint = 0, marg = 0;
  const margs = parts.map(x => Math.max(x.estimate.timeSec - x.estimate.fixedSec, 0) * x.quantity);
  parts.forEach((x, i) => { footprint += x.quantity * (x.estimate.sizeXMm + p.gapMm) * (x.estimate.sizeYMm + p.gapMm); marg += margs[i]; });
  const plates = Math.max(1, Math.ceil(footprint / p.packAreaMm2));
  const fixed = parts.length ? parts[0].estimate.fixedSec : 0;
  const orderSec = plates * fixed + marg;
  const orderHours = orderSec / 3600;
  const timeCost = tierCostEur(orderHours, tiers);
  const nTypes = Math.max(parts.length, 1);
  const raw: number[] = parts.map((x, i) => {
    const m = EST.materials[x.material] ?? EST.materials.PLA;
    const weight = orderSec > 0 ? (margs[i] + (plates * fixed) / nTypes) / orderSec : 1 / nTypes;
    return m.priceMult * (x.quantity * x.estimate.grams * EST.plasticEurPerG + timeCost * weight);
  });
  const rawTotal = EST.setupEur + raw.reduce((a, b) => a + b, 0);
  const totalUnits = parts.reduce((s, x) => s + x.quantity, 0);
  const base = flags.minOrderUnitStep
    ? Math.max(rawTotal, applyUnitStepMinimum(rawTotal, totalUnits, minimumEur))
    : Math.max(rawTotal, minimumEur);
  const total = base * up;
  const setupCents = rnd(EST.setupEur * 100);
  const rawTotalCents = rnd(rawTotal * 100);
  const partCents = raw.map(r => rnd(r * 100));
  const bi = partCents.length ? partCents.reduce((b, c, i) => (c > partCents[b] ? i : b), 0) : -1;
  if (bi >= 0) partCents[bi] += rawTotalCents - setupCents - partCents.reduce((a, b) => a + b, 0);

  let baseCents: number, totalCents: number, minAdjCents: number;
  if (flags.v4) {
    const preBaseCents = rnd(base * 100);
    const charmBase = charmCents(preBaseCents);
    minAdjCents = rawTotalCents < 990 ? 990 - rawTotalCents : 0;
    if (bi >= 0 && rawTotalCents >= 990) partCents[bi] += charmBase - rawTotalCents;
    baseCents = charmBase;
    totalCents = charmCents(rnd(total * 100));
  } else {
    baseCents = rnd(base * 100);
    totalCents = rnd(total * 100);
    minAdjCents = baseCents > rawTotalCents ? baseCents - rawTotalCents : 0;
  }
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

export const V3_INSTANT = {
  infill: [5, 10, 15, 20, 30, 50] as readonly number[],
  wallLoops: [2, 3, 4] as readonly number[],
  quality: ['fast', 'standard', 'fine', 'high', 'ultra'] as readonly string[],
  maxPieces: 20, maxQuantity: 999, maxNameLen: 120,
} as const;

export interface V3Piece { name: string; quantity: number; path: string; material: string; infill: number; wallLoops: number; quality: string; supports: boolean; orientation: 'auto' | number; multicolour?: boolean; color?: string | null }
export interface V4Body { pricingVersion: 4; urgency: string; fulfillment: 'pickup' | 'shipping'; exactPrice: number; promoCode?: string; pieces: V3Piece[] }
export interface V3Result<T> { ok: boolean; value?: T; error?: string }
export interface V3Priced { estimates: PartEstimate[]; order: OrderPrice }

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
  const shippingCents = val.fulfillment === 'shipping' && priced.order.totalCents < 9990 ? 590 : 0;
  return { ok: true, value: { body: val, priced, shippingCents, chargeCents: priced.order.totalCents + shippingCents } };
}

export const PROMO_CODES: Record<string, { pct: number }> = {
  DIMENSION11: { pct: 10 },
};

export function computePromoDiscountCents(code: string | undefined, printSubtotalCents: number): { pct: number; cents: number } {
  if (!code) return { pct: 0, cents: 0 };
  const promo = PROMO_CODES[code.toUpperCase()];
  if (!promo) return { pct: 0, cents: 0 };
  return { pct: promo.pct, cents: Math.round(printSubtotalCents * promo.pct / 100) };
}
