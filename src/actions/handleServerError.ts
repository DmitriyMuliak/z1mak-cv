import { ApiError } from '@/api/apiService';
import { AppError, ServerActionResult } from '@/types/server-actions';
import { isObject } from '@/utils/isObject';

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

export const handleServerError = (error: unknown): ServerActionResult<never> => {
  const processed = processApiError(error);
  if (processed.isProcessed) {
    return processed.result;
  }

  const resultedError = new CriticalError('Critical Error', { cause: error });

  console.error(`[ServerAction] Critical Error: [${resultedError.id}]`, resultedError);

  return getClientCriticalError(resultedError.id);
};

const getClientCriticalError = (errorId?: string) => {
  return {
    success: false as const,
    error: {
      httpStatus: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong on the server side',
      ...(errorId ? { data: { errorId } } : {}),
    },
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
