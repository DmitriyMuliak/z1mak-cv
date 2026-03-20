'use client';

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';
import { applyPatch } from 'fast-json-patch';
import { envType } from '@/utils/envType';
import type { Operation } from 'fast-json-patch';
import type { AppError } from '@/types/server-actions';
import type { AnalysisSchemaType } from '../schema/analysisSchema';

/**
 * Status states for the analysis job.
 * `idle`        — store just initialised, no job started
 * `loading`     — connecting / fetching initial state
 * `queued`      — job is in the backend queue
 * `in_progress` — actively streaming patches
 * `completed`   — all patches received, final result ready
 * `failed`      — job failed (error payload or HTTP error)
 */
export type AnalysisStatus = 'idle' | 'loading' | 'queued' | 'in_progress' | 'completed' | 'failed';

/**
 * During streaming the object fills up section by section,
 * so all top-level keys are optional at any given moment.
 */
export type AnalysisData = Partial<AnalysisSchemaType> & Record<string, unknown>;

interface AnalysisStoreState {
  /** The jobId currently being tracked. */
  jobId: string | null;
  /** Partial analysis result — grows as patches are applied. */
  data: AnalysisData;
  status: AnalysisStatus;
  /** AI model used for the analysis (from `done` event). */
  usedModel: string | null;
  error: AppError | null;
}

interface AnalysisStoreActions {
  /**
   * Apply one or more RFC 6902 patch operations to `data`.
   * Uses `fast-json-patch` — does NOT mutate the existing object.
   */
  applyPatches: (ops: Operation[]) => void;

  /**
   * Replace the entire `data` with the snapshot content and set status.
   * Called on fresh connection (no `lastEventId`) or when status changes.
   */
  setSnapshot: (jobId: string, content: AnalysisData | null, status: AnalysisStatus) => void;

  /** Update status only (e.g., `in_progress` when first patch arrives). */
  setStatus: (status: AnalysisStatus) => void;

  /** Called when the `done` SSE event arrives. */
  setDone: (status: AnalysisStatus, usedModel?: string) => void;

  /** Called when a terminal error is received. */
  setError: (error: AppError) => void;

  /** Reset store to initial state, optionally with a new jobId. */
  reset: (jobId?: string) => void;
}

const INITIAL_STATE: AnalysisStoreState = {
  jobId: null,
  data: {},
  status: 'idle',
  usedModel: null,
  error: null,
};

/**
 * Global Zustand store for CV analysis streaming state.
 *
 * Uses `subscribeWithSelector` so individual components can subscribe to
 * specific slices (e.g. `s.data.overallAnalysis`) and only re-render when
 * that exact slice changes — granular re-renders without extra context providers.
 *
 * @example
 * // Component subscribes only to the overall score
 * const score = useAnalysisStore(s => s.data.overallAnalysis?.matchScore);
 */
export const useAnalysisStore = create<AnalysisStoreState & AnalysisStoreActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...INITIAL_STATE,

      applyPatches: (ops) => {
        set({
          data: produce(get().data, (draft) => {
            applyPatch(draft, ops, false, true);
          }) as AnalysisData,
        });
      },

      setSnapshot: (jobId, content, status) =>
        set({ jobId, data: (content ?? {}) as AnalysisData, status }),

      setStatus: (status) => set({ status }),

      setDone: (status, usedModel) => set({ status, usedModel: usedModel ?? null }),

      setError: (error) => set({ error, status: 'failed' }),

      reset: (jobId) => set({ ...INITIAL_STATE, jobId: jobId ?? null }),
    })),
    { name: 'AnalysisStore', enabled: envType.isDev },
  ),
);
