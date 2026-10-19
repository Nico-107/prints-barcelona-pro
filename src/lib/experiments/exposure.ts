import { useEffect, useRef, useCallback } from 'react';
import { wasExposureFired, markExposureFired } from './engine';

/**
 * Fires `onExpose` exactly once per session when the referenced element has
 * been ≥50% visible for ≥1 second (IntersectionObserver).
 */
export function useXpExposure(
  ref: React.RefObject<Element | null>,
  experimentId: string,
  onExpose: () => void,
): void {
  const firedRef = useRef(false);
  const stableExpose = useCallback(onExpose, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
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
                  markExposureFired(experimentId);
                  stableExpose();
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
