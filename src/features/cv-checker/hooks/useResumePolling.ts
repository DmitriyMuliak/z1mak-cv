import { useEffect, useMemo, useRef, useState } from 'react';
import { useServerActionPolling } from '@/hooks/useServerActionPolling';
import { AppError } from '@/types/server-actions';
import { getResumeResult, getResumeStatus, StatusResponse } from '@/actions/resume/resumeActions';
import { notRetryableErrors } from '../consts/resumeErrors';
import { AnalysisSchemaType } from '../schema/analysisSchema';
import { clientSafeAction } from '@/actions/utils/clientUtils';

interface UseResumePollingCallbacks {
  onFailure: (error: AppError) => void | Promise<void>;
  onSuccess?: (data: StatusResponse) => void | Promise<void>;
}

export const useResumePolling = (
  jobId: string | null,
  { onFailure, onSuccess: externalOnSuccess }: UseResumePollingCallbacks,
) => {
  const [isResumeFetching, setIsResumeFetching] = useState(false);
  const [report, setReport] = useState<AnalysisSchemaType | null>(null);
  const lastJobIdRef = useRef<string | null>(jobId);

  const onSuccess = async (response: StatusResponse) => {
    if (response.status !== 'completed') return;
    if (!jobId) return;

    setIsResumeFetching(true);
    const resumeResult = await clientSafeAction(getResumeResult(jobId));
    setIsResumeFetching(false);

    if (jobId !== lastJobIdRef.current) return;

    if (!resumeResult.success) {
      onFailure(resumeResult.error);
      return;
    }

    if (!resumeResult.data.data) {
      onFailure({ code: 'NOT_FOUND', message: 'Resume result is empty' } satisfies AppError);
      return;
    }

    setReport(resumeResult.data.data);
    externalOnSuccess?.(response);
  };

  const polling = useServerActionPolling<StatusResponse, AppError>({
    enabled: !!jobId,
    action: async () => {
      const result = await getResumeStatus(jobId!);
      return result;
    },
    validate: (res) => ({
      isComplete: res.status === 'completed',
      isFailed: res.status === 'failed',
    }),
    onSuccess,
    onFailure,
    shouldRetry: (error) => !notRetryableErrors.has(error.code),
    interval: 2000,
    maxAttempts: 3,
  });

  // auto-reset when jobId changes
  useEffect(() => {
    if (jobId && lastJobIdRef.current !== jobId) {
      lastJobIdRef.current = jobId;
      setReport(null);
      polling.reset();
    }
  }, [jobId, polling]);

  const status = useMemo(() => {
    if (isResumeFetching) return 'loading';
    if (polling.data?.status) return polling.data.status;
    if (polling.error) return 'failed';
    return 'loading';
  }, [polling.data?.status, polling.error, isResumeFetching]);

  return {
    report,
    status,
    error: polling.error,
    isProcessing: !!jobId && !polling.isFinished,
    retry: polling.reset,
  } as const;
};
