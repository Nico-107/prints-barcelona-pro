/**
 * Conv 4.3 — first-touch attribution.
 * Stored once per visitor on their first landing. Pins:
 *   - utm_source (from URL)
 *   - referring_domain (from document.referrer)
 *   - landing_page (the first URL path we saw)
 *   - ai_source — derived from utm or referrer:
 *       chatgpt, perplexity, gemini, copilot, claude
 *     when the match is unambiguous. Falls through to null otherwise.
 *
 * Returned as a set of properties so every event can attach them.
 */

const LS_KEY = "dim3d-first-touch";

export type AiSource = "chatgpt" | "perplexity" | "gemini" | "copilot" | "claude" | null;

export interface FirstTouch {
  utm_source: string | null;
  referring_domain: string | null;
  landing_page: string;
  ai_source: AiSource;
  recorded_at: number;
}

export function detectAiSource(utmSource: string | null, referrer: string): AiSource {
  const needle = `${(utmSource ?? "").toLowerCase()} ${referrer.toLowerCase()}`;
  if (/chatgpt|openai/.test(needle)) return "chatgpt";
  if (/perplexity/.test(needle)) return "perplexity";
  if (/gemini|bard/.test(needle)) return "gemini";
  if (/copilot/.test(needle)) return "copilot";
  if (/claude|anthropic/.test(needle)) return "claude";
  return null;
}

/**
 * Called once per page load. No-op if we already have a first touch
 * recorded for this visitor.
 */
export function captureFirstTouch(): FirstTouch | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = localStorage.getItem(LS_KEY);
    if (existing) return JSON.parse(existing) as FirstTouch;
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const referrer = document.referrer ?? "";
    let referringDomain: string | null = null;
    try {
      if (referrer) referringDomain = new URL(referrer).hostname;
    } catch { /* referrer not a URL */ }
    const touch: FirstTouch = {
      utm_source: utmSource,
      referring_domain: referringDomain,
      landing_page: window.location.pathname + window.location.search,
      ai_source: detectAiSource(utmSource, referrer),
      recorded_at: Date.now(),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(touch));
    return touch;
  } catch {
    return null;
  }
}

export function getFirstTouch(): FirstTouch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FirstTouch;
  } catch {
    return null;
  }
}

/** Convenience: first-touch attributes flattened as `ft_*` for event properties. */
export function getFirstTouchProps(): Record<string, unknown> {
  const t = getFirstTouch();
  if (!t) return {};
  return {
    ft_utm_source: t.utm_source,
    ft_referring_domain: t.referring_domain,
    ft_landing_page: t.landing_page,
    ft_ai_source: t.ai_source,
    ft_recorded_at: t.recorded_at,
  };
}
