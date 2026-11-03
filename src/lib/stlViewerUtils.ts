export type CompareMode = 'off' | 'coin' | 'card' | 'a4';

export function getUnitWarning(dims: { x: number; y: number; z: number }): 'unit-small' | 'unit-large' | null {
  const min = Math.min(dims.x, dims.y, dims.z);
  const max = Math.max(dims.x, dims.y, dims.z);
  if (min < 3) return 'unit-small';
  if (max > 600) return 'unit-large';
  return null;
}

/** Build plate is fixed at 256 × 256 mm (Bambu X2D). Grid NEVER scales with the model —
 *  only the model mesh is scaled, so a 280% model visibly exceeds the plate. */
export const BUILD_PLATE_MM = 256;
export function gridSizeForPart(_maxDim: number): number {
  return BUILD_PLATE_MM;
}

export const COMPARE_NEXT: Record<CompareMode, CompareMode> = {
  off: 'coin', coin: 'card', card: 'a4', a4: 'off',
};

export const COMPARE_LABEL: Record<CompareMode, string> = {
  off: '⊡', coin: '●', card: '⊟', a4: 'A4',
};
