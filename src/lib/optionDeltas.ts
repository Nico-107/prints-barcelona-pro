import type { ParsedFileForPricing, PartDefaults } from "./pricing";
import type { QualityKey } from "./estimator/core";
import type { StrengthKey } from "./materialGuide";
import { computeBundleV3 } from "./estimate";

export type DeltaKind = 'material' | 'quality' | 'strength' | 'supports' | 'orientation';

export interface OptionDelta {
  kind: DeltaKind;
  value: string | number | boolean;
  deltaEur: number;
  formatted: string; // "+€2.60", "−€1.10", or "Included"
}

function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

function fmt(d: number): string {
  if (Math.abs(d) < 0.005) return "Included";
  return `${d > 0 ? "+" : "−"}€${Math.abs(d).toFixed(2)}`;
}

function delta(parts: ParsedFileForPricing[], a: PartDefaults, b: PartDefaults, urgency: string, flags?: { v4?: boolean }): number {
  const ca = computeBundleV3(parts, a, urgency, flags);
  const cb = computeBundleV3(parts, b, urgency, flags);
  if (!ca || !cb) return 0;
  return roundCents(cb.total - ca.total);
}

export function materialDelta(
  parts: ParsedFileForPricing[],
  defaults: PartDefaults,
  urgency: string,
  material: string,
  flags?: { v4?: boolean },
): OptionDelta {
  const d = delta(parts, defaults, { ...defaults, material }, urgency, flags);
  return { kind: 'material', value: material, deltaEur: d, formatted: fmt(d) };
}

export function qualityDelta(
  parts: ParsedFileForPricing[],
  defaults: PartDefaults,
  urgency: string,
  quality: QualityKey,
  flags?: { v4?: boolean },
): OptionDelta {
  const d = delta(parts, defaults, { ...defaults, quality }, urgency, flags);
  return { kind: 'quality', value: quality, deltaEur: d, formatted: fmt(d) };
}

export function strengthDelta(
  parts: ParsedFileForPricing[],
  defaults: PartDefaults,
  urgency: string,
  key: StrengthKey | 'custom',
  infill: number,
  walls: number,
  flags?: { v4?: boolean },
): OptionDelta {
  const d = delta(parts, defaults, { ...defaults, infill, wallLoops: walls }, urgency, flags);
  return { kind: 'strength', value: key, deltaEur: d, formatted: fmt(d) };
}

export function supportsDelta(
  parts: ParsedFileForPricing[],
  defaults: PartDefaults,
  urgency: string,
  supports: boolean,
  flags?: { v4?: boolean },
): OptionDelta {
  const d = delta(parts, defaults, { ...defaults, supports }, urgency, flags);
  return { kind: 'supports', value: supports, deltaEur: d, formatted: fmt(d) };
}

export function orientationDelta(
  parts: ParsedFileForPricing[],
  defaults: PartDefaults,
  urgency: string,
  orientation: 'auto' | number,
  flags?: { v4?: boolean },
): OptionDelta {
  const d = delta(parts, defaults, { ...defaults, orientation }, urgency, flags);
  return { kind: 'orientation', value: String(orientation), deltaEur: d, formatted: fmt(d) };
}
