import { useEffect } from 'react';
import { usePolling } from '@/hooks/usePolling';
import {
  getResumeResult,
  getResumeStatus,
  ResultResponse,
  StatusResponse,
} from '@/actions/sendToAnalyze';
import { extractResumeError } from '@/utils/resumeErrors';

export const useResumePolling = (
  jobId: string | null,
  onSuccess: (data: NonNullable<ResultResponse['data']>) => void,
) => {
  const { data, error, isFinished, reset } = usePolling({
    enabled: !!jobId,
    fn: () => getResumeStatus(jobId!),
    validate: validateStatus,
    interval: 2000,
    maxErrorRetries: 3,
  });

  useEffect(() => {
    let isMounted = true;

    if (isFinished && data?.status === 'completed' && jobId) {
      const fetchResult = async () => {
        try {
          const result = await getResumeResult(jobId);
          if (result.data && isMounted) {
            onSuccess(result.data);
          }
        } catch (err) {
          console.error('Failed to fetch resume result:', err);
        }
      };

      fetchResult();
    }

    return () => {
      isMounted = false;
    };
  }, [isFinished, data?.status, jobId, onSuccess]);

  const normalizedStatus = (data?.status || (error ? 'failed' : 'loading')) as
    | StatusResponse['status']
    | 'loading';

  return {
    status: normalizedStatus,
    error,
    isProcessing: !isFinished && !!jobId,
    retry: reset,
    resumeError: pickResumeError(data, error),
  } as const;
};

const validateStatus = (res: StatusResponse) => ({
  isComplete: res.status === 'completed',
  isFailed: res.status === 'failed',
});

const pickResumeError = (
  data: StatusResponse | null,
  error: Error | null,
): { code?: StatusResponse['error']; message?: string } | null => {
  if (data?.error) {
    return { code: data.error, message: data.message };
  }

  const parsed = extractResumeError(error);
  if (parsed) return parsed;

  return null;
};
