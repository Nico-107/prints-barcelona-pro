import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildPrePaintScript, type PrePaintExp } from './prePaintScript';
import { hashFraction, isHoldout, assignVariant, pickLayerExperiment } from './assign';
import { REGISTRY } from './registry';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Convert REGISTRY to PrePaintExp[] with the same endMs computation used by vite.config.ts. */
function toPrePaintExps(overrideNow?: number): PrePaintExp[] {
  return REGISTRY.map(exp => ({
    id: exp.id,
    attr: 'data-xp-' + exp.id.replace(/_/g, '-'),
    layer: exp.layer,
    variants: exp.variants,
    langs: exp.langs ?? null,
    enabled: exp.enabled,
    endMs: new Date(exp.startedOn + 'T00:00:00Z').getTime() + exp.maxDays * 86400_000,
  }));
}

/**
 * Run the pre-paint script for a given visitor id.
 * Returns the data-xp-* attributes set on document.documentElement.
 */
function runScript(
  script: string,
  vid: string,
  opts: { search?: string; pathname?: string } = {}
): Record<string, string> {
  // Clear old xp attributes
  const toRemove = Array.from(document.documentElement.attributes)
    .map(a => a.name)
    .filter(n => n.startsWith('data-xp-'));
  toRemove.forEach(n => document.documentElement.removeAttribute(n));

  // Set visitor id
  localStorage.setItem('dim3d-vid', vid);

  // Patch location (jsdom allows this)
  const origLocation = window.location;
  Object.defineProperty(window, 'location', {
    value: { pathname: opts.pathname ?? '/', search: opts.search ?? '', href: 'http://localhost/' },
    configurable: true,
    writable: true,
  });

  try {
    // eslint-disable-next-line no-eval
    eval(script);
  } finally {
    Object.defineProperty(window, 'location', {
      value: origLocation,
      configurable: true,
      writable: true,
    });
  }

  const result: Record<string, string> = {};
  for (const attr of document.documentElement.attributes) {
    if (attr.name.startsWith('data-xp-')) result[attr.name] = attr.value;
  }
  return result;
}

/**
 * Expected attributes from TypeScript assign.ts for a given visitor id and
 * experiment set (mirrors the script logic exactly).
 */
function expected(
  vid: string,
  experiments: PrePaintExp[],
  lang = 'es',
  now = Date.now()
): Record<string, string> {
  if (isHoldout(vid)) return { 'data-xp-holdout': 'true' };

  const eligible = experiments.filter(
    e => e.enabled && now < e.endMs && (!e.langs || e.langs.includes(lang))
  );

  const byLayer: Record<string, PrePaintExp[]> = {};
  for (const exp of eligible) {
    (byLayer[exp.layer] ??= []).push(exp);
  }

  const result: Record<string, string> = {};
  for (const [layer, exps] of Object.entries(byLayer)) {
    const pickedId = pickLayerExperiment(vid, layer, exps);
    if (!pickedId) continue;
    const exp = exps.find(e => e.id === pickedId)!;
    result[exp.attr] = assignVariant(vid, exp.id, exp.variants);
  }
  return result;
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('buildPrePaintScript', () => {
  const experiments = toPrePaintExps();
  const script = buildPrePaintScript(experiments);

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up any data-xp-* attributes left on htmlElement
    const toRemove = Array.from(document.documentElement.attributes)
      .map(a => a.name)
      .filter(n => n.startsWith('data-xp-'));
    toRemove.forEach(n => document.documentElement.removeAttribute(n));
  });

  it('produces the same variant as assign.ts for 2,000 visitor ids', () => {
    const now = Date.now();
    let mismatches = 0;
    for (let i = 0; i < 2000; i++) {
      const vid = `visitor-${i}`;
      const actual = runScript(script, vid);
      const exp = expected(vid, experiments, 'es', now);
      // Compare every key in expected — actual may also have data-xp-forced etc.
      for (const [key, val] of Object.entries(exp)) {
        if (actual[key] !== val) mismatches++;
      }
    }
    expect(mismatches).toBe(0);
  });

  it('holdout ids get no data-xp-<experiment-id> attribute', () => {
    // Collect ten holdout ids quickly
    const holdoutIds: string[] = [];
    for (let i = 0; holdoutIds.length < 10 && i < 20_000; i++) {
      if (isHoldout(`h-${i}`)) holdoutIds.push(`h-${i}`);
    }
    expect(holdoutIds.length).toBeGreaterThan(0);

    for (const vid of holdoutIds) {
      const attrs = runScript(script, vid);
      // Only data-xp-holdout should be set; no per-experiment attribute
      for (const exp of experiments) {
        expect(attrs[exp.attr]).toBeUndefined();
      }
      expect(attrs['data-xp-holdout']).toBe('true');
    }
  });

  it('expired experiment gets no attribute', () => {
    const expiredExp: PrePaintExp = {
      id: 'test_expired',
      attr: 'data-xp-test-expired',
      layer: 'global_style',
      variants: ['A', 'B'],
      langs: null,
      enabled: true,
      endMs: Date.now() - 1000, // already ended
    };
    const expsWithExpired = [...experiments, expiredExp];
    const scriptWithExpired = buildPrePaintScript(expsWithExpired);

    // Find a non-holdout visitor
    let vid = '';
    for (let i = 0; i < 1000; i++) {
      if (!isHoldout(`noholdout-${i}`)) { vid = `noholdout-${i}`; break; }
    }
    expect(vid).not.toBe('');

    const attrs = runScript(scriptWithExpired, vid);
    expect(attrs['data-xp-test-expired']).toBeUndefined();
  });

  it('holdout rate is between 8% and 12% over 2,000 ids', () => {
    let holdoutCount = 0;
    for (let i = 0; i < 2000; i++) {
      if (isHoldout(`rate-${i}`)) holdoutCount++;
    }
    const rate = holdoutCount / 2000;
    expect(rate).toBeGreaterThan(0.08);
    expect(rate).toBeLessThan(0.12);
  });
});
