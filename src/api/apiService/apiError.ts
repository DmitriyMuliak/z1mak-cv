import type { ApiInternalConfig } from './types';

export class ApiError<T = Record<string, unknown>> extends Error {
  public status: number;
  public body: T;
  public response?: ConsumedResponse;
  public config: ApiInternalConfig;
  public url: string;

  constructor(
    message: string,
    options: {
      status: number;
      body?: T;
      cause?: unknown;
      response?: Response;
      config: ApiInternalConfig;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.body = options.body || ({} as T);
    this.response = options.response as unknown as ConsumedResponse;
    this.config = options.config;
    this.url = options.config.url;

    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export function isApiError<T = ErrorBody>(error: unknown): error is ApiError<ErrorBody<T>> {
  return error instanceof ApiError;
}

export function isValidApiError<T = Record<string, unknown>>(
  error: unknown,
): error is ApiError<ValidErrorBody<T>> {
  return isApiError<T>(error) && !error.body.invalidFormat;
}

export function isInvalidApiError<T = Record<string, unknown>>(
  error: unknown,
): error is ApiError<InvalidErrorBody> {
  return isApiError<T>(error) && error.body.invalidFormat;
}

interface InvalidErrorBody {
  invalidFormat: true;
  message: string;
  raw?: string;
  data?: unknown;
}

type ValidErrorBody<T> = T & {
  invalidFormat: false;
};

export type ErrorBody<T = Record<string, unknown>> = ValidErrorBody<T> | InvalidErrorBody;

/**
 * A Response object where the body has already been read/consumed.
 * Attempts to read the body again (json, text, etc.) are removed from the type definition
 * to prevent runtime errors.
 */
export type ConsumedResponse = Omit<
  Response,
  'json' | 'text' | 'blob' | 'arrayBuffer' | 'bytes' | 'formData' | 'clone' | 'body' | 'bodyUsed'
> & {
  readonly bodyUsed: true;
};
