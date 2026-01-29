export const isAbortError = (err: unknown): boolean => {
  const byName =
    !!err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError';
  const byInstance =
    typeof DOMException !== 'undefined' && err instanceof DOMException && err.name === 'AbortError';
  return byName || byInstance;
};
