export type LayerId =
  | 'checkout_modal'
  | 'home_body'
  | 'home_hero'
  | 'upload_area'
  | 'header'
  | 'global_style'
  | 'site';

export type VariantId = 'A' | 'B' | 'C' | 'D';

export interface ExperimentDef {
  id: string;
  layer: LayerId;
  variants: VariantId[];
  pages?: string[];      // route prefixes; undefined = all pages
  langs?: string[];      // undefined = all langs
  primaryMetric: string;
  guardrailMetrics?: string[];
  startedOn: string;     // YYYY-MM-DD
  minDays: number;
  maxDays: number;
  enabled: boolean;
}

export const LAYERS: LayerId[] = [
  'checkout_modal',
  'home_body',
  'home_hero',
  'upload_area',
  'header',
  'global_style',
  'site',
];

// Source of truth for all experiments.
// Items are added here and in the pre-paint script (index.html) together.
export const REGISTRY: ExperimentDef[] = [
  {
    id: 'header_btn_r2',
    layer: 'header',
    variants: ['A', 'B'],
    langs: ['es', 'en', 'ca'],
    primaryMetric: 'instant_checkout_initiated',
    guardrailMetrics: ['whatsapp_click'],
    startedOn: '2026-10-19',
    minDays: 21,
    maxDays: 56,
    enabled: true,
  },
  {
    id: 'modal_actions_r1',
    layer: 'checkout_modal',
    variants: ['A', 'B', 'C'],
    primaryMetric: 'instant_checkout_initiated',
    guardrailMetrics: ['whatsapp_click'],
    startedOn: '2026-10-20',
    minDays: 21,
    maxDays: 56,
    enabled: false,
    // Concluded 2026-10-29: early stop by owner decision. Sample too small for a statistical
    // winner. Variant B (buy-first, text links for review/WhatsApp) shipped permanently.
  },
  {
    id: 'home_proof_r1',
    layer: 'home_body',
    variants: ['A', 'B', 'C'],
    pages: ['/', '/ca/', '/3d-printing-service'],
    primaryMetric: 'upload_started',
    startedOn: '2026-10-20',
    minDays: 21,
    maxDays: 56,
    enabled: true,
  },
  {
    id: 'upload_area_r1',
    layer: 'upload_area',
    variants: ['A', 'B', 'C'],
    primaryMetric: 'upload_started',
    startedOn: '2026-10-20',
    minDays: 21,
    maxDays: 56,
    enabled: true,
  },
  {
    // Site-wide design variant. Every page inherits A or B deterministically from
    // the visitor id. Pre-paint sets data-xp-site-variant on <html>; <SiteShell>
    // and <Header> read it. Kept disabled until Phase 9 verification passes;
    // ?xp=site_variant:B forces B site-wide for QA.
    id: 'site_variant',
    layer: 'site',
    variants: ['A', 'B'],
    primaryMetric: 'upload_started',
    guardrailMetrics: ['whatsapp_click'],
    startedOn: '2026-11-13',
    minDays: 21,
    maxDays: 90,
    enabled: true,
  },
  {
    id: 'home_v2',
    layer: 'home_hero',
    variants: ['A', 'B'],
    pages: ['/', '/ca/', '/3d-printing-barcelona', '/de/', '/fr/', '/it/', '/nl/', '/pt/'],
    primaryMetric: 'upload_started',
    guardrailMetrics: ['whatsapp_click'],
    startedOn: '2026-11-11',
    minDays: 21,
    maxDays: 90,
    // Phase 10.1: enabled at 50/50 after section 9 verification passed.
    enabled: true,
  },
];

/** HTML attribute name for a given experiment ID. */
export function expAttr(id: string): string {
  return 'data-xp-' + id.replace(/_/g, '-');
}

/** JavaScript dataset key for a given experiment ID. */
export function expDatasetKey(id: string): string {
  const parts = ('xp-' + id.replace(/_/g, '-')).split('-');
  return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}
