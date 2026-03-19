import { useEffect, useRef, useState } from 'react';

/**
 * One-shot IntersectionObserver hook.
 * Returns [ref, hasIntersected] — once the element enters the viewport
 * (threshold: 0.3 by default), `hasIntersected` becomes true permanently.
 *
 * Respects prefers-reduced-motion: returns true immediately so animations
 * are skipped and content renders instantly.
 */
export function useIntersectionTrigger<T extends Element | null>(
  options?: IntersectionObserverInit,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    // Trigger immediately for users who prefer reduced motion.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setHasIntersected(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect(); // one-shot — stop observing after first trigger
        }
      },
      { threshold: 0.3, ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, hasIntersected];
}
