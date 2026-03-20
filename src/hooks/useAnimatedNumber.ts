import { useEffect, useRef, useState } from 'react';

/**
 * Spring-physics easing: fast acceleration, slight overshoot, settle.
 * f(0) = 0, f(1) ≈ 1, oscillates near the end.
 */
export function springEase(t: number): number {
  return Math.min(1, 1 - Math.exp(-6 * t) * Math.cos(10 * t));
}

export function springEaseWithOvershoot(t: number): number {
  return 1 - Math.exp(-6 * t) * Math.cos(10 * t);
}

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Animates a number from 0 to `target` using spring-physics easing.
 * Mirrors the requestAnimationFrame + performance.now() pattern.
 * Respects prefers-reduced-motion: returns the target immediately.
 */
export function useAnimatedNumber(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    const startTime = performance.now();
    setValue(0);

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutQuart(progress);
      const current = Math.round(Math.max(0, Math.min(target, eased * target)));

      setValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(update);
      } else {
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  return value;
}
