import type { Operation } from 'fast-json-patch';

// ── Protocol ──────────────────────────────────────────────────────────────

export type JsonPatchStreamStatus = 'loading' | 'queued' | 'in_progress' | 'completed' | 'failed';

export type SnapshotPayload = {
  content: Record<string, unknown> | null;
  status: JsonPatchStreamStatus;
  code?: string;
  message?: string;
};

export type PatchPayload = { ops: Operation[] };

export type DonePayload = {
  status: JsonPatchStreamStatus;
  usedModel?: string;
};

export type ErrorPayload = {
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

// ── State ─────────────────────────────────────────────────────────────────

export type StreamState<TData> = {
  data: Partial<TData>;
  status: JsonPatchStreamStatus;
  error: { code: string; message?: string } | null;
};

export type StreamAction<TData> =
  | { type: 'SNAPSHOT'; data: Partial<TData>; status: JsonPatchStreamStatus }
  | { type: 'PATCH'; data: Partial<TData> }
  | { type: 'DONE'; status: JsonPatchStreamStatus }
  | { type: 'SET_STATUS'; status: JsonPatchStreamStatus }
  | { type: 'ERROR'; code: string; message?: string }
  | { type: 'RESET' };

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
