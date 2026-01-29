import { isAbortError } from './utils';

/**
 * Reads the response body stream with a hard limit on size.
 * Prevents memory exhaustion attacks or large file downloads on error endpoints.
 */
export const readLimitedBody = async (
  response: Response,
  limitBytes: number = 16 * 1024,
): Promise<string> => {
  if (!response.body) return '';

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let result = '';
  let receivedBytes = 0;

  try {
    while (true) {
      // 1. Read chunk
      const { done, value } = await reader.read();

      if (done) break;

      // value — it's Uint8Array
      receivedBytes += value.byteLength;

      // 2. Check limit
      if (receivedBytes > limitBytes) {
        await reader.cancel('Body limit exceeded');
        throw new BodyLimitExceededError(limitBytes);
      }

      // 3. Decode { stream: true } is important for correct processing of multibyte characters on chunk boundaries (e.g. Cyrillic/Emoji) split between chunks
      result += decoder.decode(value, { stream: true });
    }

    result += decoder.decode();
    return result;
  } catch (error) {
    if (error instanceof BodyLimitExceededError) throw error;
    if (isAbortError(error)) throw error;

    throw new Error(
      `[Body Read Error]: ${error instanceof Error ? error.message : 'Unknown stream error'}`,
    );
  }
  // finally is unnecessary for releaseLock here, as exhausting the stream (reading until done) or invoking cancel() implicitly releases the lock.
};

export class BodyLimitExceededError extends Error {
  constructor(public readonly limitBytes: number) {
    super(`Body limit exceeded (${limitBytes} bytes)`);
    this.name = 'BodyLimitExceededError';
  }
}
