'use client';

import React, { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { paths } from '@/consts/routes';
import { StatusResponse } from '@/actions/resume/resumeActions';
import { useResumePolling } from '@/features/cv-checker/hooks/useResumePolling';
import { useResumeStreamingV2 } from '@/features/cv-checker/hooks/useResumeStreamingV2';
import { isLoadingStatus } from './config';
import { ReportLoadingState } from './components/ReportLoadingState';
import { ReportErrorState } from './components/ReportErrorState';
import { ReportEmptyState } from './components/ReportEmptyState';
import { ReportContent } from './components/ReportContent';
import type { AnalysisSchemaType } from '../../schema/analysisSchema';

interface ReportRendererProps {
  pollingPromise: Promise<{
    status?: StatusResponse;
    report?: AnalysisSchemaType;
  }>;
  useStreaming?: boolean;
}

type ViewState = 'loading' | 'error' | 'empty' | 'success';

export const ReportRenderer: React.FC<ReportRendererProps> = ({
  pollingPromise,
  useStreaming = false,
}) => {
  const initialData = use(pollingPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const pollingData = useResumePolling(
    jobId,
    !useStreaming ? initialData : undefined,
    !useStreaming,
  );
  const streamingData = useResumeStreamingV2(
    jobId,
    useStreaming ? initialData : undefined,
    useStreaming,
  );

  const { status, isProcessing, report, error } = useStreaming ? streamingData : pollingData;

  let viewState: ViewState = 'loading';
  if (isProcessing && isLoadingStatus(status)) {
    viewState = 'loading';
  } else if (!isProcessing && status === 'failed') {
    viewState = 'error';
  } else if (status === 'completed' && !report) {
    viewState = 'empty';
  } else if (report) {
    viewState = 'success';
  }

  const handleRetry = () => {
    router.replace({ pathname: paths.cvChecker });
  };

  switch (viewState) {
    case 'loading':
      if (report) {
        return <ReportContent />;
      }
      return <ReportLoadingState status={status} jobId={jobId} />;

    case 'error':
      return <ReportErrorState error={error} jobId={jobId} onRetry={handleRetry} />;

    case 'empty':
      return <ReportEmptyState jobId={jobId} />;

    case 'success':
      return <ReportContent />;
  }
};
