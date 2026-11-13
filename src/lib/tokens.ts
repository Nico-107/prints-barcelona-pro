/**
 * Phase 2.1: design tokens in one file.
 *
 * Tailwind reads the same values from tailwind.config.ts (classes like
 * `rounded-ds-md`, `shadow-ds-card`, `max-w-ds-container`). Use these
 * TS constants from JSX when inline styling is unavoidable.
 */

export const colors = {
  navy:         '#0F172A',
  navyDeep:     '#0B1120',
  amber:        '#F5A524',
  blue:         '#2F5BEA',
  surface:      '#F6F8FC',
  surfaceBlue:  '#F3F6FF',
  line:         '#E3E8F0',
  textMuted:    '#5B6577',
  onDarkMuted:  '#B8C4DA',
  onDarkSoft:   '#D5DCEA',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
} as const;

export const shadows = {
  card:     '0 1px 2px rgba(15,23,42,0.05), 0 2px 8px rgba(15,23,42,0.06)',
  elevated: '0 4px 14px rgba(15,23,42,0.08), 0 12px 32px rgba(15,23,42,0.10)',
  overlay:  '0 24px 56px rgba(15,23,42,0.18)',
} as const;

export const container = {
  maxWidth: 1200,
  gutterSm: 16,
  gutterMd: 24,
} as const;

export const sectionPadding = {
  mobile:  64,
  desktop: 96,
} as const;

/** Type scale from Phase 2.2: H1 56/40, H2 40/30, H3 24/20, body 17/16. */
export const type = {
  h1: { desktop: 56, mobile: 40 },
  h2: { desktop: 40, mobile: 30 },
  h3: { desktop: 24, mobile: 20 },
  body: { desktop: 17, mobile: 16 },
} as const;
