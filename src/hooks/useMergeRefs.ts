import { useMemo } from 'react';

export function useMergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return useMemo(() => {
    if (refs.every((ref) => ref == null)) {
      return null;
    }
    return (node: T) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref != null) {
          (ref as React.RefObject<T | null>).current = node;
        }
      });
    };
  }, [refs]);
}
