import { useState, useEffect, useRef } from 'react';

interface UseDelayedLoadingProps {
  isSubmitting: boolean;
  delayMs?: number;
}

const DEFAULT_DELAY = 1000;

export function useDelayedSubmitting({
  isSubmitting,
  delayMs = DEFAULT_DELAY,
}: UseDelayedLoadingProps): { delayedIsLoading: boolean } {
  const [delayedIsLoading, setDelayedIsLoading] = useState(isSubmitting);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSubmitting) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setDelayedIsLoading(true);
      return;
    }

    if (delayedIsLoading && !isSubmitting) {
      timerRef.current = setTimeout(() => {
        setDelayedIsLoading(false);
      }, delayMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isSubmitting, delayedIsLoading, delayMs]);

  return { delayedIsLoading };
}
