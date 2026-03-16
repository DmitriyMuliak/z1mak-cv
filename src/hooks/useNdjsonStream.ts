'use client';

import { useState, useCallback, useRef } from 'react';
import { isAbortError } from '@/api/apiService/utils';
import { apiService } from '@/api/client';
import type { RelativePath } from '@/api/apiService/types';

interface UseNdjsonStreamOptions<T> {
  onMessage: (message: T) => void;
  onError?: (error: Error) => void;
  onDone?: () => void;
}

export const useNdjsonStream = <T, P = unknown>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (url: RelativePath, payload: P, options: UseNdjsonStreamOptions<T>) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);
      abortControllerRef.current = new AbortController();

      try {
        const response = await apiService.post<Response>(url, payload, {
          responseAs: 'response',
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            options.onDone?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n'); // Corrected: '\n' instead of '/n'
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue;
            try {
              const message = JSON.parse(line) as T;
              options.onMessage(message);
            } catch (e) {
              console.error('Failed to parse NDJSON line:', line, e);
              // Optionally, call onError for parsing errors
            }
          }
        }
      } catch (e: unknown) {
        if (isAbortError(e)) {
          console.log('Stream aborted by user.');
          return;
        }
        const fetchError = e instanceof Error ? e : new Error('An unknown error occurred');
        setError(fetchError);
        options.onError?.(fetchError);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { isLoading, error, startStream, stopStream };
};
