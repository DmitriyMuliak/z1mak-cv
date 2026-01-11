import { useCallback, useEffect, useRef, useState } from 'react';

export interface PollingOptions<T> {
  fn: () => Promise<T>; // TODO: add AbortSignal support for fetch callback - fn: (ctx: { signal: AbortSignal }) => Promise<T>;
  validate: (data: T) => { isComplete: boolean; isFailed: boolean };
  interval?: number;
  timeout?: number;
  enabled?: boolean;
  maxAttempts?: number;
}

export const usePolling = <T, E = Error>({
  fn,
  validate,
  interval = 2000,
  timeout = 30 * 60 * 1000,
  enabled = true,
  maxAttempts = 3,
}: PollingOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | Error | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const validateRef = useRef(validate);
  validateRef.current = validate;

  const generationRef = useRef(0);

  const activeControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    generationRef.current += 1;

    activeControllerRef.current?.abort();
    activeControllerRef.current = null;

    setData(null);
    setError(null);
    setIsFinished(false);
    setRetryCount(0);
  }, []);

  useEffect(() => {
    if (!enabled || isFinished) return;

    const myGen = generationRef.current;
    const pollingStartTime = Date.now();

    let timerId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      if (generationRef.current !== myGen) return;

      if (Date.now() - pollingStartTime > timeout) {
        setError(new Error('POLLING_TIMEOUT'));
        setIsFinished(true);
        return;
      }

      const requestStartTime = Date.now();

      const controller = new AbortController();
      activeControllerRef.current = controller;

      try {
        const result = await fnRef.current(); // TODO: add support AbortController in fetch callback - fnRef.current({ signal: controller.signal });

        if (cancelled) return;
        if (generationRef.current !== myGen) return;

        setRetryCount(0);
        setError(null);

        const { isComplete, isFailed } = validateRef.current(result);
        setData(result);

        if (isComplete || isFailed) {
          setIsFinished(true);
          return;
        }

        timerId = setTimeout(run, calculateNextDelay(requestStartTime, interval));
      } catch (err) {
        if (cancelled) return;
        if (generationRef.current !== myGen) return;

        if (isAbortError(err)) return;

        setError(err as E | Error);

        setRetryCount((c) => {
          const next = c + 1;

          if (next < maxAttempts) {
            timerId = setTimeout(run, interval);
          } else {
            setIsFinished(true);
          }

          return next;
        });
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
      activeControllerRef.current = null;

      if (timerId) clearTimeout(timerId);
    };
  }, [enabled, interval, timeout, isFinished, maxAttempts]);

  return { data, error, isFinished, reset, retryCount } as const;
};

const calculateNextDelay = (startTime: number, minInterval: number): number => {
  const executionTime = Date.now() - startTime;
  return Math.max(0, minInterval - executionTime);
};

const isAbortError = (err: unknown) => {
  // fetch -> DOMException AbortError
  if (err instanceof DOMException && err.name === 'AbortError') return true;

  // some envs/libraries put name/code
  if (typeof err === 'object' && err && 'name' in err && err.name === 'AbortError') return true;

  return false;
};
