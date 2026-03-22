'use client';

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

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { applyPatch } from 'fast-json-patch';
import type { Operation } from 'fast-json-patch';
import { isAbortError } from '@/api/apiService/utils';
import { useLatest } from './useLatest';

// ── Types ─────────────────────────────────────────────────────────────────

export type JsonPatchStreamStatus = 'loading' | 'queued' | 'in_progress' | 'completed' | 'failed';

type SnapshotPayload = {
  content: Record<string, unknown> | null;
  status: JsonPatchStreamStatus;
  code?: string;
  message?: string;
};

type PatchPayload = { ops: Operation[] };

type DonePayload = {
  status: JsonPatchStreamStatus;
  usedModel?: string;
};

type ErrorPayload = {
  code: string;
  message: string;
  retryable?: boolean;
};

export type StreamTelemetryEvent = {
  type:
    | 'connect'
    | 'reconnect'
    | 'snapshot_received'
    | 'patch_received'
    | 'done'
    | 'error'
    | 'stall_detected'
    | 'aborted';
  patchCount?: number;
  durationMs?: number;
  attemptNumber?: number;
  metadata?: Record<string, unknown>;
};

type StreamState<TData> = {
  data: Partial<TData>;
  status: JsonPatchStreamStatus;
  error: { code: string; message?: string } | null;
};

type StreamAction<TData> =
  | { type: 'SNAPSHOT'; data: Partial<TData>; status: JsonPatchStreamStatus }
  | { type: 'PATCH'; data: Partial<TData> }
  | { type: 'DONE'; status: JsonPatchStreamStatus }
  | { type: 'SET_STATUS'; status: JsonPatchStreamStatus }
  | { type: 'ERROR'; code: string; message?: string }
  | { type: 'RESET' };

function createReducer<TData>() {
  return function reducer(
    state: StreamState<TData>,
    action: StreamAction<TData>,
  ): StreamState<TData> {
    switch (action.type) {
      case 'RESET':
        return { data: {} as Partial<TData>, status: 'loading', error: null };
      case 'SNAPSHOT':
        return { data: (action.data ?? {}) as Partial<TData>, status: action.status, error: null };
      case 'PATCH':
        return { ...state, data: action.data };
      case 'DONE':
        return { ...state, status: action.status };
      case 'SET_STATUS':
        return { ...state, status: action.status };
      case 'ERROR':
        return {
          ...state,
          status: 'failed',
          error: { code: action.code, message: action.message },
        };
      default:
        return state;
    }
  };
}

// ── Options ───────────────────────────────────────────────────────────────

export type JsonPatchStreamInitialData<TData> = {
  status?: JsonPatchStreamStatus;
  data?: TData;
};

