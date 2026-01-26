import { usePolling } from '@/hooks/usePolling';

type Validate<T> = (data: T) => { isComplete: boolean; isFailed: boolean };

export function useServerActionPolling<T, E>(opts: {
  enabled?: boolean;
  action: () => Promise<{ success: true; data: T } | { success: false; error: E }>;
  validate: Validate<T>;
  onSuccess?: (data: T) => void;
  onFailure?: (error: E) => void;
  shouldRetry?: (error: E) => boolean;
  interval?: number;
  timeout?: number;
  maxAttempts?: number;
  timingStrategy?: 'fixed-delay' | 'fixed-rate';
}) {
  return usePolling<T, E>({
    enabled: opts.enabled,
    interval: opts.interval,
    timeout: opts.timeout,
    maxAttempts: opts.maxAttempts,
    validate: opts.validate,
    onSuccess: opts.onSuccess,
    onFailure: opts.onFailure,
    shouldRetry: opts.shouldRetry,
    timingStrategy: opts.timingStrategy,
    fn: async () => unwrapServerAction(await opts.action()),
  });
}

export const unwrapServerAction = <T, E>(
  res: { success: true; data: T } | { success: false; error: E },
): T => {
  if (!res.success) throw res.error;
  return res.data;
};
