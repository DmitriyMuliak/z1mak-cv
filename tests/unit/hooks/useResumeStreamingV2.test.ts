import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks must be declared before any import of the mocked module ────────────

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

// Auth store — default token
vi.mock('@/store/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn().mockReturnValue({ accessToken: 'test-token' }),
  },
}));

// ── Import after mocks ────────────────────────────────────────────────────────

import { useResumeStreamingV2 } from '@/features/cv-checker/hooks/useResumeStreamingV2';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { EventSourceMessage } from '@microsoft/fetch-event-source';

const mockFes = vi.mocked(fetchEventSource);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a typed EventSourceMessage the way the library would deliver it. */
const sseMsg = (event: string, data: unknown, id = ''): EventSourceMessage => ({
  event,
  id,
  data: JSON.stringify(data),
  retry: undefined,
});

type FesOptions = Parameters<typeof fetchEventSource>[1];

/**
 * Drain the microtask queue:
 *   1. useEffect fires, connect() is called
 *   2. fetchEventSource (mocked) resolves synchronously
 *   3. onmessage callbacks run
 *   4. queueMicrotask(flush) fires → applyPatches
 */
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 6; i++) {
      await Promise.resolve();
    }
  });
};

// ── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  useAnalysisStore.getState().reset();
  sessionStorage.clear();
  mockFes.mockReset();
  // Default: fetchEventSource resolves immediately (empty stream, no events)
  mockFes.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useResumeStreamingV2', () => {
  // ── initial state ────────────────────────────────────────────────────────────

  it('starts with loading status and null report before connecting', () => {
    mockFes.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useResumeStreamingV2('job-1'));

    expect(result.current.status).toBe('loading');
    expect(result.current.report).toBeNull();
    expect(result.current.isProcessing).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // ── disabled / null ──────────────────────────────────────────────────────────

  it('does not connect when enabled=false', async () => {
    const { result } = renderHook(() => useResumeStreamingV2('job-1', undefined, false));
    await settle();

    expect(mockFes).not.toHaveBeenCalled();
    expect(result.current.status).toBe('loading');
  });

  it('does not connect when jobId is null', async () => {
    const { result } = renderHook(() => useResumeStreamingV2(null));
    await settle();

    expect(mockFes).not.toHaveBeenCalled();
    expect(result.current.report).toBeNull();
  });

  // ── request shape ────────────────────────────────────────────────────────────

  it('calls fetchEventSource with POST, Authorization header, and JSON body', async () => {
    renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(mockFes).toHaveBeenCalledWith(
      expect.stringContaining('/resume/job-1/result-stream'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({}),
      }),
    );
  });

  // ── snapshot: queued ─────────────────────────────────────────────────────────

  it('handles snapshot(queued) and schedules reconnect after 5 s', async () => {
    mockFes
      .mockImplementationOnce(async (_url, opts: FesOptions) => {
        opts.onmessage!(sseMsg('snapshot', { content: null, status: 'queued' }));
      })
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useResumeStreamingV2('job-1'));
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

  // ── snapshot: completed ──────────────────────────────────────────────────────

  it('handles snapshot(completed) + done — sets report, no reconnect', async () => {
    const content = {
      overallAnalysis: {
        independentCvScore: 88,
        independentTechCvScore: 80,
        candidateLevel: 'Senior',
        suitabilitySummary: 'Great fit',
      },
    };

    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(sseMsg('snapshot', { content, status: 'completed' }));
      opts.onmessage!(sseMsg('done', { status: 'completed', usedModel: 'gpt-4o' }));
    });

    const { result } = renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(result.current.status).toBe('completed');
    expect(result.current.isProcessing).toBe(false);
    expect((result.current.report as Record<string, unknown>)?.overallAnalysis).toEqual(
      content.overallAnalysis,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(mockFes).toHaveBeenCalledTimes(1);
  });

  // ── patch events ─────────────────────────────────────────────────────────────

  it('applies patch events progressively and completes on done', async () => {
    const overallAnalysis = {
      independentCvScore: 90,
      independentTechCvScore: 85,
      candidateLevel: 'Senior',
      suitabilitySummary: 'Excellent',
    };
    const quantitativeMetrics = { totalYearsInCV: 7 };

    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(sseMsg('snapshot', { content: {}, status: 'in_progress' }));
      opts.onmessage!(
        sseMsg(
          'patch',
          { ops: [{ op: 'add', path: '/overallAnalysis', value: overallAnalysis }] },
          '1',
        ),
      );
      opts.onmessage!(
        sseMsg(
          'patch',
          { ops: [{ op: 'add', path: '/quantitativeMetrics', value: quantitativeMetrics }] },
          '2',
        ),
      );
      opts.onmessage!(sseMsg('done', { status: 'completed', usedModel: 'claude-3-5-sonnet' }));
    });

    const { result } = renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(result.current.status).toBe('completed');
    const report = result.current.report as Record<string, unknown>;
    expect(report.overallAnalysis).toEqual(overallAnalysis);
    expect(report.quantitativeMetrics).toEqual(quantitativeMetrics);
  });

  // ── microtask batching ───────────────────────────────────────────────────────

  it('batches synchronous patch burst into one applyPatches call', async () => {
    const applySpy = vi.spyOn(useAnalysisStore.getState(), 'applyPatches');

    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(sseMsg('snapshot', { content: {}, status: 'in_progress' }));
      // Both onmessage calls are synchronous — same microtask turn
      opts.onmessage!(sseMsg('patch', { ops: [{ op: 'add', path: '/sectionA', value: 1 }] }, '1'));
      opts.onmessage!(sseMsg('patch', { ops: [{ op: 'add', path: '/sectionB', value: 2 }] }, '2'));
      opts.onmessage!(sseMsg('done', { status: 'completed' }));
    });

    renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(applySpy).toHaveBeenCalledTimes(1);
    expect(applySpy).toHaveBeenCalledWith([
      { op: 'add', path: '/sectionA', value: 1 },
      { op: 'add', path: '/sectionB', value: 2 },
    ]);

    const data = useAnalysisStore.getState().data as Record<string, unknown>;
    expect(data.sectionA).toBe(1);
    expect(data.sectionB).toBe(2);
  });

  // ── error: retryable ─────────────────────────────────────────────────────────

  it('handles retryable error — shows toast and reconnects after 5 s', async () => {
    const { toast } = await import('sonner');

    mockFes
      .mockImplementationOnce(async (_url, opts: FesOptions) => {
        opts.onmessage!(
          sseMsg('error', { code: 'PROVIDER_ERROR', message: 'upstream down', retryable: true }),
        );
      })
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(result.current.status).toBe('failed');
    expect(result.current.error).toMatchObject({ code: 'PROVIDER_ERROR' });
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(mockFes).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    await settle();

    expect(mockFes).toHaveBeenCalledTimes(2);
  });

  // ── error: non-retryable ─────────────────────────────────────────────────────

  it('handles non-retryable error — shows toast, does NOT reconnect', async () => {
    const { toast } = await import('sonner');

    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(
        sseMsg('error', { code: 'NOT_FOUND', message: 'job gone', retryable: false }),
      );
    });

    const { result } = renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(result.current.status).toBe('failed');
    expect(toast.error).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(mockFes).toHaveBeenCalledTimes(1);
  });

  // ── lastEventId ──────────────────────────────────────────────────────────────

  it('reads lastEventId from sessionStorage and sends it in request body', async () => {
    sessionStorage.setItem('resume-stream-last-id-job-1', '42-0');

    renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(mockFes).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ lastEventId: '42-0' }) }),
    );
  });

  it('removes the cursor from sessionStorage when done is received', async () => {
    sessionStorage.setItem('resume-stream-last-id-job-1', 'old-id');

    mockFes.mockImplementationOnce(async (_url, opts: FesOptions) => {
      opts.onmessage!(sseMsg('snapshot', { content: {}, status: 'in_progress' }));
      opts.onmessage!(sseMsg('patch', { ops: [{ op: 'add', path: '/x', value: 1 }] }, 'ev-1'));
      opts.onmessage!(sseMsg('done', { status: 'completed' }));
    });

    renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(sessionStorage.getItem('resume-stream-last-id-job-1')).toBeNull();
  });

  it('persists event id to sessionStorage for mid-stream reconnect', async () => {
    mockFes
      .mockImplementationOnce(async (_url, opts: FesOptions) => {
        opts.onmessage!(sseMsg('snapshot', { content: {}, status: 'in_progress' }));
        opts.onmessage!(sseMsg('patch', { ops: [{ op: 'add', path: '/x', value: 1 }] }, 'ev-99'));
        // stream ends without done → triggers reconnect
      })
      .mockResolvedValue(undefined);

    renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(sessionStorage.getItem('resume-stream-last-id-job-1')).toBe('ev-99');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    await settle();

    expect(mockFes).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ lastEventId: 'ev-99' }) }),
    );
  });

  // ── retry() ──────────────────────────────────────────────────────────────────

  it('retry() clears cursor, resets store, and reconnects without lastEventId', async () => {
    sessionStorage.setItem('resume-stream-last-id-job-1', 'old-cursor');

    mockFes
      .mockImplementationOnce(async (_url, opts: FesOptions) => {
        opts.onmessage!(sseMsg('snapshot', { content: null, status: 'queued' }));
      })
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(mockFes).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.retry();
    });
    await settle();

    expect(sessionStorage.getItem('resume-stream-last-id-job-1')).toBeNull();
    expect(mockFes).toHaveBeenCalledTimes(2);
    expect(mockFes).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({}) }),
    );
  });

  // ── unmount / abort ──────────────────────────────────────────────────────────

  it('passes AbortSignal and aborts it on unmount', async () => {
    let capturedSignal: AbortSignal | null | undefined;

    mockFes.mockImplementation((_url, opts: FesOptions) => {
      capturedSignal = opts.signal;
      return new Promise(() => {}); // never resolves
    });

    const { unmount } = renderHook(() => useResumeStreamingV2('job-1'));
    await settle();

    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  // ── initialData short-circuit ─────────────────────────────────────────────────

  it('skips connecting when initialData is already completed with a report', async () => {
    const initialData = {
      status: { status: 'completed' as const },
      report: { overallAnalysis: { independentCvScore: 99 } } as never,
    };

    const { result } = renderHook(() => useResumeStreamingV2('job-1', initialData));
    await settle();

    expect(mockFes).not.toHaveBeenCalled();
    expect(result.current.status).toBe('completed');
    expect(result.current.isProcessing).toBe(false);
  });

  it('uses initialData status to pre-populate the store before connecting', async () => {
    const initialData = { status: { status: 'queued' as const } };

    const { result } = renderHook(() => useResumeStreamingV2('job-1', initialData));

    expect(result.current.status).toBe('queued');
    await settle();
  });
});