export type UseJsonPatchStreamOptions<TData> = {
  /**
   * Full URL to the SSE endpoint (e.g., `/api/jobs/123/result-stream`).
   * Set to null to suspend connecting.
   */
  url: string | null;
  /** Defer connecting until true (default: true). */
  enabled?: boolean;
  /** sessionStorage key for the lastEventId cursor — enables mid-stream reconnect. */
  storageKey?: string | null;
  /** Delay between automatic reconnects in ms (default: 5 000). */
  reconnectDelayMs?: number;
  /** Timeout for stall detection — if no event arrives in this time, reconnect (default: 30 000 ms). */
  stallTimeoutMs?: number;
  /**
   * Called at every (re)connect to build request headers.
   * Runs fresh each time so auth tokens are never stale.
   *
   * @example
   * buildHeaders: () => ({ Authorization: `Bearer ${useAuthStore.getState().accessToken}` })
   */
  buildHeaders?: () => HeadersInit;
  /**
   * Called at every (re)connect to build the request body.
   * Receives the current lastEventId (null on first connect or after retry()).
   * Defaults to `{}` or `{ lastEventId }` when storageKey is provided.
   */
  buildBody?: (lastEventId: string | null) => object;
  /**
   * Pre-populate state before the first connection.
   * If status === 'completed' AND data is present the hook skips connecting entirely.
   */
  initialData?: JsonPatchStreamInitialData<TData>;
  /**
   * Return true for error codes that should permanently stop reconnecting.
   * Codes like 'NOT_FOUND' or 'UNAUTHORIZED' are good candidates.
   * When omitted, only `retryable: false` from the server stops reconnecting.
   */
  isFatalError?: (code: string) => boolean;
  /**
   * Called when an `error` SSE event is received.
   * Use this to show a toast or log the error — the hook handles reconnect logic.
   */
  onError?: (payload: { code: string; message: string; retryable?: boolean }) => void;

  // ── Store adapter callbacks ─────────────────────────────────────────────
  // When provided, these are called alongside the internal dispatch so an
  // external Zustand store (or any other state manager) can stay in sync.
  // React 18 batches both updates into one render since they fire synchronously
  // inside the same `onmessage` call.

  /**
   * Called when a `snapshot` SSE event arrives.
   * Receives the full content (null when job is queued) and the current status.
   */
  onSnapshot?: (data: Partial<TData> | null, status: JsonPatchStreamStatus) => void;

  /**
   * Called when a `patch` SSE event arrives, with the raw RFC 6902 ops array.
   * Apply these to your external store (e.g., `store().applyPatches(ops)`).
   */
  onPatch?: (ops: Operation[]) => void;

  /**
   * Called when the `done` SSE event arrives — stream is complete.
   */
  onDone?: (status: JsonPatchStreamStatus, usedModel?: string) => void;

  /**
   * Called when a status-only transition occurs (e.g., first patch triggers
   * `in_progress` while data already exists in the external store).
   */
  onStatusChange?: (status: JsonPatchStreamStatus) => void;

  /**
   * Optional callback for structured telemetry on key stream lifecycle events.
   * Fires on: connect, reconnect, snapshot_received, patch_received, done, error, stall_detected, aborted.
   */
  onTelemetry?: (event: StreamTelemetryEvent) => void;
};

