'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { jsonrepair } from 'jsonrepair';
import { isAbortError } from '@/api/apiService/utils';
import type { RelativePath } from '@/api/apiService/types';
import { apiService } from '@/api/client';
import { ResumeErrorCode, StatusResponse } from '@/actions/resume/resumeActions';
import { AppError } from '@/types/server-actions';
import { AnalysisSchemaType } from '../schema/analysisSchema';
import { DEFAULT_RESUME_ERROR_KEY, RESUME_ERROR_KEY_MAP } from '../consts/resumeErrors';

type StreamInitialData = {
  status?: StatusResponse;
  report?: AnalysisSchemaType;
};

type StreamRequestPayload = {
  lastEventId?: string;
};

type SnapshotPayload = {
  content?: AnalysisSchemaType | string;
  status?: 'queued' | 'processing' | StatusResponse['status'];
};

type WrappedSnapshotPayload = {
  success?: boolean;
  data?: {
    status?: 'queued' | 'processing' | StatusResponse['status'];
    content?: string;
    data?: AnalysisSchemaType | string | null;
  };
};

type ChunkPayload = {
  content?: string;
};

type ErrorPayload = {
  code?: string;
  message?: string;
};

type SseEvent = {
  id?: string;
  event: string;
  data: string;
};

const STREAM_ERROR_TOAST_ID = 'resume-stream-error-toast';
const STREAM_RECONNECT_DELAY_MS = 5000;
const FINAL_STATUSES = new Set<StatusResponse['status']>(['completed', 'failed']);
const LOG_PREFIX = '[useResumeStreaming]';

const getLastEventStorageKey = (jobId: string) => `resume-stream-last-id-${jobId}`;

const isResumeErrorCode = (value: string): value is ResumeErrorCode =>
  value in RESUME_ERROR_KEY_MAP;

const normalizeSnapshotStatus = (
  status?: SnapshotPayload['status'],
): StatusResponse['status'] | null => {
  if (!status) {
    return null;
  }

  if (status === 'processing') {
    return 'in_progress';
  }

  if (
    status === 'queued' ||
    status === 'in_progress' ||
    status === 'completed' ||
    status === 'failed'
  ) {
    return status;
  }

  return null;
};

const parseSseEventBlock = (block: string): SseEvent | null => {
  const lines = block.split('\n');
  let event = 'message';
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line) {
      continue;
    }

    // Some backends send payload as comment-prefixed lines (e.g. :{...}).
    // Treat comment JSON as message data instead of dropping it.
    if (line.startsWith(':')) {
      const maybeJson = line.slice(1).trimStart();
      if (maybeJson.startsWith('{') || maybeJson.startsWith('[')) {
        dataLines.push(maybeJson);
      }
      continue;
    }

    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim();
      continue;
    }

    if (line.startsWith('id:')) {
      id = line.slice('id:'.length).trim();
      continue;
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
      continue;
    }

    // Also support raw JSON lines without SSE field prefixes.
    if (line.startsWith('{') || line.startsWith('[')) {
      dataLines.push(line);
    }
  }

  if (!id && dataLines.length === 0 && event === 'message') {
    const rawBlock = block.trim();
    const normalizedRaw = rawBlock.startsWith(':') ? rawBlock.slice(1).trimStart() : rawBlock;
    const isJsonLike = normalizedRaw.startsWith('{') || normalizedRaw.startsWith('[');

    if (!isJsonLike) {
      return null;
    }

    return {
      id,
      event: 'message',
      data: normalizedRaw,
    };
  }

  return {
    id,
    event,
    data: dataLines.join('\n'),
  };
};

const consumeSseStream = async (
  response: Response,
  signal: AbortSignal,
  onEvent: (event: SseEvent) => void,
) => {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    if (signal.aborted) {
      return;
    }

    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const parsedEvent = parseSseEventBlock(block);
      if (parsedEvent) {
        onEvent(parsedEvent);
      }
    }
  }

  if (buffer.trim()) {
    const parsedEvent = parseSseEventBlock(buffer);
    if (parsedEvent) {
      onEvent(parsedEvent);
    }
  }
};

const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isAnalysisLikeObject = (value: unknown): value is AnalysisSchemaType => {
  return isPlainObject(value);
};

const getErrorCodeFromUnknown = (error: unknown): ResumeErrorCode | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const body = (error as { body?: unknown }).body;
  if (!body || typeof body !== 'object') {
    return null;
  }

  const code =
    (body as { code?: unknown; error?: unknown }).code ??
    (body as { code?: unknown; error?: unknown }).error;

  return typeof code === 'string' && isResumeErrorCode(code) ? code : null;
};

const getErrorMessageFromUnknown = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Streaming connection failed';
};

