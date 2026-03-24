'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { applyPatch } from 'fast-json-patch';
import { isAbortError } from '@/api/apiService/utils';
import { useLatest } from '../useLatest';
import { calculateBackoffDelay } from './backoff';
import { createReducer } from './reducer';
import type {
  UseJsonPatchStreamOptions,
  SnapshotPayload,
  PatchPayload,
  DonePayload,
  ErrorPayload,
} from './types';

/**
 * useJsonPatchStream
 *
 * Generic, reusable hook for any SSE endpoint that speaks the JSON-Patch
 * streaming protocol:
 *
 *   snapshot → { content: object|null, status }   — full initial state
 *   patch    → { ops: Operation[] }               — RFC 6902 delta
 *   done     → { status, usedModel?, ... }        — stream finished
 *   error    → { code, message, retryable? }      — terminal/retryable error
 *
 * ## Usage
 * ```ts
 * const { data, status, error, isProcessing, retry } = useJsonPatchStream<MyData>({
 *   url: '/api/jobs/123/result-stream',
 *   buildHeaders: () => ({ Authorization: `Bearer ${useAuthStore.getState().accessToken}` }),
 * });
 * ```
 *
 * ## State
 * Uses local `useReducer` — no external store required. Data grows section by
 * section as patches arrive; components should use optional chaining.
 *
 * ## Reconnect
 * Reconnects automatically unless a `done` or non-retryable `error` event was
 * received. Uses a synchronous `streamTerminatedRef` to avoid the stale-React-
 * state problem that would occur if the decision were based on derived status.
 */
