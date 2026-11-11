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
  /** Image file — shows design-request card, excluded from pricing */
  imageFile?: boolean;
  /** Oversized STL (>50 MB) — shows link-upload card, excluded from pricing */
  linkFile?: boolean;
  /** Bounding box in mm — populated for OBJ/3MF/GLB conversions to show detected size */
  bboxMm?: { x: number; y: number; z: number };
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

