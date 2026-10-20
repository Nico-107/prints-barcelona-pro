/**
 * Client-side experiment engine v2.
 *
 * Assignment algorithm:
 *   1. 10% holdout — no experiments at all (`data-xp-holdout="true"` on <html>).
 *   2. Per layer: deterministic hash(visitorId + "::layer::" + layerId) picks which
 *      experiment in that layer the visitor sees (at most one per layer).
 *   3. Within the experiment: hash(visitorId + "::" + experimentId) picks the variant.
 *
 * The pre-paint inline script in index.html replicates this logic before React
 * mounts, setting `data-xp-<id>="<variant>"` on <html>. CSS selectors then
 * show only the active variant div, preventing flash and hiding non-active
 * variants from screen readers (display:none removes from accessibility tree).
 *
 * QA override: ?xp=<id>:<variant> forces a variant for the session.
 */

import { REGISTRY, expAttr, type ExperimentDef } from './registry';
import {
  hashFraction,
  getOrCreateVisitorId,
  isHoldout,
  assignVariant,
  pickLayerExperiment,
} from './assign';

const STORAGE_PREFIX = 'dim3d-xp-v2-';
const EXPOSURE_SUFFIX = '_exp';

// ─── QA override ────────────────────────────────────────────────────────────

function getQAForced(id: string): string | null {
  try {
    const xpParam = new URLSearchParams(location.search).get('xp');
    if (xpParam) {
      const sep = xpParam.indexOf(':');
      if (sep !== -1) {
        const expId = xpParam.slice(0, sep);
        const variant = xpParam.slice(sep + 1);
        if (expId === id && variant) return variant;
      }
    }
  } catch { /* ignore */ }
  return null;
}

export function isForcedVariant(id: string): boolean {
  return !!getQAForced(id);
}

export function isAnyForced(): boolean {
  return REGISTRY.some(e => !!getQAForced(e.id));
}

// ─── Holdout ────────────────────────────────────────────────────────────────

export function isInHoldout(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.getAttribute('data-xp-holdout') === 'true';
}

// ─── Active check ────────────────────────────────────────────────────────────

export function isExperimentActive(id: string): boolean {
  const exp = REGISTRY.find(e => e.id === id);
  if (!exp || !exp.enabled) return false;
  const start = new Date(exp.startedOn + 'T00:00:00Z');
  const end = new Date(start.getTime() + exp.maxDays * 86400_000);
  const now = new Date();
  return now >= start && now < end;
}

// ─── Variant assignment ──────────────────────────────────────────────────────

/**
 * Returns the variant for an experiment.
 * Priority: QA override > HTML attribute (set by pre-paint script) > deterministic fallback.
 */
export function getVariant(id: string): string {
  if (typeof window === 'undefined') return 'A';

  const forced = getQAForced(id);
  if (forced) return forced;

  const htmlVal = document.documentElement.getAttribute(expAttr(id));
  if (htmlVal) return htmlVal;

  // Fallback for first load (pre-paint script not yet run or storage cleared).
  const vid = getOrCreateVisitorId();
  if (isHoldout(vid)) return 'A';

  const exp = REGISTRY.find(e => e.id === id);
  if (!exp) return 'A';

  // Check layer eligibility
  const layerExps = REGISTRY.filter(
    e => e.enabled && e.layer === exp.layer && isExperimentActive(e.id),
  );
  const picked = pickLayerExperiment(vid, exp.layer, layerExps);
  if (picked !== id) return 'A';

  return assignVariant(vid, id, exp.variants);
}

// ─── Super-properties ────────────────────────────────────────────────────────

export function getExperimentSuperProps(language: string): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  const props: Record<string, unknown> = {};

  if (isInHoldout()) {
    props.xp_holdout = true;
    return props;
  }

  if (isAnyForced()) props.xp_forced = true;

  for (const exp of REGISTRY) {
    if (!exp.enabled) continue;

    const langOk = !exp.langs || exp.langs.includes(language);
    if (!langOk) {
      props[`xp_${exp.id}`] = 'n/a';
      continue;
    }

    const active = isExperimentActive(exp.id);
    if (!active) continue;

    const variant = document.documentElement.getAttribute(expAttr(exp.id));
    props[`xp_${exp.id}`] = variant ?? 'A';
  }

  return props;
}

// ─── Exposure tracking ───────────────────────────────────────────────────────

export function wasExposureFired(id: string): boolean {
  try { return !!sessionStorage.getItem(STORAGE_PREFIX + id + EXPOSURE_SUFFIX); } catch { return false; }
}

export function markExposureFired(id: string): void {
  try { sessionStorage.setItem(STORAGE_PREFIX + id + EXPOSURE_SUFFIX, '1'); } catch { /* ignore */ }
}

// ─── Consent migration ───────────────────────────────────────────────────────
// The visitor ID lives in localStorage so it survives consent changes.
// Nothing else to migrate in v2 — the pre-paint script re-runs on each load.

export function migrateOnConsent(): void {
  getOrCreateVisitorId(); // ensure it's created if missing
}

// ─── Legacy compat shims (used by old consumers via src/lib/experiments.ts) ─

/** @deprecated use getVariant() */
export function getVersionAsNumber(id: string): number {
  const v = getVariant(id);
  const exp = REGISTRY.find(e => e.id === id);
  if (!exp) return 1;
  const idx = exp.variants.indexOf(v as ExperimentDef['variants'][number]);
  return idx >= 0 ? idx + 1 : 1;
}
