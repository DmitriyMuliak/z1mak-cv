'use client';

import React, { use, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { paths } from '@/consts/routes';
import { StatusResponse } from '@/actions/resume/resumeActions';
import { useResumePolling } from '@/features/cv-checker/hooks/useResumePolling';
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
}

type ViewState = 'loading' | 'error' | 'empty' | 'success';

export const ReportRenderer: React.FC<ReportRendererProps> = ({ pollingPromise }) => {
  const initialData = use(pollingPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const { status, isProcessing, report, error } = useResumePolling(jobId, initialData);

  const viewState: ViewState = useMemo(() => {
    if (isProcessing && isLoadingStatus(status)) return 'loading';
    if (!isProcessing && status === 'failed') return 'error';
    if (status === 'completed' && !report) return 'empty';
    if (report) return 'success';
    return 'loading'; // Default fallback
  }, [isProcessing, status, report]);

  const handleRetry = () => {
    router.replace({ pathname: paths.cvChecker });
  };

  switch (viewState) {
    case 'loading':
      return <ReportLoadingState status={status} jobId={jobId} />;

    case 'error':
      return <ReportErrorState error={error} jobId={jobId} onRetry={handleRetry} />;

    case 'empty':
      return <ReportEmptyState jobId={jobId} />;

    case 'success':
      return <ReportContent report={report!} jobId={jobId} />;
  }
};
