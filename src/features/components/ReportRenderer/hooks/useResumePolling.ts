import { useEffect } from 'react';
import { usePolling } from '@/hooks/usePolling';
import {
  getResumeResult,
  getResumeStatus,
  ResultResponse,
  StatusResponse,
} from '@/actions/sendToAnalyze';

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

  return {
    status: data?.status || 'loading',
    error,
    isProcessing: !isFinished && !!jobId,
    retry: reset,
  } as const;
};

const validateStatus = (res: StatusResponse) => ({
  isComplete: res.status === 'completed',
  isFailed: res.status === 'failed',
});
