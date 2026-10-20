import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { hashFraction, assignVariant, isHoldout, pickLayerExperiment, VID_KEY } from './assign';
import { REGISTRY } from './registry';

// ─── hashFraction ────────────────────────────────────────────────────────────

describe('hashFraction', () => {
  it('returns a number in [0, 1)', () => {
    for (const s of ['abc', '', 'hello world', 'visitor-123::header_btn_r2']) {
      const f = hashFraction(s);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
    }
  });

  it('is deterministic', () => {
    expect(hashFraction('visitor-abc::header_btn_r2')).toBe(hashFraction('visitor-abc::header_btn_r2'));
    expect(hashFraction('visitor-xyz::modal_actions_r1')).toBe(hashFraction('visitor-xyz::modal_actions_r1'));
  });

  it('produces different values for different inputs', () => {
    expect(hashFraction('a')).not.toBe(hashFraction('b'));
  });
});

// ─── assignVariant ───────────────────────────────────────────────────────────

describe('assignVariant', () => {
  it('always returns one of the provided variants', () => {
    const variants = ['A', 'B', 'C'];
    for (let i = 0; i < 1000; i++) {
      const v = assignVariant(`vid-${i}`, 'test_exp', variants);
      expect(variants).toContain(v);
    }
  });

  it('is deterministic — same visitorId always gets same variant', () => {
    for (let i = 0; i < 100; i++) {
      const vid = `deterministic-${i}`;
      expect(assignVariant(vid, 'exp', ['A', 'B'])).toBe(assignVariant(vid, 'exp', ['A', 'B']));
    }
  });

  it('distributes A/B within ±3% of 50% over 100k fake IDs', () => {
    const counts: Record<string, number> = { A: 0, B: 0 };
    const N = 100_000;
    for (let i = 0; i < N; i++) {
      const v = assignVariant(`visitor-${i}`, 'header_btn_r2', ['A', 'B']);
      counts[v] = (counts[v] ?? 0) + 1;
    }
    expect(counts.A / N).toBeGreaterThan(0.47);
    expect(counts.A / N).toBeLessThan(0.53);
    expect(counts.B / N).toBeGreaterThan(0.47);
    expect(counts.B / N).toBeLessThan(0.53);
  });

  it('distributes A/B/C within ±3% of 33% each over 100k fake IDs', () => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
    const N = 100_000;
    for (let i = 0; i < N; i++) {
      const v = assignVariant(`visitor-${i}`, 'modal_actions_r1', ['A', 'B', 'C']);
      counts[v] = (counts[v] ?? 0) + 1;
    }
    for (const key of ['A', 'B', 'C']) {
      expect(counts[key] / N).toBeGreaterThan(0.30);
      expect(counts[key] / N).toBeLessThan(0.36);
    }
  });
});

// ─── isHoldout ───────────────────────────────────────────────────────────────

describe('isHoldout', () => {
  it('puts ~10% of visitors in holdout', () => {
    let holdoutCount = 0;
    const N = 100_000;
    for (let i = 0; i < N; i++) {
      if (isHoldout(`visitor-${i}`)) holdoutCount++;
    }
    const rate = holdoutCount / N;
    expect(rate).toBeGreaterThan(0.08);
    expect(rate).toBeLessThan(0.12);
  });

  it('is deterministic', () => {
    expect(isHoldout('test-visitor-123')).toBe(isHoldout('test-visitor-123'));
  });
});

// ─── pickLayerExperiment ─────────────────────────────────────────────────────

describe('pickLayerExperiment', () => {
  it('returns null for empty list', () => {
    expect(pickLayerExperiment('vid', 'header', [])).toBeNull();
  });

  it('always returns an id from the list', () => {
    const exps = [{ id: 'exp_a' }, { id: 'exp_b' }, { id: 'exp_c' }];
    for (let i = 0; i < 1000; i++) {
      const picked = pickLayerExperiment(`vid-${i}`, 'home_body', exps);
      expect(exps.map(e => e.id)).toContain(picked);
    }
  });

  it('same visitor picks same experiment in the same layer', () => {
    const exps = [{ id: 'exp_a' }, { id: 'exp_b' }];
    for (let i = 0; i < 50; i++) {
      const vid = `vid-${i}`;
      expect(pickLayerExperiment(vid, 'header', exps)).toBe(pickLayerExperiment(vid, 'header', exps));
    }
  });
});

// ─── Layer exclusivity ───────────────────────────────────────────────────────

describe('Layer exclusivity', () => {
  it('a visitor sees at most one experiment per layer', () => {
    const layerGroups: Record<string, Array<{ id: string }>> = {};
    for (const exp of REGISTRY.filter(e => e.enabled)) {
      if (!layerGroups[exp.layer]) layerGroups[exp.layer] = [];
      layerGroups[exp.layer].push({ id: exp.id });
    }

    for (let i = 0; i < 1000; i++) {
      const vid = `visitor-${i}`;
      for (const [layer, exps] of Object.entries(layerGroups)) {
        if (exps.length <= 1) continue;
        const picked = pickLayerExperiment(vid, layer, exps);
        // Visitor is assigned to exactly one experiment in this layer
        expect(exps.map(e => e.id)).toContain(picked);
        // And the others are NOT assigned (the hash selects exactly one)
        const notPicked = exps.filter(e => e.id !== picked);
        // Verify that a second call with same inputs returns the same experiment
        expect(pickLayerExperiment(vid, layer, exps)).toBe(picked);
        expect(notPicked.length).toBe(exps.length - 1);
      }
    }
  });
});

// ─── Exposure — once per session ─────────────────────────────────────────────

describe('Exposure session tracking', () => {
  const storageKey = 'dim3d-xp-v2-test_exp_exp';

  beforeEach(() => {
    try { sessionStorage.removeItem(storageKey); } catch {}
  });

  afterEach(() => {
    try { sessionStorage.removeItem(storageKey); } catch {}
  });

  it('wasExposureFired returns false before firing', async () => {
    const { wasExposureFired } = await import('./engine');
    expect(wasExposureFired('test_exp')).toBe(false);
  });

  it('markExposureFired then wasExposureFired returns true', async () => {
    const { wasExposureFired, markExposureFired } = await import('./engine');
    markExposureFired('test_exp');
    expect(wasExposureFired('test_exp')).toBe(true);
  });
});
