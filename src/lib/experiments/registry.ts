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
//
// Concluded tests (shipped winners, removed from registry on 2026-11-24):
//   header_btn_r2  → B "Precios desde 9,90 €" shipped (Header.tsx).
//   upload_area_r1 → B (bigger drop zone + WhatsApp link) shipped; C deleted.
//   buy_label_r1   → A "Comprar · {price}" shipped (OrderPanel.tsx).
//   site_variant   → V1 shipped via SITE_DESIGN constant (useVariant.ts).
export const REGISTRY: ExperimentDef[] = [
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
    // home_proof_r1 continues — but variant B was dropped on 2026-11-24 after
    // the first run showed B was the weakest proof block. Keep A vs C 50/50.
    id: 'home_proof_r1',
    layer: 'home_body',
    variants: ['A', 'C'],
    pages: ['/', '/ca/', '/3d-printing-service'],
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
