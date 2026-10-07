import type { QualityKey } from "./estimator/core";

/** "What is it for?" chips -> recommended material. The owner edits THIS FILE to change recommendations; the UI only reads it. */
export type UseCase = 'decor' | 'everyday' | 'outdoor' | 'car' | 'strong' | 'flexible' | 'unsure';
export const USE_CASES: ReadonlyArray<{ key: UseCase; material: string | null }> = [
  { key: 'decor', material: 'PLA' },
  { key: 'everyday', material: 'PETG' },
  { key: 'outdoor', material: 'ASA' },
  { key: 'car', material: 'ASA' },
  { key: 'strong', material: 'PETG' },
  { key: 'flexible', material: 'TPU' },
  { key: 'unsure', material: null },          // keeps the current material; the customer explains in the notes
];
export function recommendMaterial(u: UseCase): string | null {
  return USE_CASES.find(x => x.key === u)?.material ?? null;
}

/** Quality presets shown to customers (the engine also knows 'fine', which is deliberately not offered). */
export const QUALITY_OPTIONS: ReadonlyArray<{ key: QualityKey; layerMm: number }> = [
  { key: 'fast', layerMm: 0.24 }, { key: 'standard', layerMm: 0.20 }, { key: 'high', layerMm: 0.12 }, { key: 'ultra', layerMm: 0.08 },
];

/** Strength presets -> infill % and wall count. All inside the range the server accepts for instant buy (infill <= 50, walls <= 4). */
export type StrengthKey = 'light' | 'standard' | 'strong' | 'maximum';
export const STRENGTH_PRESETS: ReadonlyArray<{ key: StrengthKey; infill: number; walls: number }> = [
  { key: 'light', infill: 10, walls: 2 }, { key: 'standard', infill: 15, walls: 2 }, { key: 'strong', infill: 30, walls: 3 }, { key: 'maximum', infill: 50, walls: 4 },
];
export function strengthFor(infill: number, walls: number): StrengthKey | 'custom' {
  return STRENGTH_PRESETS.find(p => p.infill === infill && p.walls === walls)?.key ?? 'custom';
}

/** Same-day pickup is only promised for these materials (never for ABS, ASA, Nylon). Urgent = "next day" for every material. */
export const SAME_DAY_MATERIALS: readonly string[] = ['PLA', 'PETG', 'TPU'];
export const canPromiseSameDay = (material: string): boolean => SAME_DAY_MATERIALS.includes(material);
