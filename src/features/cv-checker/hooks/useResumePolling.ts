'use client';

import { useCallback, useEffect, useMemo, useRef, RefObject } from 'react';
import { FetchStatus, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { AppError } from '@/types/server-actions';
import {
  getResumeResult,
  getResumeStatus,
  ResumeErrorCode,
  StatusResponse,
} from '@/actions/resume/resumeActions';
import {
  DEFAULT_RESUME_ERROR_KEY,
  RESUME_ERROR_KEY_MAP,
  notRetryableErrors,
} from '../consts/resumeErrors';
import { AnalysisSchemaType } from '../schema/analysisSchema';
import { clientSafeAction } from '@/actions/utils/clientUtils';

const toastId = 'resume-error-toast';

export const useResumePolling = (jobId: string | null) => {
  const queryClient = useQueryClient();
  const statusQueryKey = ['resume:status', jobId] as const;
  const resultQueryKey = ['resume:result', jobId] as const;
  const tError = useTranslations('common.resumeErrors');
  const lastStatusErrorRef = useRef<string | null>(null);
  const lastResultErrorRef = useRef<string | null>(null);

  const onFailure = useCallback(
    (error: AppError) => {
      toast.error(
        tError(RESUME_ERROR_KEY_MAP[error.code as ResumeErrorCode] || DEFAULT_RESUME_ERROR_KEY),
        {
          id: toastId,
          duration: 4000,
        },
      );
    },
    [tError],
  );

  const processError = useCallback(
    (
      error: AppError | null | undefined,
      fetchStatus: FetchStatus,
      ref: RefObject<string | null>,
    ) => {
      if (!error || fetchStatus !== 'idle') return;
      const signature = `${error.code}:${error.message ?? ''}`;
      if (ref.current === signature) return;
      ref.current = signature;
      onFailure(error);
    },
    [onFailure],
  );

  useEffect(() => {
    lastStatusErrorRef.current = null;
    lastResultErrorRef.current = null;
  }, [jobId]);

  const statusQuery = useQuery<StatusResponse, AppError>({
    queryKey: statusQueryKey,
    enabled: !!jobId,
    queryFn: async () => {
      const result = await clientSafeAction(getResumeStatus(jobId!));
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (!status) return 2000;
      if (status === 'completed' || status === 'failed') return false;

      return 2000;
    },
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => !notRetryableErrors.has(error.code) && failureCount < 3,
    retryDelay: 2000,
  });

  const resultQuery = useQuery<AnalysisSchemaType, AppError>({
    queryKey: resultQueryKey,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!jobId && statusQuery.data?.status === 'completed',
    queryFn: async () => {
      const resumeResult = await clientSafeAction(getResumeResult(jobId!));

      if (!resumeResult.success) {
        throw resumeResult.error;
      }

      if (!resumeResult.data.data) {
        throw { code: 'NOT_FOUND', message: 'Resume result is empty' } satisfies AppError;
      }

      return resumeResult.data.data;
    },
    retry: (failureCount) => failureCount < 3,
  });

  useEffect(() => {
    processError(statusQuery.error, statusQuery.fetchStatus, lastStatusErrorRef);
    processError(resultQuery.error, resultQuery.fetchStatus, lastResultErrorRef);
  }, [
    processError,
    statusQuery.error,
    statusQuery.fetchStatus,
    resultQuery.error,
    resultQuery.fetchStatus,
  ]);

  const hasFinalStatusError = !!statusQuery.error && statusQuery.fetchStatus === 'idle';
  const finalStatusError = hasFinalStatusError ? statusQuery.error : null;

  const status = useMemo(() => {
    if (resultQuery.isFetching) return 'loading';
    if (statusQuery.data?.status) return statusQuery.data.status;
    if (hasFinalStatusError) return 'failed';
    return 'loading';
  }, [resultQuery.isFetching, statusQuery.data?.status, hasFinalStatusError]);

  const retry = () => {
    queryClient.resetQueries({ queryKey: statusQueryKey, exact: true });
    queryClient.resetQueries({ queryKey: resultQueryKey, exact: true });
  };

  return {
    report: resultQuery.data ?? null,
    status,
    error: finalStatusError,
    isProcessing:
      !!jobId &&
      statusQuery.data?.status !== 'completed' &&
      statusQuery.data?.status !== 'failed' &&
      !hasFinalStatusError,
    retry,
  } as const;
};
