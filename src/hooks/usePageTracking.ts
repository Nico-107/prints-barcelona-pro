/**
 * Scroll depth and section view tracking.
 * Import and call usePageTracking() once per page layout (e.g. in App.tsx).
 * Fire section_view via useSectionView() on any component that maps to a section.
 */

import { useEffect, useRef, useCallback } from 'react';
import { capture } from '@/lib/analytics';

// ─── Scroll depth ─────────────────────────────────────────────────────────────

const THRESHOLDS = [25, 50, 75, 100] as const;

export function useScrollDepth(): void {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    fired.current.clear();

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;

      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.current.has(t)) {
          fired.current.add(t);
          capture('scroll_depth', { depth: t });
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

// ─── Section view ─────────────────────────────────────────────────────────────

/**
 * Fires `section_view` once per page view when the element is ≥50% visible.
 * Pass a stable sectionId (e.g. "hero", "reviews", "faq").
 */
export function useSectionView(
  ref: React.RefObject<Element | null>,
  sectionId: string,
): void {
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
  }, [sectionId]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.5 && !fired.current) {
            fired.current = true;
            capture('section_view', { section: sectionId });
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, sectionId]);
}

// ─── CTA click helper ─────────────────────────────────────────────────────────

export function captureCtaClick(ctaId: string, section: string, textVariant?: string): void {
  capture('cta_click', { cta_id: ctaId, section, text_variant: textVariant });
}

// ─── usePageTracking — call once per layout ───────────────────────────────────

export function usePageTracking(): void {
  useScrollDepth();
}
