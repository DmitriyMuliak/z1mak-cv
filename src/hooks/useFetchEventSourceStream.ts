'use client';

import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbortError } from '@/api/apiService/utils';

export type StreamErrorAction = 'reconnect' | 'fatal' | 'ignore';

type BuildRequestBodyFn = (lastEventId: string | null) => BodyInit | object | null | undefined;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  openWhenHidden?: boolean;
};

type UseFetchEventSourceStreamOptions = {
  enabled?: boolean;
  streamUrl: string | null;
  storageKey?: string | null;
  reconnectDelayMs?: number;
  request?: RequestOptions;
  buildRequestBody?: BuildRequestBodyFn;
  shouldReconnect?: () => boolean;
  onOpen?: (response: Response) => void | Promise<void>;
  onMessage: (message: EventSourceMessage) => void | Promise<void>;
  onClose?: () => void | Promise<void>;
  onError?: (error: unknown) => StreamErrorAction | Promise<StreamErrorAction>;
};

const DEFAULT_RECONNECT_DELAY_MS = 5000;

const toBodyInit = (value: BodyInit | object | null | undefined): BodyInit | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string' || value instanceof URLSearchParams || value instanceof FormData) {
    return value;
  }

  if (value instanceof Blob || value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return value as unknown as BodyInit;
  }

  return JSON.stringify(value);
};

const toHeadersRecord = (headers?: HeadersInit): Record<string, string> | undefined => {
  if (!headers) {
    return undefined;
  }

  const normalized = new Headers(headers);
  const record: Record<string, string> = {};
  normalized.forEach((value, key) => {
    record[key] = value;
  });
  return record;
};

export const useFetchEventSourceStream = ({
  enabled = true,
  streamUrl,
  storageKey,
  reconnectDelayMs = DEFAULT_RECONNECT_DELAY_MS,
  request,
  buildRequestBody,
  shouldReconnect,
  onOpen,
  onMessage,
  onClose,
  onError,
}: UseFetchEventSourceStreamOptions) => {
  const [retryVersion, setRetryVersion] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef<string | null>(null);

  const requestRef = useRef<RequestOptions | undefined>(request);
  const buildRequestBodyRef = useRef<BuildRequestBodyFn | undefined>(buildRequestBody);
  const shouldReconnectRef = useRef<(() => boolean) | undefined>(shouldReconnect);
  const onOpenRef = useRef(onOpen);
  const onMessageRef = useRef(onMessage);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  useEffect(() => {
    buildRequestBodyRef.current = buildRequestBody;
  }, [buildRequestBody]);

  useEffect(() => {
    shouldReconnectRef.current = shouldReconnect;
  }, [shouldReconnect]);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    clearReconnectTimer();
  }, []);

  const retry = useCallback(() => {
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }
    lastEventIdRef.current = null;
    setRetryVersion((value) => value + 1);
  }, [storageKey]);

  useEffect(() => {
    if (!enabled || !streamUrl) {
      return;
    }

    let disposed = false;

    const restoreLastEventId = () => {
      if (!storageKey) {
        lastEventIdRef.current = null;
        return;
      }
      const storedId = sessionStorage.getItem(storageKey);
      lastEventIdRef.current = storedId || null;
    };

    const persistLastEventId = (id: string) => {
      if (storageKey) {
        sessionStorage.setItem(storageKey, id);
      }
      lastEventIdRef.current = id;
    };

    const canReconnect = () => {
      if (disposed) {
        return false;
      }
      if (!shouldReconnectRef.current) {
        return true;
      }
      return shouldReconnectRef.current();
    };

    const scheduleReconnect = () => {
      if (!canReconnect()) {
        return;
      }
      reconnectTimerRef.current = setTimeout(() => {
        void connect();
      }, reconnectDelayMs);
    };

    const connect = async (): Promise<void> => {
      if (disposed) {
        return;
      }

      abortControllerRef.current?.abort();
      clearReconnectTimer();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const requestBody = buildRequestBodyRef.current
          ? buildRequestBodyRef.current(lastEventIdRef.current)
          : undefined;

        await fetchEventSource(streamUrl, {
          method: requestRef.current?.method ?? 'GET',
          headers: toHeadersRecord(requestRef.current?.headers),
          openWhenHidden: requestRef.current?.openWhenHidden ?? true,
          body: toBodyInit(requestBody),
          signal: controller.signal,

          async onopen(response) {
            if (onOpenRef.current) {
              await onOpenRef.current(response);
            }
          },

          async onmessage(message) {
            if (message.id) {
              persistLastEventId(message.id);
            }
            await onMessageRef.current(message);
          },

          async onclose() {
            if (onCloseRef.current) {
              await onCloseRef.current();
            }
          },

          onerror(error) {
            throw error;
          },
        });

        if (disposed || controller.signal.aborted) {
          return;
        }

        scheduleReconnect();
      } catch (error) {
        if (disposed || controller.signal.aborted || isAbortError(error)) {
          return;
        }

        const action = onErrorRef.current ? await onErrorRef.current(error) : 'reconnect';

        if (action === 'fatal' || action === 'ignore') {
          return;
        }

        scheduleReconnect();
      }
    };

    restoreLastEventId();
    void connect();

    return () => {
      disposed = true;
      abortControllerRef.current?.abort();
      clearReconnectTimer();
    };
  }, [enabled, reconnectDelayMs, retryVersion, storageKey, streamUrl]);

  return {
    retry,
    stop,
  };
};
