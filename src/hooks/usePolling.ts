import { useEffect, useRef, useState, useCallback } from 'react';
interface PollingOptions<T> {
  fn: () => Promise<T>;
  validate: (data: T) => { isComplete: boolean; isFailed: boolean };
  interval?: number;
  timeout?: number;
  enabled?: boolean;
  maxErrorRetries?: number;
}

export const usePolling = <T>({
  fn,
  validate,
  interval = 2000,
  timeout = 1800000,
  enabled = true,
  maxErrorRetries = 3,
}: PollingOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const errorCountRef = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsFinished(false);
    errorCountRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled || isFinished) return;

    let isCancelled = false;
    let timerId: NodeJS.Timeout;
    const pollingStartTime = Date.now();

    const run = async () => {
      if (Date.now() - pollingStartTime > timeout) {
        setError(new Error('Polling timeout'));
        setIsFinished(true);
        return;
      }

      const requestStartTime = Date.now();

      try {
        const result = await fnRef.current();
        if (isCancelled) return;

        errorCountRef.current = 0;

        const { isComplete, isFailed } = validate(result);
        setData(result);

        if (isFailed || isComplete) {
          if (isFailed) setError(new Error('Task processing failed'));
          setIsFinished(true);
          return;
        }

        timerId = setTimeout(run, calculateNextDelay(requestStartTime, interval));
      } catch (err) {
        if (isCancelled) return;

        errorCountRef.current += 1;
        const currentError = err instanceof Error ? err : new Error('Network error');
        setError(currentError);

        if (shouldRetry(errorCountRef.current, maxErrorRetries)) {
          console.warn(
            `Polling retry ${errorCountRef.current}/${maxErrorRetries} after error:`,
            currentError.message,
          );
          timerId = setTimeout(run, interval);
        } else {
          console.error('Max polling retries reached. Stopping.');
          setIsFinished(true);
        }
      }
    };

    run();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [enabled, interval, timeout, isFinished, validate, maxErrorRetries]);

  return { data, error, isFinished, reset, retryCount: errorCountRef.current };
};

export const shouldRetry = (retryCount: number, maxRetries: number): boolean => {
  return retryCount < maxRetries;
};

export const calculateNextDelay = (startTime: number, minInterval: number): number => {
  const executionTime = Date.now() - startTime;
  return Math.max(0, minInterval - executionTime);
};
