'use client';

/**
 * useResumeStreamingV2
 *
 * Domain wrapper around the generic `useJsonPatchStream` hook.
 * Owns the resume-specific concerns:
 *   - URL construction from jobId
 *   - Global state via useAnalysisStore (Zustand, subscribeWithSelector)
 *
 * All connection/reconnect/sessionStorage logic lives in useJsonPatchStream.
 */

import { useCallback, useEffect, useRef } from 'react';
import type { Operation } from 'fast-json-patch';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { ResumeErrorCode, StatusResponse } from '@/actions/resume/resumeActions';
import type { AppError } from '@/types/server-actions';
import type { AnalysisSchemaType } from '../schema/analysisSchema';
import { DEFAULT_RESUME_ERROR_KEY, RESUME_ERROR_KEY_MAP } from '../consts/resumeErrors';
import { useAnalysisStore } from '../store/analysisStore';
import { useJsonPatchStream } from '@/hooks/useJsonPatchStream';

type StreamInitialData = {
  status?: StatusResponse;
  report?: AnalysisSchemaType;
};

const STREAM_ERROR_TOAST_ID = 'resume-stream-v2-error';

const getStorageKey = (jobId: string) => `resume-stream-last-id-${jobId}`;

const isResumeErrorCode = (v: string): v is ResumeErrorCode => v in RESUME_ERROR_KEY_MAP;

export const useResumeStreamingV2 = (
  jobId: string | null,
  initialData?: StreamInitialData,
  enabled = true,
) => {
  const tError = useTranslations('common.resumeErrors');
  const store = useAnalysisStore.getState;

  // Microtask-batch refs — collapses synchronous patch bursts (same TCP chunk)
  // into a single applyPatches call → one Zustand update → one React render.
  const pendingOpsRef = useRef<Operation[]>([]);
  const flushScheduledRef = useRef(false);

  // ── Init store on jobId / initialData change ──────────────────────────
  useEffect(() => {
    if (!jobId) return;

    store().reset(jobId);

    if (initialData?.status?.status && initialData.report) {
      store().setSnapshot(
        jobId,
        initialData.report as Record<string, unknown>,
        initialData.status.status,
      );
    } else if (initialData?.status?.status) {
      store().setStatus(initialData.status.status);
    } else {
      store().setStatus('loading');
    }
  }, [jobId, initialData]);

  const alreadyComplete =
    initialData?.status?.status === 'completed' && Boolean(initialData.report);

  const { retry: baseRetry } = useJsonPatchStream({
    url: jobId
      ? `${process.env.NEXT_PUBLIC_API_URL ?? ''}/resume/${encodeURIComponent(jobId)}/result-stream`
      : null,
    enabled: enabled && !alreadyComplete,
    storageKey: jobId ? getStorageKey(jobId) : null,

    // token will set by Next route (from cookie)
    // buildHeaders: () => ({
    //   Authorization: `Bearer ${useAuthStore.getState().accessToken ?? ''}`,
    // }),

    buildBody: (lastId) => (lastId ? { lastEventId: lastId } : {}),

    // ── Store adapter ─────────────────────────────────────────────────
    onSnapshot: (data, status) =>
      store().setSnapshot(jobId!, data as Record<string, unknown>, status),

    onPatch: (ops) => {
      pendingOpsRef.current.push(...ops);
      if (!flushScheduledRef.current) {
        flushScheduledRef.current = true;
        queueMicrotask(() => {
          flushScheduledRef.current = false;
          const accumulated = pendingOpsRef.current.splice(0);
          if (accumulated.length) store().applyPatches(accumulated);
        });
      }
    },

    onDone: (status, usedModel) => store().setDone(status, usedModel),

    // onStatusChange is intentionally omitted — the store status is driven by
    // snapshot/done events; the in_progress transition inside patch is handled
    // by setSnapshot's initial status and the final setDone.

    onError: ({ code, message }) => {
      const resolvedCode = isResumeErrorCode(code) ? code : 'PROVIDER_ERROR';
      const i18nKey = RESUME_ERROR_KEY_MAP[resolvedCode] ?? DEFAULT_RESUME_ERROR_KEY;
      toast.error(tError(i18nKey), { id: STREAM_ERROR_TOAST_ID });
      store().setError({ code: resolvedCode, message } as AppError);
    },

    isFatalError: (code) => {
      // Reconnect only makes sense for transient errors.
      // Permanent errors (job not found, auth failure) should stop retrying.
      const retryableCodes: ResumeErrorCode[] = ['PROVIDER_ERROR'];
      return !retryableCodes.includes(code as ResumeErrorCode);
    },
  });

  // ── retry — reset store then delegate cursor clear + reconnect ────────
  const retry = useCallback(() => {
    if (!jobId) return;
    store().reset(jobId);
    baseRetry();
  }, [jobId, baseRetry]);

  // ── Store selectors (granular re-renders) ─────────────────────────────
  const data = useAnalysisStore((s) => s.data);
  const status = useAnalysisStore((s) => s.status);
  const storeError = useAnalysisStore((s) => s.error);

  // ── Derived values ────────────────────────────────────────────────────
  const isProcessing =
    status === 'idle' || status === 'loading' || status === 'queued' || status === 'in_progress';

  const report = Object.keys(data).length > 0 ? (data as unknown as AnalysisSchemaType) : null;

  return {
    report,
    status: (status === 'idle' ? 'loading' : status) as StatusResponse['status'] | 'loading',
    error: storeError as AppError | null,
    isProcessing,
    retry,
  } as const;
};
