import { describe, it, expect, beforeEach } from 'vitest';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';

// Reset Zustand store state before each test so tests are isolated.
const resetStore = () => useAnalysisStore.getState().reset();

describe('analysisStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ── initial state ─────────────────────────────────────────────────────────

  it('starts with idle status and empty data', () => {
    const { jobId, data, status, usedModel, error } = useAnalysisStore.getState();
    expect(jobId).toBeNull();
    expect(data).toEqual({});
    expect(status).toBe('idle');
    expect(usedModel).toBeNull();
    expect(error).toBeNull();
  });

  // ── reset ─────────────────────────────────────────────────────────────────

  it('reset() restores initial state', () => {
    const store = useAnalysisStore.getState();
    store.setSnapshot(
      'job-1',
      { overallAnalysis: { independentCvScore: 90 } } as never,
      'completed',
    );
    store.reset();

    const s = useAnalysisStore.getState();
    expect(s.data).toEqual({});
    expect(s.status).toBe('idle');
    expect(s.jobId).toBeNull();
  });

  it('reset(jobId) sets jobId while clearing the rest', () => {
    useAnalysisStore.getState().reset('new-job');
    expect(useAnalysisStore.getState().jobId).toBe('new-job');
    expect(useAnalysisStore.getState().data).toEqual({});
    expect(useAnalysisStore.getState().status).toBe('idle');
  });

  // ── setSnapshot ───────────────────────────────────────────────────────────

  it('setSnapshot() replaces data and status', () => {
    const content = {
      overallAnalysis: {
        independentCvScore: 80,
        independentTechCvScore: 75,
        candidateLevel: 'Senior',
        suitabilitySummary: 'Good',
      },
    };
    useAnalysisStore.getState().setSnapshot('job-1', content as never, 'in_progress');

    const s = useAnalysisStore.getState();
    expect(s.jobId).toBe('job-1');
    expect(s.data).toEqual(content);
    expect(s.status).toBe('in_progress');
  });

  it('setSnapshot() with null content stores empty object', () => {
    useAnalysisStore.getState().setSnapshot('job-1', null, 'queued');

    expect(useAnalysisStore.getState().data).toEqual({});
    expect(useAnalysisStore.getState().status).toBe('queued');
  });

  // ── setStatus ─────────────────────────────────────────────────────────────

  it('setStatus() updates only status', () => {
    useAnalysisStore.getState().setSnapshot('job-1', { foo: 'bar' } as never, 'queued');
    useAnalysisStore.getState().setStatus('in_progress');

    const s = useAnalysisStore.getState();
    expect(s.status).toBe('in_progress');
    expect(s.data).toEqual({ foo: 'bar' }); // data unchanged
  });

  // ── applyPatches ──────────────────────────────────────────────────────────

  it('applyPatches() adds a new top-level section', () => {
    useAnalysisStore
      .getState()
      .applyPatches([{ op: 'add', path: '/overallAnalysis', value: { independentCvScore: 85 } }]);

    expect((useAnalysisStore.getState().data as Record<string, unknown>).overallAnalysis).toEqual({
      independentCvScore: 85,
    });
  });

  it('applyPatches() accumulates multiple sections without losing earlier ones', () => {
    const store = useAnalysisStore.getState();

    store.applyPatches([
      { op: 'add', path: '/overallAnalysis', value: { independentCvScore: 85 } },
    ]);
    store.applyPatches([{ op: 'add', path: '/quantitativeMetrics', value: { totalYearsInCV: 5 } }]);

    const data = useAnalysisStore.getState().data as Record<string, unknown>;
    expect(data.overallAnalysis).toEqual({ independentCvScore: 85 });
    expect(data.quantitativeMetrics).toEqual({ totalYearsInCV: 5 });
  });

  it('applyPatches() does NOT mutate the previous data object (immutable update)', () => {
    const before = useAnalysisStore.getState().data;

    useAnalysisStore.getState().applyPatches([{ op: 'add', path: '/section', value: 'hello' }]);

    const after = useAnalysisStore.getState().data;
    expect(after).not.toBe(before); // new reference
    expect(before).toEqual({}); // old reference unchanged
  });

  it('applyPatches() supports replace operation', () => {
    useAnalysisStore.getState().setSnapshot('j', { score: 50 } as never, 'in_progress');
    useAnalysisStore.getState().applyPatches([{ op: 'replace', path: '/score', value: 95 }]);

    expect((useAnalysisStore.getState().data as Record<string, unknown>).score).toBe(95);
  });

  // ── setDone ───────────────────────────────────────────────────────────────

  it('setDone() sets status and usedModel', () => {
    useAnalysisStore.getState().setDone('completed', 'gpt-4o');

    const s = useAnalysisStore.getState();
    expect(s.status).toBe('completed');
    expect(s.usedModel).toBe('gpt-4o');
  });

  it('setDone() sets usedModel to null when not provided', () => {
    useAnalysisStore.getState().setDone('completed');
    expect(useAnalysisStore.getState().usedModel).toBeNull();
  });

  // ── setError ──────────────────────────────────────────────────────────────

  it('setError() sets error object and status to failed', () => {
    useAnalysisStore.getState().setError({ code: 'PROVIDER_ERROR', message: 'oops' });

    const s = useAnalysisStore.getState();
    expect(s.status).toBe('failed');
    expect(s.error).toEqual({ code: 'PROVIDER_ERROR', message: 'oops' });
  });

  // ── subscribeWithSelector ─────────────────────────────────────────────────

  it('subscribeWithSelector fires listener only when subscribed slice changes', () => {
    const calls: unknown[] = [];

    const unsub = useAnalysisStore.subscribe(
      (s) => s.status,
      (status) => calls.push(status),
    );

    useAnalysisStore.getState().setStatus('in_progress'); // fires
    useAnalysisStore.getState().applyPatches([{ op: 'add', path: '/x', value: 1 }]); // no fire (data changed, not status)
    useAnalysisStore.getState().setStatus('completed'); // fires

    unsub();

    expect(calls).toEqual(['in_progress', 'completed']);
  });
});