export const useJsonPatchStream = <TData extends Record<string, unknown>>({
  url,
  enabled = true,
  storageKey = null,
  reconnectDelayMs = 5_000,
  stallTimeoutMs = 30_000,
  buildHeaders,
  buildBody,
  initialData,
  isFatalError,
  onError,
  onSnapshot,
  onPatch,
  onDone,
  onStatusChange,
  onTelemetry,
}: UseJsonPatchStreamOptions<TData>) => {
  const reducerFn = useRef(createReducer<TData>()).current;

  const [state, dispatch] = useReducer(reducerFn, {
    data: (initialData?.data ?? {}) as Partial<TData>,
    status: initialData?.status ?? 'loading',
    error: null,
  });

  const [retryVersion, setRetryVersion] = useState(0);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const disposedRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionStartTimeRef = useRef<number | null>(null);
  const patchCountRef = useRef(0);
  const lastRetryTimeRef = useRef<number>(0);

  // Authoritative data accumulator — updated synchronously in onmessage so
  // each applyPatch has the correct base. Never mutated in the render body.
  const dataRef = useRef((initialData?.data ?? {}) as Partial<TData>);

  // Stable callback refs — always hold the latest value, never stale in closures
  const buildHeadersRef = useLatest(buildHeaders);
  const buildBodyRef = useLatest(buildBody);
  const isFatalErrorRef = useLatest(isFatalError);
  const onErrorRef = useLatest(onError);
  const initialDataRef = useLatest(initialData);
  const onSnapshotRef = useLatest(onSnapshot);
  const onPatchRef = useLatest(onPatch);
  const onDoneRef = useLatest(onDone);
  const onStatusChangeRef = useLatest(onStatusChange);
  const onTelemetryRef = useLatest(onTelemetry);

  // ── Main connection effect ────────────────────────────────────────────────
  useEffect(() => {
    if (!url || !enabled) return;

    disposedRef.current = false;

    // ── Inline helpers ────────────────────────────────────────────────────
    // Defined inside the effect so they close over the right refs without
    // needing useCallback, keeping the dependency array minimal.

    function clearReconnectTimer() {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function clearStallTimer() {
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    }

    function resetStallTimer(controller: AbortController) {
      clearStallTimer();
      stallTimerRef.current = setTimeout(() => {
        if (!disposedRef.current && !controller.signal.aborted) {
          console.warn('[useJsonPatchStream] Stall detected, aborting connection');
          onTelemetryRef.current?.({
            type: 'stall_detected',
            durationMs: connectionStartTimeRef.current
              ? Date.now() - connectionStartTimeRef.current
              : undefined,
            patchCount: patchCountRef.current,
          });
          controller.abort('stall');
        }
      }, stallTimeoutMs);
    }

    // Restore cursor for mid-stream reconnect
    lastEventIdRef.current = storageKey ? (sessionStorage.getItem(storageKey) ?? null) : null;

    // Initialize state from initialData
    const startData = initialDataRef.current;
    if (startData?.status && startData.data) {
      dataRef.current = startData.data as Partial<TData>;
      dispatch({
        type: 'SNAPSHOT',
        data: startData.data as Partial<TData>,
        status: startData.status,
      });
    } else if (startData?.status) {
      dispatch({ type: 'SET_STATUS', status: startData.status });
    } else {
      dataRef.current = {} as Partial<TData>;
      dispatch({ type: 'RESET' });
    }

    // Short-circuit: already complete
    if (startData?.status === 'completed' && startData.data) {
      return () => {
        disposedRef.current = true;
        clearReconnectTimer();
        abortRef.current?.abort();
      };
    }

    // ── connect ───────────────────────────────────────────────────────────
    const connect = async (): Promise<void> => {
      if (disposedRef.current) return;

      abortRef.current?.abort();
      clearReconnectTimer();
      clearStallTimer();

      const controller = new AbortController();
      abortRef.current = controller;
      connectionStartTimeRef.current = Date.now();
      patchCountRef.current = 0;

      onTelemetryRef.current?.({
        type: reconnectAttemptRef.current === 0 ? 'connect' : 'reconnect',
        attemptNumber: reconnectAttemptRef.current,
      });

      const headers = buildHeadersRef.current?.() ?? {};
      const body = buildBodyRef.current
        ? buildBodyRef.current(lastEventIdRef.current)
        : lastEventIdRef.current
          ? { lastEventId: lastEventIdRef.current }
          : {};

      /**
       * Local synchronous flag — set inside onmessage, checked after
       * fetchEventSource resolves. Avoids the stale-React-state problem:
       * status in React state is only updated after the next render cycle,
       * but we need the decision synchronously right after the stream closes.
       */
      let streamTerminated = false;
      let retryableFailure = false;

      try {
        await fetchEventSource(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...flattenHeaders(headers),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
          openWhenHidden: true,

          async onopen(response) {
            if (
              response.ok &&
              response.headers.get('content-type')?.includes('text/event-stream')
            ) {
              resetStallTimer(controller);
              return; // healthy SSE connection
            }

            const status = response.status;
            // 4xx errors are permanent — retrying without user action won't help.
            // 5xx errors are transient and should be retried.
            const fatal = status >= 400 && status < 500;
            const code = `HTTP_${status}`;

            dispatch({ type: 'ERROR', code, message: `HTTP error ${status}` });
            onErrorRef.current?.({ code, message: `HTTP error ${status}`, retryable: !fatal });

            if (fatal) {
              streamTerminated = true;
              disposedRef.current = true;
              // Clear stale cursor — a 400 often means the stored lastEventId
              // failed server-side validation; fresh connect should start clean.
              if (storageKey) sessionStorage.removeItem(storageKey);
            }

            throw new Error(code);
          },

          onmessage(ev) {
            if (disposedRef.current) return;

            // Reset stall timer on every event
            resetStallTimer(controller);

            // Reset reconnect attempt count on first successful event
            if (reconnectAttemptRef.current > 0) {
              reconnectAttemptRef.current = 0;
            }

            // Persist cursor on every event that carries an id
            if (ev.id && ev.id !== '0') {
              if (storageKey) sessionStorage.setItem(storageKey, ev.id);
              lastEventIdRef.current = ev.id;
            }

            // ── snapshot ────────────────────────────────────────────────
            if (ev.event === 'snapshot') {
              const payload = JSON.parse(ev.data) as SnapshotPayload;
              dataRef.current = (payload.content ?? {}) as Partial<TData>;
              dispatch({
                type: 'SNAPSHOT',
                data: dataRef.current,
                status: payload.status,
              });
              onSnapshotRef.current?.(payload.content as Partial<TData> | null, payload.status);
              onTelemetryRef.current?.({
                type: 'snapshot_received',
                metadata: { status: payload.status },
              });

              if (payload.status === 'failed') {
                streamTerminated = true;
                clearStallTimer();
                const error = {
                  code: payload.code ?? 'PROVIDER_ERROR',
                  message: payload.message ?? '',
                };
                dispatch({ type: 'ERROR', ...error });
                onErrorRef.current?.({ ...error, retryable: false });
              }
              return;
            }

            // ── patch ────────────────────────────────────────────────────
            if (ev.event === 'patch') {
              const payload = JSON.parse(ev.data) as PatchPayload;
              patchCountRef.current += 1;

              try {
                // mutateDocument: false (4th arg) — returns a new shallow-copied object
                // instead of mutating in place. Required for React change detection:
                // useReducer bails out when the reference is the same (Object.is),
                // so mutating dataRef.current directly would silently skip re-renders.
                // Shallow copy is sufficient — untouched nested objects keep their
                // references, letting React.memo'd children skip unnecessary re-renders.
                const next = applyPatch(dataRef.current as object, payload.ops, false, false)
                  .newDocument as Partial<TData>;
                dataRef.current = next;
                dispatch({ type: 'PATCH', data: next });
              } catch (e) {
                console.error('[useJsonPatchStream] Invalid patch rejected:', e);
                const error = { code: 'INVALID_PATCH', message: String(e) };
                dispatch({ type: 'ERROR', ...error });
                onErrorRef.current?.({ ...error, retryable: false });
                onTelemetryRef.current?.({
                  type: 'error',
                  durationMs: connectionStartTimeRef.current
                    ? Date.now() - connectionStartTimeRef.current
                    : undefined,
                  patchCount: patchCountRef.current,
                  metadata: { code: 'INVALID_PATCH', retryable: false },
                });
                streamTerminated = true;
                controller.abort('invalid_patch');
                return; // skip onPatch / onStatusChange / patch telemetry
              }

              onPatchRef.current?.(payload.ops);
              onStatusChangeRef.current?.('in_progress');
              onTelemetryRef.current?.({
                type: 'patch_received',
                patchCount: patchCountRef.current,
              });
              return;
            }

            // ── done ─────────────────────────────────────────────────────
            if (ev.event === 'done') {
              // TODO: BE should send status && usedModel on 'done' event
              const payload = JSON.parse(ev.data) as DonePayload;
              streamTerminated = true;
              clearStallTimer();
              dispatch({ type: 'DONE', status: payload.status });
              onDoneRef.current?.(payload.status || 'completed', payload.usedModel);
              if (storageKey) sessionStorage.removeItem(storageKey);
              lastEventIdRef.current = null;
              onTelemetryRef.current?.({
                type: 'done',
                durationMs: connectionStartTimeRef.current
                  ? Date.now() - connectionStartTimeRef.current
                  : undefined,
                patchCount: patchCountRef.current,
                metadata: { status: payload.status, usedModel: payload.usedModel },
              });
              return;
            }

            // ── error ────────────────────────────────────────────────────
            if (ev.event === 'error') {
              const payload = JSON.parse(ev.data) as ErrorPayload;
              dispatch({ type: 'ERROR', code: payload.code, message: payload.message });
              onErrorRef.current?.(payload);
              onTelemetryRef.current?.({
                type: 'error',
                durationMs: connectionStartTimeRef.current
                  ? Date.now() - connectionStartTimeRef.current
                  : undefined,
                patchCount: patchCountRef.current,
                metadata: { code: payload.code, retryable: payload.retryable },
              });

              const fatal =
                payload.retryable === false || isFatalErrorRef.current?.(payload.code) === true;

              if (fatal) {
                streamTerminated = true;
                clearStallTimer();
                disposedRef.current = true; // permanently stop reconnecting
              } else {
                retryableFailure = true;
              }
            }
          },

          onerror(err) {
            // Always throw — we own the reconnect loop, not the library.
            throw err;
          },
        });

        if (disposedRef.current || controller.signal.aborted) return;

        // Reconnect if: stream closed without a terminal event, OR server
        // marked the error as retryable.
        if (retryableFailure || !streamTerminated) {
          const delay = calculateBackoffDelay(reconnectAttemptRef.current, reconnectDelayMs);
          reconnectAttemptRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => void connect(), delay);
        }
      } catch (err) {
        if (disposedRef.current) return;
        if (
          (isAbortError(err) || controller.signal.aborted) &&
          controller.signal.reason !== 'stall'
        )
          return;

        // Transient network error → reconnect after delay
        const delay = calculateBackoffDelay(reconnectAttemptRef.current, reconnectDelayMs);
        reconnectAttemptRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => void connect(), delay);
      }
    };

    void connect();

    return () => {
      disposedRef.current = true;
      clearReconnectTimer();
      clearStallTimer();
      abortRef.current?.abort();
    };
    // retryVersion intentionally included to allow manual retry
  }, [url, enabled, retryVersion, storageKey, reconnectDelayMs, stallTimeoutMs]);

  // ── retry ─────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    const now = Date.now();
    if (now - lastRetryTimeRef.current < 1000) return;
    lastRetryTimeRef.current = now;
    if (storageKey) sessionStorage.removeItem(storageKey);
    lastEventIdRef.current = null;
    setRetryVersion((v) => v + 1);
  }, [storageKey]);

  // ── Derived values ────────────────────────────────────────────────────────
  const isProcessing =
    state.status === 'loading' || state.status === 'queued' || state.status === 'in_progress';

  // Expose data only once at least one section has arrived
  const data = Object.keys(state.data).length > 0 ? (state.data as TData) : null;

  return {
    data,
    status: state.status,
    error: state.error,
    isProcessing,
    retry,
  } as const;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenHeaders(headers: HeadersInit): Record<string, string> {
  const result: Record<string, string> = {};
  new Headers(headers).forEach((v, k) => {
    result[k] = v;
  });
  return result;
}
