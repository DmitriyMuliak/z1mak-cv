import { devLogger } from '@/lib/devLogger';

export const getNextPathFromStateParam = (stateRaw: string | null) => {
  let redirectedFrom: string | null = null;

  if (stateRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(stateRaw));
      redirectedFrom = parsed.redirectedFrom || null;
    } catch (err) {
      devLogger.warn('Failed to parse state (getNextPathFromStateParam) :', err);
    }
  }

  let next = redirectedFrom ?? '/';

  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/';
  }

  return next;
};
