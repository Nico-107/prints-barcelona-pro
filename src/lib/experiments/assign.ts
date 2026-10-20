const HOLDOUT_FRACTION = 0.1;
export const VID_KEY = 'dim3d-vid';

/** FNV-1a 32-bit hash, returns a number in [0, 1). */
export function hashFraction(str: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash / 4294967295;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let vid = localStorage.getItem(VID_KEY);
    if (!vid) {
      vid = (Math.random().toString(36) + Date.now().toString(36) + Math.random().toString(36)).slice(2, 20);
      localStorage.setItem(VID_KEY, vid);
    }
    return vid;
  } catch {
    return 'bot';
  }
}

export function isHoldout(visitorId: string): boolean {
  return hashFraction(visitorId + '::holdout') < HOLDOUT_FRACTION;
}

/** Picks one variant from the list deterministically. Equal weights assumed. */
export function assignVariant(visitorId: string, experimentId: string, variants: string[]): string {
  if (variants.length === 0) return 'A';
  const f = hashFraction(visitorId + '::' + experimentId);
  return variants[Math.floor(f * variants.length)];
}

/**
 * Among the eligible experiments for a layer, deterministically picks one.
 * Returns null if the list is empty.
 */
export function pickLayerExperiment(
  visitorId: string,
  layer: string,
  experiments: Array<{ id: string }>,
): string | null {
  if (experiments.length === 0) return null;
  const f = hashFraction(visitorId + '::layer::' + layer);
  return experiments[Math.floor(f * experiments.length)].id;
}
