import { ApiError } from '@/api/apiService';
import { BodyLimitExceededError } from '@/api/apiService/readLimitedBody';
import { isAbortError } from '@/api/apiService/utils';
import { AppError, ServerActionResult } from '@/types/server-actions';
import { isObject } from '@/utils/isObject';

export const handleServerError = (error: unknown): ServerActionResult<never> => {
  const processedApiError = processApiError(error);
  if (processedApiError.isProcessed) {
    return processedApiError.result;
  }

  const processedAbort = processAbortError(error);
  if (processedAbort.isProcessed) {
    return processedAbort.result;
  }

  const processedBodyLimitExceeded = processBodyLimitExceededError(error);
  if (processedBodyLimitExceeded.isProcessed) {
    return processedBodyLimitExceeded.result;
  }

  const resultedError = new CriticalError('Critical Error', { cause: error });

  console.error(`[ServerAction] Critical Error: [${resultedError.id}]`, resultedError);

  return getClientCriticalError(resultedError.id);
};

const processApiError = (
  error: unknown,
): { isProcessed: true; result: { success: false; error: AppError } } | { isProcessed: false } => {
  if (error instanceof ApiError) {
    const errorBody = error.body as
      | { error?: string; message?: string; data?: unknown }
      | undefined;

    const appError: AppError = {
      httpStatus: error.status,
      code: errorBody?.error || 'UNKNOWN_ERROR',
      message: errorBody?.message || error.message,
      ...((isObject(errorBody?.data) ? { data: errorBody?.data } : {}) as Record<string, unknown>),
    };

    return { isProcessed: true, result: { success: false, error: appError } };
  }

  return { isProcessed: false };
};

const processAbortError = (
  error: unknown,
): { isProcessed: true; result: { success: false; error: AppError } } | { isProcessed: false } => {
  if (isAbortError(error)) {
    const appError: AppError = {
      httpStatus: 408,
      code: 'REQUEST_ABORTED',
      message: 'Request was cancelled.',
      data: { reason: 'server_abort' },
    };

    return { isProcessed: true, result: { success: false, error: appError } };
  }

  return { isProcessed: false };
};

const processBodyLimitExceededError = (
  error: unknown,
): { isProcessed: true; result: { success: false; error: AppError } } | { isProcessed: false } => {
  if (error instanceof BodyLimitExceededError) {
    const appError: AppError = {
      httpStatus: 502,
      code: 'RESPONSE_BODY_TOO_LARGE',
      message: 'Upstream error body exceeded safety limit.',
      data: { limitBytes: error.limitBytes, reason: 'body_limit_exceeded' },
    };

    return { isProcessed: true, result: { success: false, error: appError } };
  }

  return { isProcessed: false };
};

const getClientCriticalError = (errorId?: string): ServerActionResult<never> => {
  return {
    success: false as const,
    error: {
      httpStatus: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong on the server side',
      ...(errorId ? { data: { errorId } } : {}),
    } satisfies AppError,
  };
};

class CriticalError extends Error {
  public id: string;
  public timestamp: string;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CriticalError';
    this.id = crypto.randomUUID();
    this.timestamp = new Date().toISOString();
  }
}
