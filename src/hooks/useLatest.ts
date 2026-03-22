'use client';

import { useRef, useLayoutEffect, useEffect } from 'react';

/**
 * Returns a ref that always holds the latest value of the given argument.
 *
 * Eliminates the repetitive:
 *   const ref = useRef(value);
 *   useEffect(() => { ref.current = value }, [value]);
 *
 * Uses `useLayoutEffect` on the client (fires synchronously after DOM mutations,
 * before paint) so the ref is guaranteed to be current before any downstream
 * `useEffect` callbacks that read it fire in the same commit. Falls back to
 * `useEffect` on the server to avoid SSR warnings.
 *
 * @example
 * const onChangeRef = useLatest(onChange);
 * // Inside a useEffect: onChangeRef.current?.('value')
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
