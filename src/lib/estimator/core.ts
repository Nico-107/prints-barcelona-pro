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
  setupEur: 0, minimumEur: 10, plasticEurPerG: 0.055,
  timeTiers: [ { upToH: 3, eurPerH: 4.95 }, { upToH: 8, eurPerH: 3.85 }, { upToH: Infinity, eurPerH: 2.75 } ] as readonly { upToH: number; eurPerH: number }[],
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

/** Price an order (all parts) — no setup fee; EUR 10 minimum is folded into the part lines, long-job time tiers on the ORDER's print hours, one line per part. */
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
  const minAdjCents = 0;   // the EUR 10 minimum is folded INTO the part lines (never a separate line / fee)
  if (partCents.length) {
    const bi = partCents.reduce((b, c, i) => (c > partCents[b] ? i : b), 0);
    if (rawTotal < EST.minimumEur && residual > 0) {
      const sum = partCents.reduce((a, b) => a + b, 0);
      let given = 0;
      const share = partCents.map(c => { const g = sum > 0 ? Math.floor(residual * c / sum) : Math.floor(residual / partCents.length); given += g; return g; });
      share.forEach((g, i) => { partCents[i] += g; });
      partCents[bi] += residual - given;
    } else partCents[bi] += residual;
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
// ESTIMATOR-END