// ── Hook ──────────────────────────────────────────────────────────────────

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

  // ── Refs ────────────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const disposedRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionStartTimeRef = useRef<number | null>(null);
  const patchCountRef = useRef(0);
  const lastRetryTimeRef = useRef<number>(0);
  const dataRef = useRef(state.data);
  dataRef.current = state.data;

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

  // ── Helpers ─────────────────────────────────────────────────────────────
  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const calculateBackoffDelay = useCallback(
    (attempt: number): number => {
      const baseDelay = reconnectDelayMs;
      const maxDelay = 120_000; // 2 minutes max
      // Start from baseDelay and exponentially increase
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      // Jitter: random value from 0 to jitterMax (20% of base), but skip for first attempt
      const jitter = attempt > 0 ? Math.random() * (baseDelay * 0.2) : 0;
      return Math.min(exponentialDelay + jitter, maxDelay);
    },
    [reconnectDelayMs],
  );

  const resetStallTimer = useCallback(
    (controller: AbortController) => {
      clearStallTimer();
      stallTimerRef.current = setTimeout(() => {
        if (!disposedRef.current && !controller.signal.aborted) {
          console.warn('[useJsonPatchStream] Stall detected, aborting connection');
          const durationMs = connectionStartTimeRef.current
            ? Date.now() - connectionStartTimeRef.current
            : undefined;
          onTelemetryRef.current?.({
            type: 'stall_detected',
            durationMs,
            patchCount: patchCountRef.current,
          });
          controller.abort('stall');
        }
      }, stallTimeoutMs);
    },
    [stallTimeoutMs, clearStallTimer],
  );

  // ── Main connection effect ───────────────────────────────────────────────
  useEffect(() => {
    if (!url || !enabled) return;

    disposedRef.current = false;

    // Restore cursor for mid-stream reconnect
    lastEventIdRef.current = storageKey ? (sessionStorage.getItem(storageKey) ?? null) : null;

    // Initialise state from initialData
    const startData = initialDataRef.current;
    if (startData?.status && startData.data) {
      dispatch({
        type: 'SNAPSHOT',
        data: startData.data as Partial<TData>,
        status: startData.status,
      });
    } else if (startData?.status) {
      dispatch({ type: 'SET_STATUS', status: startData.status });
    } else {
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

    // ── connect ─────────────────────────────────────────────────────────
    const connect = async (): Promise<void> => {
      if (disposedRef.current) return;

      abortRef.current?.abort();
      clearReconnectTimer();
      clearStallTimer();

      const controller = new AbortController();
      abortRef.current = controller;
      connectionStartTimeRef.current = Date.now();
      patchCountRef.current = 0;

      const telemetryType = reconnectAttemptRef.current === 0 ? 'connect' : 'reconnect';
      onTelemetryRef.current?.({
        type: telemetryType,
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

            // ── snapshot ──────────────────────────────────────────────────
            if (ev.event === 'snapshot') {
              const payload = JSON.parse(ev.data) as SnapshotPayload;
              dispatch({
                type: 'SNAPSHOT',
                data: (payload.content ?? {}) as Partial<TData>,
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

            // ── patch ─────────────────────────────────────────────────────
            if (ev.event === 'patch') {
              const payload = JSON.parse(ev.data) as PatchPayload;
              patchCountRef.current += 1;

              try {
                const next = applyPatch(dataRef.current as object, payload.ops, false, false)
                  .newDocument as Partial<TData>;
                dataRef.current = next;
                dispatch({ type: 'PATCH', data: next });
              } catch (e) {
                console.error('[useJsonPatchStream] Invalid patch rejected:', e);
                const error = { code: 'INVALID_PATCH', message: String(e) };
                dispatch({ type: 'ERROR', ...error });
                onErrorRef.current?.({ ...error, retryable: false });
              }

              onPatchRef.current?.(payload.ops);
              onStatusChangeRef.current?.('in_progress');
              onTelemetryRef.current?.({
                type: 'patch_received',
                patchCount: patchCountRef.current,
              });
              return;
            }

            // ── done ──────────────────────────────────────────────────────
            if (ev.event === 'done') {
              // TODO: BE should send status && usedModel on 'done' event
              const payload = JSON.parse(ev.data) as DonePayload;
              streamTerminated = true;
              clearStallTimer();
              dispatch({ type: 'DONE', status: payload.status });
              onDoneRef.current?.(payload.status || 'completed', payload.usedModel);
              if (storageKey) sessionStorage.removeItem(storageKey);
              lastEventIdRef.current = null;
              const durationMs = connectionStartTimeRef.current
                ? Date.now() - connectionStartTimeRef.current
                : undefined;
              onTelemetryRef.current?.({
                type: 'done',
                durationMs,
                patchCount: patchCountRef.current,
                metadata: { status: payload.status, usedModel: payload.usedModel },
              });
              return;
            }

            // ── error ─────────────────────────────────────────────────────
            if (ev.event === 'error') {
              const payload = JSON.parse(ev.data) as ErrorPayload;
              dispatch({ type: 'ERROR', code: payload.code, message: payload.message });
              onErrorRef.current?.(payload);
              const durationMs = connectionStartTimeRef.current
                ? Date.now() - connectionStartTimeRef.current
                : undefined;
              onTelemetryRef.current?.({
                type: 'error',
                durationMs,
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
          const delay = calculateBackoffDelay(reconnectAttemptRef.current);
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
        const delay = calculateBackoffDelay(reconnectAttemptRef.current);
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
  }, [
    url,
    enabled,
    retryVersion,
    storageKey,
    reconnectDelayMs,
    stallTimeoutMs,
    clearReconnectTimer,
    clearStallTimer,
    calculateBackoffDelay,
    resetStallTimer,
  ]);

  // ── retry ──────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRetry = now - lastRetryTimeRef.current;
    const retryMinCooldownMs = 1000;

    if (timeSinceLastRetry < retryMinCooldownMs) {
      return;
    }

    lastRetryTimeRef.current = now;
    if (storageKey) sessionStorage.removeItem(storageKey);
    lastEventIdRef.current = null;
    setRetryVersion((v) => v + 1);
  }, [storageKey]);

  // ── Derived values ─────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────

const flattenHeaders = (headers: HeadersInit): Record<string, string> => {
  const result: Record<string, string> = {};
  new Headers(headers).forEach((v, k) => {
    result[k] = v;
  });
  return result;
};
