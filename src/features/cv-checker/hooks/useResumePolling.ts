import { useEffect, useMemo, useRef } from 'react';
import { useServerActionPolling } from '@/hooks/useServerActionPolling';
import { AppError, ServerActionResult } from '@/types/server-actions';
import {
  getResumeResult,
  getResumeStatus,
  ResultResponse,
  StatusResponse,
} from '@/actions/resume/resumeActions';

export const useResumePolling = (
  jobId: string | null,
  onSuccess: (data: ServerActionResult<ResultResponse>) => void,
) => {
  const lastJobIdRef = useRef<string | null>(null);

  const polling = useServerActionPolling<StatusResponse, AppError>({
    enabled: !!jobId,
    action: () => getResumeStatus(jobId!),
    validate: (res) => ({
      isComplete: res.status === 'completed',
      isFailed: res.status === 'failed',
    }),
    interval: 2000,
    maxAttempts: 3,
  });

  // auto-reset when jobId changes
  useEffect(() => {
    if (jobId && lastJobIdRef.current !== jobId) {
      lastJobIdRef.current = jobId;
      polling.reset();
    }
  }, [jobId, polling]);

  useEffect(() => {
    if (!jobId) return;
    if (!polling.isFinished) return;
    if (polling.data?.status !== 'completed') return;

    (async () => {
      const result = await getResumeResult(jobId);
      onSuccess(result);
    })();
  }, [jobId, polling.isFinished, polling.data?.status, onSuccess]);

  const status = useMemo(() => {
    if (polling.data?.status) return polling.data.status;
    if (polling.error) return 'failed';
    return 'loading';
  }, [polling.data?.status, polling.error]);

  return {
    status,
    error: polling.error,
    isProcessing: !!jobId && !polling.isFinished,
    retry: polling.reset,
  } as const;
};
