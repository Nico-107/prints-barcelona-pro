// P1 — single pricing source (engine + priceOrder). Imported by:
//   - supabase/functions/create-instant-checkout/index.ts (Deno; relative path)
//   - src/lib/estimator/core.ts (Vite; path-aliased as @pricing until the full refactor lands)
//   - src/__checkpoint__/legacy/deployedServer.ts (oracle; untouched copy of the 0aebcd6 build)
//
// Dependency-free, pure TypeScript — no DOM, no Node, no Deno APIs. Numerically identical to
// the 0aebcd6 deployed server: Phase P keeps the price *levels* unchanged (D-7 in the master
// prompt). Phase P only fixes *correctness* (robust analysis, rotation plate fit, scale, units).

export const EST = {
  version: 3,
  wallWidthMm: 0.4425,
  infillFactor: 0.905,
  shellFactor: 0.9296,
  topSkinMm: 1.0,
  bottomSkinMm: 0.6,
  supportCm3PerCm2: 0.3256,
  supportSecPerCm3: 782.9045,
  overhangNz: 0.85,
  bedContactMm: 0.4,
  timeCoef: [790.4113, 71.3533, 284.6187, 699.0554, 2.5218] as readonly number[],
  setupEur: 0,
  minimumEur: 10,
  plasticEurPerG: 0.055,
  timeTiers: [
    { upToH: 3, eurPerH: 4.95 },
    { upToH: 8, eurPerH: 3.85 },
    { upToH: Infinity, eurPerH: 2.75 },
  ] as readonly { upToH: number; eurPerH: number }[],
  instantMaxCents: 20000,
  shippingCents: 590,
  plate: { x: 256, y: 256, z: 261, packAreaMm2: 37000, gapMm: 4 },
  materials: {
    PLA: { density: 1.24, priceMult: 1.0, timeMult: 1.0, instant: true },
    PETG: { density: 1.27, priceMult: 1.1, timeMult: 1.0, instant: true },
    ABS: { density: 1.04, priceMult: 1.3, timeMult: 1.08, instant: true },
    ASA: { density: 1.07, priceMult: 1.3, timeMult: 1.0, instant: true },
    TPU: { density: 1.2, priceMult: 1.3, timeMult: 1.29, instant: true },
    Nylon: { density: 1.14, priceMult: 1.4, timeMult: 1.0, instant: true },
    HIPS: { density: 1.07, priceMult: 1.2, timeMult: 1.0, instant: false },
    PC: { density: 1.2, priceMult: 1.5, timeMult: 1.0, instant: false },
    PVA: { density: 1.23, priceMult: 1.5, timeMult: 1.0, instant: false },
    "PLA-CF": { density: 1.3, priceMult: 1.6, timeMult: 1.0, instant: false },
    "PETG-CF": { density: 1.3, priceMult: 1.6, timeMult: 1.0, instant: false },
    "Nylon-CF": { density: 1.2, priceMult: 1.6, timeMult: 1.0, instant: false },
  } as Record<string, { density: number; priceMult: number; timeMult: number; instant: boolean }>,
  quality: { fast: 0.91, standard: 1.0, fine: 1.22, high: 1.51, ultra: 2.19 } as Record<string, number>,
  urgency: { standard: 1.0, express: 1.25, urgent: 1.6 } as Record<string, number>,
} as const;

export type QualityKey = "fast" | "standard" | "fine" | "high" | "ultra";

export interface OrientationFeatures {
  index: number;
  name: string;
  aUp: number;
  aDown: number;
  aSide: number;
  heightMm: number;
  sizeXMm: number;
  sizeYMm: number;
  overhangCm2: number;
}

export interface MeshAnalysis {
  triangles: number;
  skipped: number;
  volumeMm3: number;
  insideOut: boolean;
  boundsMm: [number, number, number];
  orientations: OrientationFeatures[];
}

export interface EstimatorSettings {
  material: string;
  infillPct: number;
  wallLoops: number;
  quality: QualityKey;
  supports: boolean;
  orientation: "auto" | number;
}

export interface PartEstimate {
  orientation: number;
  orientationName: string;
  plasticCm3: number;
  supportCm3: number;
  grams: number;
  timeSec: number;
  fixedSec: number;
  sizeXMm: number;
  sizeYMm: number;
  heightMm: number;
  fitsPlate: boolean;
}

export const EST_V4 = {
  minimumEur: 9.9,
  timeTiers: [
    { upToH: 3, eurPerH: 4.95 },
    { upToH: 8, eurPerH: 3.85 },
    { upToH: Infinity, eurPerH: 1.95 },
  ] as readonly { upToH: number; eurPerH: number }[],
};

export function charmCents(cents: number): number {
  return Math.max(990, Math.floor((cents - 90) / 100 + 0.5) * 100 + 90);
}

