import { beforeEach, describe, expect, it, vi } from 'vitest';

type ReadLimitedBody = typeof import('@/api/apiService/readLimitedBody').readLimitedBody;

// Example of use importActual in case when we already used vi.mock('[pathToModule]')
const loadActualModule = () =>
  vi.importActual<typeof import('@/api/apiService/readLimitedBody')>(
    '@/api/apiService/readLimitedBody',
  );

describe('readLimitedBody', () => {
  let readLimitedBody: ReadLimitedBody;
  let BodyLimitExceededError: typeof import('@/api/apiService/readLimitedBody').BodyLimitExceededError;

  beforeEach(async () => {
    const mod = await loadActualModule();
    readLimitedBody = mod.readLimitedBody;
    BodyLimitExceededError = mod.BodyLimitExceededError;
  });

  it('returns empty string when response has no body', async () => {
    const response = new Response(null);

    const result = await readLimitedBody(response);

    expect(result).toBe('');
  });

  it('reads entire body when size is within the limit', async () => {
    const text = 'Hello, ApiService!';
    const response = new Response(text);

    const result = await readLimitedBody(response, text.length);

    expect(result).toBe(text);
  });

  it('truncates and cancels the stream when size exceeds the limit', async () => {
    const encoder = new TextEncoder();
    let cancelReason: unknown;
    const chunks = [encoder.encode('12345'), encoder.encode('6789')];

    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = chunks.shift();
        if (chunk) controller.enqueue(chunk);
      },
      cancel(reason) {
        cancelReason = reason;
      },
    });

    const response = new Response(stream);

    await expect(readLimitedBody(response, 6)).rejects.toBeInstanceOf(BodyLimitExceededError);
    expect(cancelReason).toBe('Body limit exceeded');
  });

  it('decodes multibyte characters split across chunks', async () => {
    const encoder = new TextEncoder();
    const text = 'A😀B'; // 6 bytes - new TextEncoder().encode(text)
    const bytes = encoder.encode(text);

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 3)); // partial emoji bytes
        controller.enqueue(bytes.slice(3));
        controller.close();
      },
    });

    const response = new Response(stream);

    const result = await readLimitedBody(response, 100);

    expect(result).toBe(text);
    expect(result).not.toContain('�');
  });

  it('returns a readable error message when stream reading fails', async () => {
    const streamError = new Error('boom');

    const stream = new ReadableStream<Uint8Array>({
      pull() {
        throw streamError;
      },
    });

    const response = new Response(stream);

    await expect(readLimitedBody(response, 10)).rejects.toThrow('[Body Read Error]: boom');
  });
});
