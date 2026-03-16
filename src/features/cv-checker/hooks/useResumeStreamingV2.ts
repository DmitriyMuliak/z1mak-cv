'use client';

/**
 * useResumeStreamingV2
 *
 * Replaces the old chunk-based `useResumeStreaming` with the new
 * JSON-Patch streaming protocol described in StreamingArhitecture.md:
 *
 *   snapshot → { content: object|null, status }   — full initial state
 *   patch    → { ops: Operation[] }               — RFC 6902 delta
 *   done     → { status, usedModel?, finishedAt? } — stream finished
 *   error    → { code, message, retryable? }       — terminal/retryable error
 *
 * ## Microtask batching
 * Patches that arrive in the same JS event-loop turn (e.g., multiple SSE
 * messages in a single TCP chunk) are accumulated in `pendingOpsRef` and
 * flushed in a single `queueMicrotask` callback → one Zustand update →
 * one React render cycle instead of N renders.
 *
 * ## Transport
 * Uses `fetchEventSource` from `@microsoft/fetch-event-source` — supports
 * POST and custom headers (needed for `Authorization: Bearer`), which the
 * browser's native `EventSource` does not.
 *
 * ## State
 * Analysis data lives in the global `useAnalysisStore` (Zustand with
 * `subscribeWithSelector`), so individual components can subscribe to
 * narrow slices and only re-render when their slice changes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { Operation } from 'fast-json-patch';
import { isAbortError } from '@/api/apiService/utils';
import type { ResumeErrorCode, StatusResponse } from '@/actions/resume/resumeActions';
import type { AppError } from '@/types/server-actions';
import type { AnalysisSchemaType } from '../schema/analysisSchema';
import { DEFAULT_RESUME_ERROR_KEY, RESUME_ERROR_KEY_MAP } from '../consts/resumeErrors';
import { useAnalysisStore, type AnalysisStatus } from '../store/analysisStore';
import { useAuthStore } from '@/store/stores/useAuthStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StreamInitialData = {
  status?: StatusResponse;
  report?: AnalysisSchemaType;
};

type SnapshotPayload = {
  content: Record<string, unknown> | null;
  status: StatusResponse['status'];
  code?: string;
  message?: string;
};

type PatchPayload = {
  ops: Operation[];
};

type DonePayload = {
  status: StatusResponse['status'];
  usedModel?: string;
  finishedAt?: string;
};

type ErrorPayload = {
  code: string;
  message: string;
  retryable?: boolean;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STREAM_ERROR_TOAST_ID = 'resume-stream-v2-error';
const STREAM_RECONNECT_DELAY_MS = 5000;
const FINAL_STATUSES = new Set<StatusResponse['status']>(['completed', 'failed']);

const getStorageKey = (jobId: string) => `resume-stream-last-id-${jobId}`;

const isResumeErrorCode = (v: string): v is ResumeErrorCode => v in RESUME_ERROR_KEY_MAP;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the same `{ report, status, error, isProcessing, retry }` interface
 * as `useResumePolling` so the two are interchangeable behind the
 * `useStreaming` flag in `ReportRenderer`.
 */