export function tierCostEur(
  hours: number,
  tiers: readonly { upToH: number; eurPerH: number }[] = EST.timeTiers,
): number {
  let prev = 0,
    cost = 0;
  for (const t of tiers) {
    if (hours > prev) cost += (Math.min(hours, t.upToH) - prev) * t.eurPerH;
    prev = t.upToH;
  }
  return cost;
}

export function fits(f: OrientationFeatures): boolean {
  const p = EST.plate;
  return f.sizeXMm <= p.x && f.sizeYMm <= p.y && f.heightMm <= p.z;
}

export function estimateForOrientation(
  a: MeshAnalysis,
  o: number,
  s: EstimatorSettings,
): PartEstimate {
  const f = a.orientations[o],
    mat = EST.materials[s.material] ?? EST.materials.PLA;
  const infill = s.infillPct / 100,
    walls = s.wallLoops,
    V = a.volumeMm3;
  const shell = Math.min(
    f.aSide * walls * EST.wallWidthMm + f.aUp * EST.topSkinMm + f.aDown * EST.bottomSkinMm,
    V,
  );
  const plastic =
    (EST.shellFactor * shell + Math.max(V - shell, 0) * infill * EST.infillFactor) / 1000;
  const support = s.supports ? EST.supportCm3PerCm2 * f.overhangCm2 : 0;
  const inf = (Math.max(V - shell, 0) * infill) / 1000;
  const c = EST.timeCoef;
  const base =
    c[0] + c[1] * ((f.aSide * walls) / 1000) + c[2] * inf + c[3] * inf * infill + c[4] * (f.heightMm / 0.2);
  const q = EST.quality[s.quality] ?? 1;
  const timeSec = c[0] + (base - c[0]) * mat.timeMult * q + EST.supportSecPerCm3 * support;
  return {
    orientation: o,
    orientationName: f.name,
    plasticCm3: plastic,
    supportCm3: support,
    grams: (plastic + support) * mat.density,
    timeSec,
    fixedSec: c[0],
    sizeXMm: f.sizeXMm,
    sizeYMm: f.sizeYMm,
    heightMm: f.heightMm,
    fitsPlate: fits(f),
  };
}

function rankCostEur(e: PartEstimate, material: string): number {
  const m = EST.materials[material] ?? EST.materials.PLA;
  return m.priceMult * (e.grams * EST.plasticEurPerG + tierCostEur(e.timeSec / 3600));
}

export function estimatePart(a: MeshAnalysis, s: EstimatorSettings): PartEstimate {
  if (s.orientation !== "auto") return estimateForOrientation(a, Math.max(0, Math.min(5, s.orientation | 0)), s);
  let best: PartEstimate | null = null,
    bestCost = Infinity;
  for (let o = 0; o < 6; o++) {
    const e = estimateForOrientation(a, o, s);
    const cost = rankCostEur(e, s.material) + (e.fitsPlate ? 0 : 1e6);
    if (cost < bestCost - 1e-9) {
      bestCost = cost;
      best = e;
    }
  }
  return best as PartEstimate;
}

export interface OrderPartInput {
  name: string;
  quantity: number;
  material: string;
  estimate: PartEstimate;
}

export interface OrderPartLine {
  name: string;
  quantity: number;
  material: string;
  grams: number;
  timeSec: number;
  costCents: number;
}

export interface OrderPrice {
  parts: OrderPartLine[];
  setupCents: number;
  minAdjCents: number;
  expressCents: number;
  totalCents: number;
  baseCents: number;
  plates: number;
  orderHours: number;
  instantEligible: boolean;
  reasons: string[];
}

const rnd = (x: number) => Math.floor(x + 0.5);

function applyUnitStepMinimum(
  rawTotalEur: number,
  totalUnits: number,
  minimumEur: number = EST.minimumEur,
): number {
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
  let footprint = 0,
    marg = 0;
  const margs = parts.map((x) => Math.max(x.estimate.timeSec - x.estimate.fixedSec, 0) * x.quantity);
  parts.forEach((x, i) => {
    footprint += x.quantity * (x.estimate.sizeXMm + p.gapMm) * (x.estimate.sizeYMm + p.gapMm);
    marg += margs[i];
  });
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
  const partCents = raw.map((r) => rnd(r * 100));
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
  if (!instantEligible) reasons.push("over-limit");
  for (const x of parts) {
    if (!EST.materials[x.material]?.instant) {
      instantEligible = false;
      reasons.push("material:" + x.material);
    }
    if (!x.estimate.fitsPlate) {
      instantEligible = false;
      reasons.push("oversize:" + x.name);
    }
  }
  return {
    parts: parts.map((x, i) => ({
      name: x.name,
      quantity: x.quantity,
      material: x.material,
      grams: x.estimate.grams,
      timeSec: x.estimate.timeSec,
      costCents: partCents[i],
    })),
    setupCents,
    minAdjCents,
    expressCents,
    totalCents,
    baseCents,
    plates,
    orderHours,
    instantEligible,
    reasons,
  };
}
