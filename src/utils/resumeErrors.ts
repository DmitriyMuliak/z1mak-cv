import { ApiError } from '@/api/apiService';
import { ResumeErrorCode, ResumeErrorResponse } from '@/actions/sendToAnalyze';

const RESUME_ERROR_KEY_MAP: Record<ResumeErrorCode, string> = {
  QUEUE_FULL: 'common.resumeErrors.queueFull',
  CONCURRENCY_LIMIT: 'common.resumeErrors.concurrencyLimit',
  USER_RPD_LIMIT: 'common.resumeErrors.userRpdLimit',
  MODEL_LIMIT: 'common.resumeErrors.modelLimit',
  NOT_FOUND: 'common.resumeErrors.notFound',
};

const DEFAULT_RESUME_ERROR_KEY = 'common.resumeErrors.unknown';

type TranslateFn = (key: string, values?: Record<string, unknown>) => string;

export const formatResumeErrorMessage = (
  translate: TranslateFn,
  code?: ResumeErrorCode,
  _serverMessage?: string,
) => {
  // if (serverMessage) {
  //   return serverMessage;
  // }

  return translate(RESUME_ERROR_KEY_MAP[code as ResumeErrorCode] || DEFAULT_RESUME_ERROR_KEY);
};

export const isResumeErrorResponse = (value: unknown): value is ResumeErrorResponse => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as { error: unknown }).error === 'string'
  );
};

export const extractResumeError = (
  error: unknown,
): { code?: ResumeErrorCode; message?: string } | null => {
  if (error instanceof ApiError && isResumeErrorResponse(error.body)) {
    return { code: error.body.error, message: error.body.message };
  }

  if (isResumeErrorResponse(error)) {
    return { code: error.error, message: error.message };
  }

  return null;
};
