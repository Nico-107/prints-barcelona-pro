export type LayerId =
  | 'checkout_modal'
  | 'home_body'
  | 'upload_area'
  | 'header'
  | 'global_style';

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
  'upload_area',
  'header',
  'global_style',
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
    enabled: true,
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