export const useResumeStreaming = (
  jobId: string | null,
  initialData?: StreamInitialData,
  enabled = true,
) => {
  const [report, setReport] = useState<AnalysisSchemaType | null>(initialData?.report ?? null);
  const [status, setStatus] = useState<StatusResponse['status'] | 'loading'>(
    initialData?.status?.status ?? 'loading',
  );
  const [error, setError] = useState<AppError | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const tError = useTranslations('common.resumeErrors');
  const tErrorRef = useRef(tError);
  const initialDataRef = useRef<StreamInitialData | undefined>(initialData);

  const fullAiResponseRef = useRef('');
  const lastEventIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<StatusResponse['status'] | 'loading'>(
    initialData?.status?.status ?? 'loading',
  );

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const setStatusWithRef = useCallback((nextStatus: StatusResponse['status'] | 'loading') => {
    console.log(`${LOG_PREFIX} status ->`, nextStatus);
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const updateReportFromRaw = useCallback((rawContent: string) => {
    if (!rawContent || typeof rawContent !== 'string') {
      console.log(`${LOG_PREFIX} updateReportFromRaw skipped: empty rawContent`);
      return;
    }

    try {
      const repairedJson = jsonrepair(rawContent);
      const parsed = JSON.parse(repairedJson) as AnalysisSchemaType;
      console.log(`${LOG_PREFIX} parsed report from raw`, {
        rawLength: rawContent.length,
        topKeys: Object.keys(parsed ?? {}),
      });
      setReport(parsed);
    } catch (error) {
      console.log(`${LOG_PREFIX} failed to parse partial raw`, {
        rawLength: rawContent.length,
        error,
      });
      // Ignore partial/incomplete JSON parse errors while stream is in progress.
    }
  }, []);

  useEffect(() => {
    tErrorRef.current = tError;
  }, [tError]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  useEffect(() => {
    if (!jobId || !enabled) {
      return;
    }

    let disposed = false;
    const storageKey = getLastEventStorageKey(jobId);

    const restoreLastEventId = () => {
      const storedId = sessionStorage.getItem(storageKey);
      lastEventIdRef.current = storedId || null;
    };

    const persistLastEventId = (id: string) => {
      sessionStorage.setItem(storageKey, id);
      lastEventIdRef.current = id;
    };

    const handleTerminalError = (errorCode: ResumeErrorCode, message?: string) => {
      console.log(`${LOG_PREFIX} terminal error`, { errorCode, message });
      toast.error(tErrorRef.current(RESUME_ERROR_KEY_MAP[errorCode] || DEFAULT_RESUME_ERROR_KEY), {
        id: STREAM_ERROR_TOAST_ID,
      });
      setError({ code: errorCode, message });
      setStatusWithRef('failed');
    };

    const handleSnapshotLikeData = (rawData: string): boolean => {
      console.log(`${LOG_PREFIX} handleSnapshotLikeData`, {
        preview: rawData.slice(0, 300),
        length: rawData.length,
      });
      const snapshot = safeJsonParse<SnapshotPayload>(rawData);

      if (snapshot && (snapshot.content !== undefined || snapshot.status !== undefined)) {
        console.log(`${LOG_PREFIX} matched snapshot payload`, {
          hasContent: snapshot.content !== undefined,
          status: snapshot.status,
          contentType: typeof snapshot.content,
          contentLength: typeof snapshot.content === 'string' ? snapshot.content.length : 0,
        });
        if (typeof snapshot.content === 'string') {
          fullAiResponseRef.current = snapshot.content;
          updateReportFromRaw(fullAiResponseRef.current);
        } else if (isAnalysisLikeObject(snapshot.content)) {
          console.log(`${LOG_PREFIX} setReport from snapshot.content object`, {
            keys: Object.keys(snapshot.content),
          });
          setReport(snapshot.content);
        }

        const normalized = normalizeSnapshotStatus(snapshot.status);
        if (normalized) {
          setStatusWithRef(normalized);
        }

        return true;
      }

      const wrapped = safeJsonParse<WrappedSnapshotPayload>(rawData);
      if (!wrapped?.data) {
        console.log(`${LOG_PREFIX} snapshot parse miss: no wrapped.data`);
        return false;
      }

      console.log(`${LOG_PREFIX} matched wrapped payload`, {
        status: wrapped.data.status,
        contentType: typeof wrapped.data.content,
        dataType: typeof wrapped.data.data,
      });

      if (typeof wrapped.data.content === 'string') {
        fullAiResponseRef.current = wrapped.data.content;
        updateReportFromRaw(fullAiResponseRef.current);
      } else if (typeof wrapped.data.data === 'string') {
        fullAiResponseRef.current = wrapped.data.data;
        updateReportFromRaw(fullAiResponseRef.current);
      } else if (isPlainObject(wrapped.data.data)) {
        console.log(`${LOG_PREFIX} setReport from wrapped.data.data object`, {
          keys: Object.keys(wrapped.data.data),
        });
        setReport(wrapped.data.data as AnalysisSchemaType);
      }

      const wrappedStatus = normalizeSnapshotStatus(wrapped.data.status);
      if (wrappedStatus) {
        setStatusWithRef(wrappedStatus);
      }

      return true;
    };

    const connect = async (): Promise<void> => {
      if (disposed || !jobId) {
        return;
      }

      console.log(`${LOG_PREFIX} connect start`, { jobId, retryVersion });
      abortControllerRef.current?.abort();
      clearReconnectTimer();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const streamPath = `/resume/${encodeURIComponent(jobId)}/result-stream` as RelativePath;
        const payload: StreamRequestPayload = {
          ...(lastEventIdRef.current ? { lastEventId: lastEventIdRef.current } : {}),
        };

        const response = await apiService.post<Response, StreamRequestPayload>(
          streamPath,
          payload,
          {
            responseAs: 'response',
            signal: controller.signal,
            headers: {
              Accept: 'text/event-stream',
            },
          },
        );
        console.log(`${LOG_PREFIX} stream response`, {
          status: response.status,
          contentType: response.headers.get('content-type'),
        });

        await consumeSseStream(response, controller.signal, (event) => {
          if (disposed) {
            return;
          }

          console.log(`${LOG_PREFIX} event`, {
            event: event.event,
            id: event.id,
            dataPreview: event.data.slice(0, 300),
            dataLength: event.data.length,
          });

          if (event.id) {
            persistLastEventId(event.id);
          }

          if (event.event === 'snapshot') {
            handleSnapshotLikeData(event.data);
            return;
          }

          if (event.event === 'message') {
            handleSnapshotLikeData(event.data);
            return;
          }

          if (event.event === 'chunk') {
            const chunk = safeJsonParse<ChunkPayload>(event.data);
            if (chunk?.content) {
              fullAiResponseRef.current += chunk.content;
              updateReportFromRaw(fullAiResponseRef.current);
            }

            if (!FINAL_STATUSES.has(statusRef.current as StatusResponse['status'])) {
              setStatusWithRef('in_progress');
            }

            return;
          }

          if (event.event === 'done') {
            updateReportFromRaw(fullAiResponseRef.current);
            setStatusWithRef('completed');
            return;
          }

          if (event.event === 'error') {
            const errorPayload = safeJsonParse<ErrorPayload>(event.data);
            const errorCode =
              errorPayload?.code && isResumeErrorCode(errorPayload.code)
                ? errorPayload.code
                : 'PROVIDER_ERROR';
            handleTerminalError(errorCode, errorPayload?.message);
          }
        });

        if (disposed || controller.signal.aborted) {
          console.log(`${LOG_PREFIX} stream end: disposed/aborted`);
          return;
        }

        if (!FINAL_STATUSES.has(statusRef.current as StatusResponse['status'])) {
          console.log(`${LOG_PREFIX} schedule reconnect after normal close`, {
            currentStatus: statusRef.current,
            delayMs: STREAM_RECONNECT_DELAY_MS,
          });
          reconnectTimerRef.current = setTimeout(() => {
            void connect();
          }, STREAM_RECONNECT_DELAY_MS);
        }
      } catch (streamError) {
        if (disposed || isAbortError(streamError) || controller.signal.aborted) {
          console.log(`${LOG_PREFIX} stream aborted/disposed`, { streamError });
          return;
        }

        const errorCode = getErrorCodeFromUnknown(streamError);
        if (errorCode) {
          handleTerminalError(errorCode, getErrorMessageFromUnknown(streamError));
          return;
        }

        console.log(`${LOG_PREFIX} stream error: reconnect scheduled`, {
          streamError,
          delayMs: STREAM_RECONNECT_DELAY_MS,
        });
        reconnectTimerRef.current = setTimeout(() => {
          void connect();
        }, STREAM_RECONNECT_DELAY_MS);
      }
    };

    const startData = initialDataRef.current;
    console.log(`${LOG_PREFIX} init`, {
      jobId,
      enabled,
      startStatus: startData?.status?.status ?? 'loading',
      hasInitialReport: !!startData?.report,
    });
    setError(null);
    setReport(startData?.report ?? null);
    setStatusWithRef(startData?.status?.status ?? 'loading');
    fullAiResponseRef.current = '';
    restoreLastEventId();

    if (startData?.status?.status === 'completed' && startData.report) {
      return () => {
        disposed = true;
        clearReconnectTimer();
        abortControllerRef.current?.abort();
      };
    }

    void connect();

    return () => {
      disposed = true;
      clearReconnectTimer();
      abortControllerRef.current?.abort();
    };
  }, [enabled, jobId, retryVersion, setStatusWithRef, updateReportFromRaw]);

  const retry = useCallback(() => {
    if (!jobId) {
      return;
    }

    sessionStorage.removeItem(getLastEventStorageKey(jobId));
    lastEventIdRef.current = null;
    fullAiResponseRef.current = '';
    setError(null);
    setReport(null);
    setStatusWithRef('loading');
    setRetryVersion((value) => value + 1);
  }, [jobId, setStatusWithRef]);

  const isProcessing = status === 'loading' || status === 'queued' || status === 'in_progress';

  return {
    report,
    status,
    error,
    isProcessing,
    retry,
  };
};
