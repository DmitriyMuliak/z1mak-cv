import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn(),
}));

import { useJsonPatchStream } from '@/hooks/useJsonPatchStream';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { EventSourceMessage } from '@microsoft/fetch-event-source';

const mockFes = vi.mocked(fetchEventSource);

// ── Helpers ───────────────────────────────────────────────────────────────

const sseMsg = (event: string, data: unknown, id = ''): EventSourceMessage => ({
  event,
  id,
  data: JSON.stringify(data),
  retry: undefined,
});

type FesOptions = Parameters<typeof fetchEventSource>[1];

const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 6; i++) {
      await Promise.resolve();
    }
  });
};

// ── Setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  sessionStorage.clear();
  mockFes.mockReset();
  mockFes.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useJsonPatchStream', () => {
  // ── initial state ────────────────────────────────────────────────────────

  it('starts in loading state with null data', () => {
    mockFes.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1' }));

    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeNull();
    expect(result.current.isProcessing).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // ── disabled / null ──────────────────────────────────────────────────────

  it('does not connect when enabled=false', async () => {
    const { result } = renderHook(() =>
      useJsonPatchStream({ url: '/api/stream/job-1', enabled: false }),
    );
    await settle();

    expect(mockFes).not.toHaveBeenCalled();
    expect(result.current.status).toBe('loading');
  });

  it('does not connect when url is null', async () => {
    const { result } = renderHook(() => useJsonPatchStream({ url: null }));
    await settle();

    expect(mockFes).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  // ── request shape ────────────────────────────────────────────────────────

  it('calls fetchEventSource with POST, custom headers, and JSON body', async () => {
    renderHook(() =>
      useJsonPatchStream({
        url: '/api/stream/job-1',
        buildHeaders: () => ({ Authorization: 'Bearer test-token' }),
      }),
    );
    await settle();

    expect(mockFes).toHaveBeenCalledWith(
      '/api/stream/job-1',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ authorization: 'Bearer test-token' }),
        body: JSON.stringify({}),
      }),
    );
  });

  it('includes lastEventId in body when storageKey matches stored value', async () => {
    sessionStorage.setItem('stream-cursor-job-1', 'ev-42');

    renderHook(() =>
      useJsonPatchStream({ url: '/api/stream/job-1', storageKey: 'stream-cursor-job-1' }),
    );
    await settle();

    expect(mockFes).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ lastEventId: 'ev-42' }) }),
    );
  });

  it('uses buildBody when provided', async () => {
    renderHook(() =>
      useJsonPatchStream({
        url: '/api/stream/job-1',
        buildBody: (lastId) => ({ cursor: lastId ?? 'start' }),
      }),
    );
    await settle();

    expect(mockFes).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ cursor: 'start' }) }),
    );
  });

  // ── snapshot: queued → reconnect ─────────────────────────────────────────

  it('handles snapshot(queued) and schedules reconnect after delay', async () => {
    mockFes
      .mockImplementationOnce(async (_url, opts: FesOptions) => {
        opts.onmessage!(sseMsg('snapshot', { content: null, status: 'queued' }));
      })
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1' }));
    await settle();

    expect(result.current.status).toBe('queued');
    expect(result.current.isProcessing).toBe(true);
    expect(mockFes).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    await settle();

    expect(mockFes).toHaveBeenCalledTimes(2);
  });

  // ── snapshot: completed → no reconnect ───────────────────────────────────

  it('handles snapshot(completed) + done — sets data, no reconnect', async () => {
    const content = { score: 88, level: 'Senior' };

    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(sseMsg('snapshot', { content, status: 'completed' }));
      opts.onmessage!(sseMsg('done', { status: 'completed' }));
    });

    const { result } = renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1' }));
    await settle();

    expect(result.current.status).toBe('completed');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.data).toEqual(content);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(mockFes).toHaveBeenCalledTimes(1);
  });

  // ── patch events ─────────────────────────────────────────────────────────

  it('applies patch events progressively and completes on done', async () => {
    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(sseMsg('snapshot', { content: {}, status: 'in_progress' }));
      opts.onmessage!(sseMsg('patch', { ops: [{ op: 'add', path: '/sectionA', value: 1 }] }, '1'));
      opts.onmessage!(sseMsg('patch', { ops: [{ op: 'add', path: '/sectionB', value: 2 }] }, '2'));
      opts.onmessage!(sseMsg('done', { status: 'completed' }));
    });

    const { result } = renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1' }));
    await settle();

    expect(result.current.status).toBe('completed');
    const data = result.current.data as Record<string, unknown>;
    expect(data.sectionA).toBe(1);
    expect(data.sectionB).toBe(2);
  });

  // ── error: retryable ──────────────────────────────────────────────────────

  it('handles retryable error — calls onError and reconnects after delay', async () => {
    const onError = vi.fn();

    mockFes
      .mockImplementationOnce(async (_url, opts: FesOptions) => {
        opts.onmessage!(
          sseMsg('error', { code: 'PROVIDER_ERROR', message: 'upstream down', retryable: true }),
        );
      })
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1', onError }));
    await settle();

    expect(result.current.status).toBe('failed');
    expect(result.current.error).toMatchObject({ code: 'PROVIDER_ERROR' });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(mockFes).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    await settle();

    expect(mockFes).toHaveBeenCalledTimes(2);
  });

  // ── error: non-retryable ──────────────────────────────────────────────────

  it('handles non-retryable error — does NOT reconnect', async () => {
    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(sseMsg('error', { code: 'NOT_FOUND', message: 'gone', retryable: false }));
    });

    const { result } = renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1' }));
    await settle();

    expect(result.current.status).toBe('failed');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(mockFes).toHaveBeenCalledTimes(1);
  });

  // ── isFatalError ──────────────────────────────────────────────────────────

  it('isFatalError() stops reconnect even when server says retryable:true', async () => {
    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(
        sseMsg('error', { code: 'UNAUTHORIZED', message: 'no token', retryable: true }),
      );
    });

    renderHook(() =>
      useJsonPatchStream({
        url: '/api/stream/job-1',
        isFatalError: (code) => code === 'UNAUTHORIZED',
      }),
    );
    await settle();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(mockFes).toHaveBeenCalledTimes(1);
  });

  // ── sessionStorage cursor ─────────────────────────────────────────────────

  it('persists event id to sessionStorage and resumes after reconnect', async () => {
    mockFes
      .mockImplementationOnce(async (_url, opts: FesOptions) => {
        opts.onmessage!(sseMsg('snapshot', { content: {}, status: 'in_progress' }));
        opts.onmessage!(sseMsg('patch', { ops: [{ op: 'add', path: '/x', value: 1 }] }, 'ev-99'));
        // stream ends without done → triggers reconnect
      })
      .mockResolvedValue(undefined);

    renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1', storageKey: 'test-cursor' }));
    await settle();

    expect(sessionStorage.getItem('test-cursor')).toBe('ev-99');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    await settle();

    expect(mockFes).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ lastEventId: 'ev-99' }) }),
    );
  });

  it('removes cursor from sessionStorage when done is received', async () => {
    sessionStorage.setItem('test-cursor', 'old-id');

    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(sseMsg('snapshot', { content: {}, status: 'in_progress' }));
      opts.onmessage!(sseMsg('patch', { ops: [{ op: 'add', path: '/x', value: 1 }] }, 'ev-1'));
      opts.onmessage!(sseMsg('done', { status: 'completed' }));
    });

    renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1', storageKey: 'test-cursor' }));
    await settle();

    expect(sessionStorage.getItem('test-cursor')).toBeNull();
  });

  // ── retry() ───────────────────────────────────────────────────────────────

  it('retry() clears cursor and reconnects without lastEventId', async () => {
    sessionStorage.setItem('test-cursor', 'old-cursor');

    mockFes
      .mockImplementationOnce(async (_url, opts: FesOptions) => {
        opts.onmessage!(sseMsg('snapshot', { content: null, status: 'queued' }));
      })
      .mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useJsonPatchStream({ url: '/api/stream/job-1', storageKey: 'test-cursor' }),
    );
    await settle();

    act(() => {
      result.current.retry();
    });
    await settle();

    expect(sessionStorage.getItem('test-cursor')).toBeNull();
    expect(mockFes).toHaveBeenCalledTimes(2);
    expect(mockFes).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({}) }),
    );
  });

  // ── abort on unmount ──────────────────────────────────────────────────────

  it('passes AbortSignal and aborts on unmount', async () => {
    let capturedSignal: AbortSignal | null | undefined;

    mockFes.mockImplementation((_url, opts: FesOptions) => {
      capturedSignal = opts.signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useJsonPatchStream({ url: '/api/stream/job-1' }));
    await settle();

    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  // ── initialData short-circuit ─────────────────────────────────────────────

  it('skips connecting when initialData is completed with data', async () => {
    const initialData = {
      status: 'completed' as const,
      data: { score: 99 },
    };

    const { result } = renderHook(() =>
      useJsonPatchStream({ url: '/api/stream/job-1', initialData }),
    );
    await settle();

    expect(mockFes).not.toHaveBeenCalled();
    expect(result.current.status).toBe('completed');
    expect(result.current.isProcessing).toBe(false);
  });

  it('uses initialData.status to pre-populate before connecting', async () => {
    const { result } = renderHook(() =>
      useJsonPatchStream({
        url: '/api/stream/job-1',
        initialData: { status: 'queued' },
      }),
    );

    expect(result.current.status).toBe('queued');
    await settle();
  });
});