export const useResumeStreamingV2 = (
  jobId: string | null,
  initialData?: StreamInitialData,
  enabled = true,
) => {
  const tError = useTranslations('common.resumeErrors');
  const tErrorRef = useRef(tError);
  const initialDataRef = useRef(initialData);

  // retryVersion bumps trigger a fresh connection
  const [retryVersion, setRetryVersion] = useState(0);

  // ── Store selectors (granular subscriptions) ──────────────────────────────
  const data = useAnalysisStore((s) => s.data);
  const status = useAnalysisStore((s) => s.status);
  const storeError = useAnalysisStore((s) => s.error);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const statusRef = useRef<AnalysisStatus>(status);
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const disposedRef = useRef(false);
  /**
   * Set to true when an `error` event arrives with `retryable !== false`.
   * Cleared and checked after `consumeSseStream` returns so we can schedule
   * a reconnect even though the status is already `'failed'`.
   */
  const retryableFailureRef = useRef(false);

  // Microtask-batch refs
  const pendingOpsRef = useRef<Operation[]>([]);
  const flushScheduledRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    tErrorRef.current = tError;
  }, [tError]);
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // ── Microtask patch batcher ───────────────────────────────────────────────
  /**
   * Schedules a single `queueMicrotask` flush that applies all ops accumulated
   * in `pendingOpsRef` in one `applyPatches` call.
   *
   * Why queueMicrotask:
   *  - If the SSE reader delivers several patch events synchronously within
   *    the same `for` loop (all from a single TCP segment), they are all
   *    pushed to `pendingOpsRef` before the microtask fires, so they collapse
   *    into ONE Zustand update → one React render.
   *  - React 18 automatic batching handles the rest for events that arrive
   *    in separate async ticks.
   */
  const schedulePatchFlush = useCallback(() => {
    if (flushScheduledRef.current) return;
    flushScheduledRef.current = true;

    queueMicrotask(() => {
      flushScheduledRef.current = false;
      const ops = pendingOpsRef.current.splice(0);
      if (ops.length > 0) {
        useAnalysisStore.getState().applyPatches(ops);
      }
    });
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // ── Main connection effect ────────────────────────────────────────────────
  useEffect(() => {
    if (!jobId || !enabled) return;

    disposedRef.current = false;
    const storageKey = getStorageKey(jobId);
    const store = useAnalysisStore.getState;

    // Restore cursor for reconnect support
    lastEventIdRef.current = sessionStorage.getItem(storageKey);

    // Init store state for this job
    const startData = initialDataRef.current;
    store().reset(jobId);

    if (startData?.status?.status && startData.report) {
      store().setSnapshot(
        jobId,
        startData.report as Record<string, unknown>,
        startData.status.status,
      );
    } else if (startData?.status?.status) {
      store().setStatus(startData.status.status);
    } else {
      store().setStatus('loading');
    }

    // Short-circuit: data already complete
    if (startData?.status?.status === 'completed' && startData.report) {
      return () => {
        disposedRef.current = true;
        clearReconnectTimer();
        abortRef.current?.abort();
      };
    }

    // ── Terminal error handler ──
    const handleTerminalError = (code: ResumeErrorCode, message?: string) => {
      const i18nKey = RESUME_ERROR_KEY_MAP[code] ?? DEFAULT_RESUME_ERROR_KEY;
      toast.error(tErrorRef.current(i18nKey), { id: STREAM_ERROR_TOAST_ID });
      store().setError({ code, message });
    };

    // ── SSE connect ──
    const connect = async (): Promise<void> => {
      if (disposedRef.current || !jobId) return;

      abortRef.current?.abort();
      clearReconnectTimer();

      const controller = new AbortController();
      abortRef.current = controller;

      const token = useAuthStore.getState().accessToken;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
      const url = `${baseUrl}/resume/${encodeURIComponent(jobId)}/result-stream`;
      const body = lastEventIdRef.current ? { lastEventId: lastEventIdRef.current } : {};

      // Tracks terminal events synchronously — avoids stale statusRef.current
      // which is updated via useEffect (runs after render, not inline).
      let streamTerminated = false;

      try {
        await fetchEventSource(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
          openWhenHidden: true,

          onmessage(ev) {
            if (disposedRef.current) return;

            // Persist cursor on every event that carries an id
            if (ev.id && ev.id !== '0') {
              sessionStorage.setItem(storageKey, ev.id);
              lastEventIdRef.current = ev.id;
            }

            // ── snapshot ────────────────────────────────────────────────────
            if (ev.event === 'snapshot') {
              const payload = JSON.parse(ev.data) as SnapshotPayload;
              store().setSnapshot(jobId, payload.content, payload.status);

              if (payload.status === 'failed') {
                streamTerminated = true;
                const code =
                  payload.code && isResumeErrorCode(payload.code) ? payload.code : 'PROVIDER_ERROR';
                handleTerminalError(code, payload.message);
              }
              return;
            }

            // ── patch ───────────────────────────────────────────────────────
            if (ev.event === 'patch') {
              const payload = JSON.parse(ev.data) as PatchPayload;

              // Accumulate ops — flush will run at end of current microtask batch
              pendingOpsRef.current.push(...payload.ops);
              schedulePatchFlush();

              // Transition to in_progress if not already terminal
              if (!FINAL_STATUSES.has(statusRef.current as StatusResponse['status'])) {
                store().setStatus('in_progress');
              }
              return;
            }

            // ── done ────────────────────────────────────────────────────────
            if (ev.event === 'done') {
              const payload = JSON.parse(ev.data) as DonePayload;
              streamTerminated = true;
              store().setDone(payload.status, payload.usedModel);
              sessionStorage.removeItem(storageKey);
              lastEventIdRef.current = null;
              return;
            }

            // ── error ───────────────────────────────────────────────────────
            if (ev.event === 'error') {
              const payload = JSON.parse(ev.data) as ErrorPayload;
              const code = isResumeErrorCode(payload.code) ? payload.code : 'PROVIDER_ERROR';
              handleTerminalError(code, payload.message);

              if (payload.retryable === false) {
                streamTerminated = true;
                disposedRef.current = true; // permanently stop reconnecting
              } else {
                retryableFailureRef.current = true; // reconnect after stream closes
              }
            }
          },

          onerror(err) {
            // Always throw — we own the reconnect loop, not the library.
            throw err;
          },
        });

        if (disposedRef.current || controller.signal.aborted) return;

        const isRetryableError = retryableFailureRef.current;
        retryableFailureRef.current = false;

        // Reconnect if: stream ended without a terminal event, OR if the
        // error was explicitly marked retryable by the server.
        // Uses local `streamTerminated` (set synchronously in onmessage) instead
        // of statusRef.current which is stale until the next React render cycle.
        if (isRetryableError || !streamTerminated) {
          reconnectTimerRef.current = setTimeout(() => void connect(), STREAM_RECONNECT_DELAY_MS);
        }
      } catch (err) {
        if (disposedRef.current || isAbortError(err) || controller.signal.aborted) return;

        // Transient network error → reconnect after delay
        reconnectTimerRef.current = setTimeout(() => void connect(), STREAM_RECONNECT_DELAY_MS);
      }
    };

    void connect();

    return () => {
      disposedRef.current = true;
      clearReconnectTimer();
      abortRef.current?.abort();
    };
    // retryVersion intentionally included to allow manual retry
  }, [enabled, jobId, retryVersion, clearReconnectTimer, schedulePatchFlush]);

  // ── retry ─────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    if (!jobId) return;
    sessionStorage.removeItem(getStorageKey(jobId));
    lastEventIdRef.current = null;
    pendingOpsRef.current = [];
    useAnalysisStore.getState().reset(jobId);
    setRetryVersion((v) => v + 1);
  }, [jobId]);

  // ── Derived values ────────────────────────────────────────────────────────
  const isProcessing =
    status === 'idle' || status === 'loading' || status === 'queued' || status === 'in_progress';

  // Only expose the report once at least one top-level section has arrived.
  // Cast to full AnalysisSchemaType — components use optional chaining for
  // sections that haven't arrived yet (same pattern as legacy hook).
  const report = Object.keys(data).length > 0 ? (data as unknown as AnalysisSchemaType) : null;

  return {
    report,
    // Map store's `idle` to `loading` to match the polling hook's interface
    status: (status === 'idle' ? 'loading' : status) as StatusResponse['status'] | 'loading',
    error: storeError as AppError | null,
    isProcessing,
    retry,
  } as const;
};
