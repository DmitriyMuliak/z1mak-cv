/**
 * Calculates exponential backoff delay with jitter.
 *
 * @param attempt - Zero-based attempt number
 * @param baseDelayMs - Base delay in milliseconds
 * @returns Delay in milliseconds, capped at 2 minutes
 */
export function calculateBackoffDelay(attempt: number, baseDelayMs: number): number {
  const maxDelay = 120_000; // 2 minutes
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  // Skip jitter on the first attempt to reconnect immediately
  const jitter = attempt > 0 ? Math.random() * (baseDelayMs * 0.2) : 0;
  return Math.min(exponentialDelay + jitter, maxDelay);
}
