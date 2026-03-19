'use client';

import { useRef, useLayoutEffect } from 'react';

/**
 * Returns a ref that always holds the latest value of the given argument.
 *
 * Eliminates the repetitive:
 *   const ref = useRef(value);
 *   useEffect(() => { ref.current = value }, [value]);
 *
 * Uses `useLayoutEffect` (fires synchronously after DOM mutations, before
 * paint) so the ref is guaranteed to be current before any downstream
 * `useEffect` callbacks that read it fire in the same commit.
 *
 * @example
 * const onChangeRef = useLatest(onChange);
 * // Inside a useEffect: onChangeRef.current?.('value')
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);

  useLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
