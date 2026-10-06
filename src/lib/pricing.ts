// PRICING-START
const SETUP_FEE = 8;
const RATE_PER_GRAM = 0.22;
const MIN_PRICE = 10;
const INSTANT_BUY_MAX = 52.5;

export const MATERIALS: Record<string, { density: number; multiplier: number }> = {
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

export const URGENCY_MULTIPLIER: Record<string, number> = {
  standard: 1.0,
  express:  1.25,
  urgent:   1.6,
};

export const INSTANT_MATERIALS = ["PLA", "PETG", "ABS", "TPU"];

export function wallFactor(loops: number): number {
  if (loops <= 2) return 0.14;
  if (loops === 3) return 0.20;
  if (loops === 4) return 0.27;
  return Math.min(0.27 + (loops - 4) * 0.07, 0.80);
}

export function effectiveFill(infillPct: number, loops: number): number {
  const wf = wallFactor(loops);
  return wf + (infillPct / 100) * (1 - wf);
}

export function pricingRound(x: number): number {
  return Math.floor(x + 0.5);
}

export interface PricePiece {
  volumeMm3: number;
  quantity: number;
  material: string;
  infill: number;
  wallLoops: number;
}

export interface OrderResult {
  parts: Array<{ gramsPerUnit: number; costCents: number }>;
  setupCents: number;
  minAdjCents: number;
  expressCents: number;
  capShaveCents: number;
  totalCents: number;
  chargedPrintCents: number;
  eligible: boolean;
}

export function computeOrder(pieces: PricePiece[], urgency: string): OrderResult {
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

export function buildStripeLineItems(
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

// ─── Per-part settings ────────────────────────────────────────────────────────

import type { MeshAnalysis, QualityKey } from "./estimator/core";

export interface PartSettings {
  material?: string;
  color?: string;
  infill?: number;
  wallLoops?: number;
  multicolour?: boolean;
  quality?: QualityKey;
  supports?: boolean;
  orientation?: 'auto' | number;
}

export interface PartDefaults {
  material: string;
  color: string;
  infill: number;
  wallLoops: number;
  multicolour: boolean;
  quality?: QualityKey;
  supports?: boolean;
  orientation?: 'auto' | number;
}

export interface ParsedFileForPricing {
  id: string;
  volumeMm3: number;
  qty: number;
  parseError?: string;
  hasHeavyOverhangs?: boolean;
  settings?: PartSettings;
  analysis?: MeshAnalysis;
}

export interface ParsedFile extends ParsedFileForPricing {
  name: string;
  sizeBytes: number;
  file?: File;
}

export interface MaterialOption {
  key: string;
  label: string;
  descriptorKey: string;
}

export function effectivePartSettings(
  part: ParsedFileForPricing,
  defaults: PartDefaults,
): Required<PartSettings> {
  return {
    material: part.settings?.material ?? defaults.material,
    color: part.settings?.color ?? defaults.color,
    infill: part.settings?.infill ?? defaults.infill,
    wallLoops: part.settings?.wallLoops ?? defaults.wallLoops,
    multicolour: part.settings?.multicolour ?? defaults.multicolour,
    quality: part.settings?.quality ?? defaults.quality ?? 'standard',
    supports: part.settings?.supports ?? defaults.supports ?? true,
    orientation: part.settings?.orientation ?? defaults.orientation ?? 'auto',
  };
}

export function isPartCustomized(part: ParsedFileForPricing): boolean {
  const s = part.settings;
  if (!s) return false;
  return (
    s.material !== undefined ||
    s.color !== undefined ||
    s.infill !== undefined ||
    s.wallLoops !== undefined ||
    s.multicolour !== undefined ||
    s.quality !== undefined ||
    s.supports !== undefined ||
    s.orientation !== undefined
  );
}

// ─── Bundle estimate ──────────────────────────────────────────────────────────

export interface BundleEstimate {
  totalGrams: number;
  totalHours: number;
  totalUnits: number;
  bundlePrice: number;
  total: number;
  low: number;
  high: number;
  supportHeavy: boolean;
}

export interface BundleEstimateV2 extends BundleEstimate {
  orderResult: OrderResult;
}

export function computeBundleV2(
  parts: ParsedFileForPricing[],
  defaults: PartDefaults,
  urgency: string,
): BundleEstimateV2 | null {
  const validParts = parts.filter(p => !p.parseError && p.volumeMm3 > 0);
  if (validParts.length === 0) return null;

  const pieces: PricePiece[] = validParts.map(p => {
    const eff = effectivePartSettings(p, defaults);
    return {
      volumeMm3: p.volumeMm3,
      quantity: p.qty,
      material: eff.material,
      infill: eff.infill,
      wallLoops: eff.wallLoops,
    };
  });

  const orderResult = computeOrder(pieces, urgency);

  let totalGrams = 0;
  let totalUnits = 0;
  for (let i = 0; i < validParts.length; i++) {
    totalGrams += orderResult.parts[i].gramsPerUnit * validParts[i].qty;
    totalUnits += validParts[i].qty;
  }

  const totalHours = totalGrams / 28;
  const total = orderResult.chargedPrintCents / 100;
  const supportHeavy = validParts.some(p => !!p.hasHeavyOverhangs);

  return {
    totalGrams,
    totalHours,
    totalUnits,
    bundlePrice: total,
    total,
    low: Math.max(total * 0.85, 10),
    high: Math.max(total * 1.15, 20),
    supportHeavy,
    orderResult,
  };
}
