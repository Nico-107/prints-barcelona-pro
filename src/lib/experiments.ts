/**
 * Client-side A/B experiment assignment.
 *
 * Assignment is random 50/50 on first need and stored consent-aware:
 *   - before consent  → sessionStorage only
 *   - after consent   → localStorage (30-day persistence)
 *
 * Call migrateExperimentAssignment() when consent is granted.
 * QA override: ?xp_hero=control|photo_first  (persists for the session,
 * marks xp_forced:true on all events).
 *
 * The anti-flicker inline script in index.html replicates the assignment
 * logic and sets document.documentElement.dataset.xpHeroCtaR1 before paint.
 */

export type HeroCTAVariant = "control" | "photo_first";

const KEY = "dim3d-xp-hero_cta_r1";
const FORCED_KEY = KEY + "_forced";
const EXPOSURE_KEY = "dim3d-xp-exp-hero_cta_r1";

// Kill switch — set to false to put everyone in control.
const ENABLED = true;

let _cached: HeroCTAVariant | null = null;
let _forced = false;

export function getHeroCTAVariant(): HeroCTAVariant {
  if (!ENABLED) return "control";
  if (typeof window === "undefined") return "control"; // SSR
  if (_cached !== null) return _cached;

  // QA override via URL param or existing session override
  try {
    const params = new URLSearchParams(location.search);
    const qa = params.get("xp_hero");
    if (qa === "control" || qa === "photo_first") {
      try { sessionStorage.setItem(FORCED_KEY, qa); } catch { /* ignore */ }
      _forced = true;
      _cached = qa;
      return qa;
    }
    const sf = sessionStorage.getItem(FORCED_KEY) as HeroCTAVariant | null;
    if (sf === "control" || sf === "photo_first") {
      _forced = true;
      _cached = sf;
      return sf;
    }
  } catch { /* storage unavailable */ }

  // Consent-aware persistent assignment
  try {
    const consented = localStorage.getItem("cookie-consent") === "accepted";
    const store = consented ? localStorage : sessionStorage;
    const stored = store.getItem(KEY) as HeroCTAVariant | null;
    if (stored === "control" || stored === "photo_first") {
      _cached = stored;
      return stored;
    }
    const variant: HeroCTAVariant = Math.random() < 0.5 ? "control" : "photo_first";
    store.setItem(KEY, variant);
    _cached = variant;
    return variant;
  } catch {
    // Storage unavailable — assign per page load (not persisted)
    const variant: HeroCTAVariant = Math.random() < 0.5 ? "control" : "photo_first";
    _cached = variant;
    return variant;
  }
}

export function isXpForced(): boolean {
  return _forced;
}

/** Move session assignment to localStorage after the user accepts cookies. */
export function migrateExperimentAssignment(): void {
  try {
    const session = sessionStorage.getItem(KEY);
    if (session === "control" || session === "photo_first") {
      localStorage.setItem(KEY, session);
    }
  } catch { /* ignore */ }
}

/** Returns true if the exposure event has already been fired this session. */
export function wasExposureFired(): boolean {
  try { return !!sessionStorage.getItem(EXPOSURE_KEY); } catch { return false; }
}

/** Mark the exposure as fired for this session. */
export function markExposureFired(): void {
  try { sessionStorage.setItem(EXPOSURE_KEY, "1"); } catch { /* ignore */ }
}
