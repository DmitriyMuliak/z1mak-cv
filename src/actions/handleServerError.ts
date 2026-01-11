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

const getCriticalError = () => {
  return {
    success: false as const,
    error: {
      httpStatus: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong on the server side',
    },
  };
};

export const handleServerError = (error: unknown): ServerActionResult<never> => {
  const processed = processApiError(error);
  if (processed.isProcessed) {
    return processed.result;
  }

  console.error('[ServerAction] Critical Error:', error);
  // TODO: investigate mb better throw error for error.tsx view
  return getCriticalError();
};
