import { ResumeErrorCode } from '@/actions/resume/resumeActions';
import type { MessagesBase, NamespacedRelativeMessageKeys } from '@/types/translations';

type ResumeErrorI18nKeys = NamespacedRelativeMessageKeys<MessagesBase, 'common.resumeErrors'>;

export const RESUME_ERROR_KEY_MAP = {
  QUEUE_FULL: 'queueFull',
  CONCURRENCY_LIMIT: 'concurrencyLimit',
  'USER_RPD_LIMIT:lite': 'userRpdLimit:lite',
  'USER_RPD_LIMIT:hard': 'userRpdLimit:hard',
  MODEL_LIMIT: 'modelLimit',
  NOT_FOUND: 'notFound',
  PROVIDER_ERROR: 'unknown',
} as const satisfies Record<
  ResumeErrorCode,
  NamespacedRelativeMessageKeys<MessagesBase, 'common.resumeErrors'>
>;

export const RESUME_ERROR_CODES = {
  QUEUE_FULL: 'QUEUE_FULL',
  CONCURRENCY_LIMIT: 'CONCURRENCY_LIMIT',
  'USER_RPD_LIMIT:lite': 'USER_RPD_LIMIT:lite',
  'USER_RPD_LIMIT:hard': 'USER_RPD_LIMIT:hard',
  MODEL_LIMIT: 'MODEL_LIMIT',
  NOT_FOUND: 'NOT_FOUND',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
} as const satisfies Record<
  ResumeErrorCode extends string ? ResumeErrorCode : never,
  ResumeErrorCode
>;

export const notRetryableErrors = new Set([
  'QUEUE_FULL',
  'CONCURRENCY_LIMIT',
  'USER_RPD_LIMIT:lite',
  'USER_RPD_LIMIT:hard',
  'MODEL_LIMIT',
  'NOT_FOUND',
  'PROVIDER_ERROR',
]);

export const DEFAULT_RESUME_ERROR_KEY: ResumeErrorI18nKeys = 'unknown';
