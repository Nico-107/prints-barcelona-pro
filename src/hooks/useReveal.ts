import { useEffect, useRef } from "react";

/**
 * SSR-safe scroll-reveal hook. Progressive enhancement only:
 * - Prerendered HTML is always fully visible (no class added server-side).
 * - After hydration, elements below the fold are hidden via JS and revealed
 *   with a smooth fade+slide when they enter the viewport.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  options: { threshold?: number; rootMargin?: string } = {}
) {
  const ref = useRef<T>(null);
  const { threshold = 0.08, rootMargin = "0px 0px -40px 0px" } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Only hide elements that are genuinely below the fold at mount time.
    const { top } = el.getBoundingClientRect();
    const alreadyInView = top < window.innerHeight - 40;
    if (!alreadyInView) {
      el.classList.add("sr-hidden");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.remove("sr-hidden");
            target.classList.add("sr-revealed");
            // Remove sr-revealed after transition so normal CSS (e.g. card hovers) takes over.
            const onEnd = () => target.classList.remove("sr-revealed");
            target.addEventListener("transitionend", onEnd, { once: true });
            observer.unobserve(target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
