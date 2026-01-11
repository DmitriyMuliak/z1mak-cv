import { useEffect, useMemo, useRef } from 'react';
import { usePolling } from '@/hooks/usePolling';
import {
  getResumeResult,
  getResumeStatus,
  ResultResponse,
  StatusResponse,
} from '@/actions/resume/resumeActions';
import {
  ServerActionResultSuccess,
  ServerActionResultFailure,
  AppError,
} from '@/types/server-actions';

type Options = {
  onSuccess: (data: ServerActionResultSuccess<ResultResponse>) => void;
  onFailure?: (data: ServerActionResultFailure<AppError>) => void;
  onPollingFailure?: (data: ServerActionResultFailure<AppError>) => void;
};

export const useResumePolling = (
  jobId: string | null,
  { onSuccess, onFailure, onPollingFailure }: Options,
) => {
  const requestIdRef = useRef(0);

  const { data, error, isFinished, reset } = usePolling<StatusResponse, AppError>({
    enabled: !!jobId,
    fn: async () => {
      const result = await getResumeStatus(jobId!);

      // throw err to usePolling
      if (!result.success) {
        onPollingFailure && onPollingFailure(result);
        throw result.error;
      }
      return result.data;
    },
    validate: (res) => ({
      isComplete: res.status === 'completed',
      isFailed: res.status === 'failed',
    }),
  });

  useEffect(() => {
    if (!(isFinished && data?.status === 'completed' && jobId)) return;

    const requestId = ++requestIdRef.current;

    (async () => {
      const result = await getResumeResult(jobId);

      if (requestId !== requestIdRef.current) return;

      if (!result.success) onFailure?.(result);
      else onSuccess(result);
    })();
  }, [isFinished, data?.status, jobId, onSuccess, onFailure]);

  const status = useMemo(() => {
    if (data?.status) return data.status;
    if (error) return 'failed';
    return 'loading';
  }, [data?.status, error]);

  return {
    status,
    error,
    isProcessing: !isFinished && !!jobId,
    retry: reset,
  } as const;
};
