import { useEffect, useRef, type DependencyList, type EffectCallback } from 'react';

export function useUpdateEffect(effect: EffectCallback, deps: DependencyList) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    return effect();
  }, deps);
}
