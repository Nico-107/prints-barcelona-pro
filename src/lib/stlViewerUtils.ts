export type CompareMode = 'off' | 'coin' | 'card' | 'a4';

export function getUnitWarning(dims: { x: number; y: number; z: number }): 'unit-small' | 'unit-large' | null {
  const min = Math.min(dims.x, dims.y, dims.z);
  const max = Math.max(dims.x, dims.y, dims.z);
  if (min < 3) return 'unit-small';
  if (max > 600) return 'unit-large';
  return null;
}

export function gridSizeForPart(maxDim: number): number {
  return Math.max(200, Math.ceil(maxDim / 100) * 100);
}

export const COMPARE_NEXT: Record<CompareMode, CompareMode> = {
  off: 'coin', coin: 'card', card: 'a4', a4: 'off',
};

export const COMPARE_LABEL: Record<CompareMode, string> = {
  off: '⊡', coin: '●', card: '⊟', a4: 'A4',
};
