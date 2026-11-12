import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props { children: ReactNode; className?: string; delay?: number; }

export function SectionReveal({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.remove('sr-hidden');
        el.classList.add('sr-revealed');
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    el.classList.add('sr-hidden');
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn(className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
