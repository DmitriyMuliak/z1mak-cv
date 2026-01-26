import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePolling } from '@/hooks/usePolling';

type TestData = {
  status: 'pending' | 'completed' | 'failed';
  value?: string;
  id?: number;
};

describe('usePolling Hook', () => {
  const mockFn = vi.fn<(ctx: { signal: AbortSignal }) => Promise<TestData>>();
  const mockOnSuccess = vi.fn<(data: TestData) => void>();
  const mockOnFailure = vi.fn<(err: Error) => void>();

  const validate = (data: TestData) => ({
    isComplete: data.status === 'completed',
    isFailed: data.status === 'failed',
  });

  /**
   * Flushes the microtask queue to ensure pending Promises and React state updates are processed.
   * This is essential for waiting for asynchronous operations (like the initial fetch)
   * to complete before making assertions.
   */
  const settle = async () => {
    await act(async () => {
      await Promise.resolve(); // 1. Allow the fetch Promise to resolve
      await Promise.resolve(); // 2. Allow React to process the state update resulting after fetch
    });
  };

  /**
   * Advances the fake timers by a specific duration and flushes the microtask queue.
   * This simulates the passage of time for polling intervals and ensures that any
   * new async requests triggered by `setTimeout` are fully resolved and reflected in the state.
   * * @param ms - The amount of time to advance in milliseconds.
   */
  const advance = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
      await Promise.resolve(); // 1. Resolve the promise triggered by the timeout callback
      await Promise.resolve(); // 2. Process the resulting state update
    });
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(0);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('fetches immediately and finishes if validation returns isComplete', async () => {
    mockFn.mockResolvedValue({ status: 'completed', value: 'result' });

    const { result, unmount } = renderHook(() =>
      usePolling({
        fn: mockFn,
        validate,
        onSuccess: mockOnSuccess,
        interval: 1000,
      }),
    );

    await settle();

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ status: 'completed', value: 'result' });
    expect(result.current.isFinished).toBe(true);
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).toHaveBeenCalledWith({ status: 'completed', value: 'result' });

    unmount();
  });

  it('polls repeatedly until validation returns isComplete', async () => {
    mockFn
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'completed', value: 'done' });

    const { result, unmount } = renderHook(() =>
      usePolling({
        fn: mockFn,
        validate,
        interval: 1000,
      }),
    );

    await settle();

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.isFinished).toBe(false);

    await advance(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result.current.isFinished).toBe(false);

    await advance(1000);
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(result.current.isFinished).toBe(true);
    expect(result.current.data).toEqual({ status: 'completed', value: 'done' });

    unmount();
  });

  it('handles errors and retries up to maxAttempts', async () => {
    const error = new Error('Network Error');
    mockFn.mockRejectedValue(error);

    const { result, unmount } = renderHook(() =>
      usePolling({
        fn: mockFn,
        validate,
        onFailure: mockOnFailure,
        interval: 1000,
        maxAttempts: 3,
      }),
    );

    await settle();

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.retryCount).toBe(1);
    expect(result.current.error).toEqual(error);
    expect(result.current.isFinished).toBe(false);

    await advance(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result.current.retryCount).toBe(2);
    expect(result.current.isFinished).toBe(false);

    await advance(1000);
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(result.current.retryCount).toBe(3);
    expect(result.current.isFinished).toBe(true);
    expect(mockOnFailure).toHaveBeenCalledTimes(1);
    expect(mockOnFailure).toHaveBeenCalledWith(error);

    unmount();
  });

  it('stops immediately if validation returns isFailed', async () => {
    mockFn.mockResolvedValueOnce({ status: 'failed' });

    const { result, unmount } = renderHook(() =>
      usePolling({
        fn: mockFn,
        validate,
        onFailure: mockOnFailure,
        onSuccess: mockOnSuccess,
      }),
    );

    await settle();

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.isFinished).toBe(true);
    expect(result.current.data).toEqual({ status: 'failed' });
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnFailure).not.toHaveBeenCalled();

    unmount();
  });

  it('handles global timeout', async () => {
    mockFn.mockResolvedValue({ status: 'pending' });

    const { result, unmount } = renderHook(() =>
      usePolling({
        fn: mockFn,
        validate,
        onFailure: mockOnFailure,
        interval: 1000,
        timeout: 2500,
      }),
    );

    await settle();
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.isFinished).toBe(false);

    await advance(1000);
    await advance(1000);
    await advance(1000);

    expect(result.current.isFinished).toBe(true);
    expect(result.current.error).toEqual(expect.objectContaining({ message: 'POLLING_TIMEOUT' }));
    expect(mockOnFailure).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('resets state and restarts polling when reset is called', async () => {
    mockFn
      .mockResolvedValueOnce({ status: 'completed', id: 1 })
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'completed', id: 2 });

    const { result, unmount } = renderHook(() =>
      usePolling({
        fn: mockFn,
        validate,
        interval: 1000,
      }),
    );

    await settle();

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.isFinished).toBe(true);
    expect(result.current.data).toEqual({ status: 'completed', id: 1 });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.isFinished).toBe(false);
    expect(result.current.retryCount).toBe(0);

    await settle();
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual({ status: 'pending' });

    await advance(1000);
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(result.current.isFinished).toBe(true);
    expect(result.current.data).toEqual({ status: 'completed', id: 2 });

    unmount();
  });

  it('aborts the in-flight request when component unmounts', async () => {
    let capturedSignal: AbortSignal | undefined;

    mockFn.mockImplementation(({ signal }) => {
      capturedSignal = signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() =>
      usePolling({
        fn: mockFn,
        validate,
        interval: 1000,
      }),
    );

    await settle();

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(capturedSignal).toBeDefined();
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
