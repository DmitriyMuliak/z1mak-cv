import { useMemo, useCallback, useEffect, useRef, useState } from 'react';

type FetcherFn<T> = (ctx: { signal: AbortSignal }) => Promise<T>;

export interface PollingOptions<T, E = Error> {
  fn: FetcherFn<T>;
  validate: (data: T) => { isComplete: boolean; isFailed: boolean };
  onSuccess?: (data: T) => void;
  onFailure?: (error: E) => void;
  shouldRetry?: (error: E) => boolean;
  interval?: number;
  timeout?: number;
  enabled?: boolean;
  maxAttempts?: number;
  timingStrategy?: 'fixed-delay' | 'fixed-rate';
}

export const usePolling = <T, E = Error>({
  fn,
  validate,
  onSuccess,
  onFailure,
  shouldRetry,
  interval = 2000,
  timeout = 30 * 60 * 1000,
  enabled = true,
  maxAttempts = 3,
  timingStrategy = 'fixed-delay',
}: PollingOptions<T, E>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const refs = useRef({ fn, validate, onSuccess, onFailure, shouldRetry });
  useEffect(() => {
    refs.current = { fn, validate, onSuccess, onFailure, shouldRetry };
  }, [fn, validate, onSuccess, onFailure, shouldRetry]);

  const generationRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);
  const retriesRef = useRef(0);

  const reset = useCallback(() => {
    generationRef.current += 1;
    activeControllerRef.current?.abort();
    activeControllerRef.current = null;
    setData(null);
    setError(null);
    setIsFinished(false);
    setRetryCount(0);
    retriesRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled || isFinished) return;
    const myGen = generationRef.current;

    const pollingStartTime = Date.now();
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const run = async () => {
      if (cancelled || generationRef.current !== myGen) return;

      // 1. Timeout Check
      if (Date.now() - pollingStartTime > timeout) {
        const timeoutErr = new Error('POLLING_TIMEOUT') as unknown as E;
        setError(timeoutErr);
        setIsFinished(true);
        refs.current.onFailure?.(timeoutErr);
        return;
      }

      const requestStartTime = Date.now();
      const controller = new AbortController();
      activeControllerRef.current = controller;

      try {
        const result = await refs.current.fn({ signal: controller.signal });

        if (cancelled || generationRef.current !== myGen) return;

        // Success reset
        if (retriesRef.current > 0) {
          retriesRef.current = 0;
          setRetryCount(0);
        }
        setError(null);
        setData(result);

        const { isComplete, isFailed } = refs.current.validate(result);

        if (isComplete || isFailed) {
          setIsFinished(true);
          if (isComplete) {
            refs.current.onSuccess?.(result);
          }
          // stop flow (prevent new timer)
          return;
        }

        const delay =
          timingStrategy === 'fixed-delay'
            ? interval
            : calculateFixedRateDelay(requestStartTime, interval);

        timerId = setTimeout(run, delay);
      } catch (err: unknown) {
        if (cancelled || generationRef.current !== myGen) return;
        if (isAbortError(err)) return;

        const capturedError = err as E;
        setError(capturedError);

        const isRetryAllowed = refs.current.shouldRetry
          ? refs.current.shouldRetry(capturedError)
          : true;

        const nextRetry = retriesRef.current + 1;
        retriesRef.current = nextRetry;
        setRetryCount(nextRetry);

        if (!isRetryAllowed || nextRetry >= maxAttempts) {
          setIsFinished(true);
          refs.current.onFailure?.(capturedError);
          return;
        }

        timerId = setTimeout(run, interval);
      } finally {
        if (activeControllerRef.current === controller) {
          activeControllerRef.current = null;
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      activeControllerRef.current?.abort();
      if (timerId) clearTimeout(timerId);
    };
  }, [enabled, interval, timeout, isFinished, maxAttempts, timingStrategy]);

  return useMemo(
    () => ({
      data,
      error,
      isFinished,
      reset,
      retryCount,
    }),
    [data, error, isFinished, reset, retryCount],
  );
};

// --- Helpers ---
const calculateFixedRateDelay = (startTime: number, targetInterval: number): number => {
  const executionTime = Date.now() - startTime;
  return Math.max(200, targetInterval - executionTime);
};

const isAbortError = (err: unknown) => {
  return (
    (err instanceof DOMException && err.name === 'AbortError') ||
    (typeof err === 'object' && err && 'name' in err && err.name === 'AbortError')
  );
};
