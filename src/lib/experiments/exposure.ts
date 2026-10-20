import { useEffect, useRef, useCallback } from 'react';
import { capture } from '@/lib/analytics';
import {
  wasExposureFired, markExposureFired,
  isExperimentActive, isInHoldout, getVariant, isForcedVariant,
} from './engine';
import { REGISTRY } from './registry';

export type ExposureExtraProps = { placement?: 'desktop' | 'mobile' };

function getSiteLanguage(): string {
  try { return localStorage.getItem('preferred-language') ?? 'es'; } catch { return 'es'; }
}

/**
 * Fires `experiment_exposure` once per session with all required properties.
 * Guards: experiment must be active, visitor not in holdout, language must match.
 * Idempotent — subsequent calls within the same session are no-ops.
 */
export function fireXpExposure(experimentId: string, extra?: ExposureExtraProps): void {
  if (wasExposureFired(experimentId)) return;
  const exp = REGISTRY.find(e => e.id === experimentId);
  if (!exp || !isExperimentActive(experimentId)) return;
  if (isInHoldout()) return;
  const lang = getSiteLanguage();
  if (exp.langs && !exp.langs.includes(lang)) return;
  markExposureFired(experimentId);
  capture('experiment_exposure', {
    experiment: experimentId,
    variant: getVariant(experimentId),
    layer: exp.layer,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    lang,
    forced: isForcedVariant(experimentId),
    ...extra,
  });
}

/**
 * Fires `experiment_exposure` exactly once per session when the referenced element
 * has been ≥50% visible for ≥1 second (IntersectionObserver).
 *
 * The optional `onExpose` callback returns extra properties (e.g. `{ placement: 'desktop' }`)
 * that are merged into the event — the hook handles the `capture` call itself.
 */
export function useXpExposure(
  ref: React.RefObject<Element | null>,
  experimentId: string,
  onExpose?: () => ExposureExtraProps | void,
): void {
  const firedRef = useRef(false);
  const stableExpose = useCallback(onExpose ?? (() => {}), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (firedRef.current || wasExposureFired(experimentId)) {
      firedRef.current = true;
      return;
    }
    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.5) {
            if (!timer) {
              timer = setTimeout(() => {
                if (!firedRef.current && !wasExposureFired(experimentId)) {
                  firedRef.current = true;
                  const extra = stableExpose() as ExposureExtraProps | undefined;
                  fireXpExposure(experimentId, extra);
                }
              }, 1000);
            }
          } else {
            if (timer) { clearTimeout(timer); timer = null; }
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref, experimentId, stableExpose]);
}
