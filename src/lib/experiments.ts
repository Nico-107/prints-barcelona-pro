/**
 * Client-side A/B experiment assignment engine.
 *
 * Assignment uses crypto.getRandomValues for uniform distribution across
 * all versions. Stored consent-aware:
 *   - before consent  → sessionStorage only
 *   - after consent   → localStorage (30-day persistence)
 *
 * Call migrateExperimentAssignment() when consent is granted.
 * QA override: ?xp_hero=1..4 etc. (persists for session, marks xp_forced:true)
 *
 * The anti-flicker script in index.html (generated from config at build time)
 * replicates this logic and sets document.documentElement.dataset[attr]
 * before React mounts. The React app reads from the dataset — it never
 * re-rolls an assignment already made by the head script.
 */

import { EXPERIMENTS, type ExperimentId } from "./experimentsConfig";

const STORAGE_PREFIX = "dim3d-xp-";
const FORCED_SUFFIX = "_forced";
const EXPOSURE_SUFFIX = "_exp";

export function isExperimentActive(id: ExperimentId): boolean {
  const exp = EXPERIMENTS[id];
  return exp.enabled && new Date() < new Date(exp.endsOn + "T00:00:00Z");
}

function assignVersion(versions: number): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return (arr[0] % versions) + 1;
  } catch {
    return Math.floor(Math.random() * versions) + 1;
  }
}

/**
 * Returns the assigned version for an experiment.
 * Reads from document.documentElement.dataset[attr] first (set by head script);
 * falls back to storage, then assigns if needed.
 */
export function getAssignment(id: ExperimentId): number {
  if (typeof window === "undefined") return 1;
  const exp = EXPERIMENTS[id];

  // Head script is the source of truth
  const raw = document.documentElement.dataset[exp.attr];
  if (raw) {
    const v = parseInt(raw, 10);
    if (v >= 1 && v <= exp.versions) return v;
  }

  if (!isExperimentActive(id)) return 1;

  const key = STORAGE_PREFIX + id;
  const forcedKey = key + FORCED_SUFFIX;

  // QA override
  try {
    const params = new URLSearchParams(location.search);
    const qa = params.get(exp.qa);
    const qv = qa ? parseInt(qa, 10) : 0;
    if (qv >= 1 && qv <= exp.versions) {
      try { sessionStorage.setItem(forcedKey, String(qv)); } catch { /* ignore */ }
      return qv;
    }
    const sf = sessionStorage.getItem(forcedKey);
    const sfv = sf ? parseInt(sf, 10) : 0;
    if (sfv >= 1 && sfv <= exp.versions) return sfv;
  } catch { /* storage unavailable */ }

  // Consent-aware persistent storage
  try {
    const consented = localStorage.getItem("cookie-consent") === "accepted";
    const store = consented ? localStorage : sessionStorage;
    const stored = store.getItem(key);
    const sv = stored ? parseInt(stored, 10) : 0;
    if (sv >= 1 && sv <= exp.versions) return sv;
    const version = assignVersion(exp.versions);
    try { store.setItem(key, String(version)); } catch { /* ignore */ }
    return version;
  } catch {
    return assignVersion(exp.versions);
  }
}

export function isForcedForExperiment(id: ExperimentId): boolean {
  if (typeof window === "undefined") return false;
  const exp = EXPERIMENTS[id];
  try {
    const params = new URLSearchParams(location.search);
    const qa = params.get(exp.qa);
    if (qa) {
      const qv = parseInt(qa, 10);
      if (qv >= 1 && qv <= exp.versions) return true;
    }
    const sf = sessionStorage.getItem(STORAGE_PREFIX + id + FORCED_SUFFIX);
    if (sf) {
      const sfv = parseInt(sf, 10);
      if (sfv >= 1 && sfv <= exp.versions) return true;
    }
  } catch { /* ignore */ }
  return false;
}

export function isAnyForced(): boolean {
  if (typeof window === "undefined") return false;
  return (Object.keys(EXPERIMENTS) as ExperimentId[]).some(isForcedForExperiment);
}

export function wasExposureFired(id: ExperimentId): boolean {
  try { return !!sessionStorage.getItem(STORAGE_PREFIX + id + EXPOSURE_SUFFIX); } catch { return false; }
}

export function markExposureFired(id: ExperimentId): void {
  try { sessionStorage.setItem(STORAGE_PREFIX + id + EXPOSURE_SUFFIX, "1"); } catch { /* ignore */ }
}

/** Move all session assignments to localStorage after the user accepts cookies. */
export function migrateExperimentAssignment(): void {
  try {
    (Object.keys(EXPERIMENTS) as ExperimentId[]).forEach((id) => {
      const key = STORAGE_PREFIX + id;
      const session = sessionStorage.getItem(key);
      if (session) {
        const sv = parseInt(session, 10);
        if (sv >= 1 && sv <= EXPERIMENTS[id].versions) {
          localStorage.setItem(key, session);
        }
      }
    });
  } catch { /* ignore */ }
}
