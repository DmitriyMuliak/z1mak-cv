import { usePolling } from '@/hooks/usePolling';

type Validate<T> = (data: T) => { isComplete: boolean; isFailed: boolean };

export function useServerActionPolling<T, E>(opts: {
  enabled?: boolean;
  action: () => Promise<{ success: true; data: T } | { success: false; error: E }>;
  validate: Validate<T>;
  interval?: number;
  timeout?: number;
  maxAttempts?: number;
}) {
  return usePolling<T, E>({
    enabled: opts.enabled,
    interval: opts.interval,
    timeout: opts.timeout,
    maxAttempts: opts.maxAttempts,
    validate: opts.validate,
    fn: async () => unwrapServerAction(await opts.action()),
  });
}

export const unwrapServerAction = <T, E>(
  res: { success: true; data: T } | { success: false; error: E },
): T => {
  if (!res.success) throw res.error;
  return res.data;
};
