import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNdjsonStream } from '@/hooks/useNdjsonStream';
import { apiService } from '@/api/client'; // Import the real apiService

// Helper to create a mock ReadableStream from a string array
function createMockStream(lines: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line + '\n'));
        await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate network delay
      }
      controller.close();
    },
  });
  return stream;
}

// Mock apiService.post
const mockApiServicePost = vi.fn();
apiService.post = mockApiServicePost;

describe('useNdjsonStream', () => {
  const originalPost = apiService.post;

  beforeEach(() => {
    apiService.post = mockApiServicePost;
    mockApiServicePost.mockClear();
  });

  afterEach(() => {
    apiService.post = originalPost;
    vi.restoreAllMocks();
  });

  it('should handle a successful stream and parse messages', async () => {
    const mockData = [
      { type: 'chunk', data: 'a' },
      { type: 'chunk', data: 'b' },
    ];
    const stream = createMockStream(mockData.map((d) => JSON.stringify(d)));
    mockApiServicePost.mockResolvedValue(new Response(stream, { status: 200 }));

    const onMessage = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useNdjsonStream<{ type: string; data: string }>());

    await act(async () => {
      await result.current.startStream('/api/test', {}, { onMessage, onDone });
    });

    expect(mockApiServicePost).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledTimes(2);
    expect(onMessage).toHaveBeenCalledWith(mockData[0]);
    expect(onMessage).toHaveBeenCalledWith(mockData[1]);
    expect(onDone).toHaveBeenCalledOnce();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set isLoading to true during streaming and false afterwards', async () => {
    let resolveResponse: ((response: Response) => void) | null = null;

    mockApiServicePost.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );

    const { result } = renderHook(() => useNdjsonStream());

    act(() => {
      void result.current.startStream('/api/test', {}, { onMessage: vi.fn() });
    });

    expect(result.current.isLoading).toBe(true);

    const stream = createMockStream(['{"type":"done"}']);
    if (!resolveResponse) {
      throw new Error('resolveResponse was not assigned');
    }

    // @ts-expect-error TS issue
    resolveResponse(new Response(stream, { status: 200 })) as (response: Response) => void;

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle apiService.post errors and set the error state', async () => {
    const mockError = new Error('Network Failure');
    mockApiServicePost.mockRejectedValue(mockError);

    const onError = vi.fn();
    const { result } = renderHook(() => useNdjsonStream());

    await act(async () => {
      await result.current.startStream('/api/test', {}, { onMessage: vi.fn(), onError });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(mockError);
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should handle HTTP errors from the response', async () => {
    mockApiServicePost.mockResolvedValue(new Response('Internal Server Error', { status: 500 }));

    const onError = vi.fn();
    const { result } = renderHook(() => useNdjsonStream());

    await act(async () => {
      await result.current.startStream('/api/test', {}, { onMessage: vi.fn(), onError });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('HTTP error! status: 500');
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should call abort on the AbortController when stopStream is called', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    mockApiServicePost.mockImplementation(
      (...args: unknown[]) =>
        new Promise<Response>((_resolve, reject) => {
          const options = args[2] as { signal?: AbortSignal } | undefined;
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          });
        }),
    );

    const onMessage = vi.fn();
    const { result } = renderHook(() => useNdjsonStream());

    act(() => {
      void result.current.startStream('/api/test', {}, { onMessage });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      result.current.stopStream();
    });

    expect(abortSpy).toHaveBeenCalledOnce();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
