'use client';

import React, { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { paths } from '@/consts/routes';
import { StatusResponse } from '@/actions/resume/resumeActions';
import { useResumePolling } from '@/features/cv-checker/hooks/useResumePolling';
import { useResumeStreamingV2 } from '@/features/cv-checker/hooks/useResumeStreamingV2';
import { ErrorBoundary } from '../ErrorBoundary';
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

interface DataSourceProps {
  initialData: {
    status?: StatusResponse;
    report?: AnalysisSchemaType;
  };
  jobId: string | null;
  onRetry: () => void;
}

const PollingReportRenderer: React.FC<DataSourceProps> = ({ initialData, jobId, onRetry }) => {
  const pollingData = useResumePolling(jobId, initialData, true);
  const { status, isProcessing, report, error } = pollingData;

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

  switch (viewState) {
    case 'loading':
      if (report) {
        return (
          <ErrorBoundary
            fallback={<ReportErrorState error={null} jobId={jobId} onRetry={onRetry} />}
          >
            <ReportContent />
          </ErrorBoundary>
        );
      }
      return <ReportLoadingState status={status} jobId={jobId} />;

    case 'error':
      return <ReportErrorState error={error} jobId={jobId} onRetry={onRetry} />;

    case 'empty':
      return <ReportEmptyState jobId={jobId} />;

    case 'success':
      return (
        <ErrorBoundary fallback={<ReportErrorState error={null} jobId={jobId} onRetry={onRetry} />}>
          <ReportContent />
        </ErrorBoundary>
      );
  }
};

const StreamingReportRenderer: React.FC<DataSourceProps> = ({ initialData, jobId, onRetry }) => {
  const streamingData = useResumeStreamingV2(jobId, initialData, true);
  const { status, isProcessing, report, error } = streamingData;

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

  switch (viewState) {
    case 'loading':
      if (report) {
        return (
          <ErrorBoundary
            fallback={<ReportErrorState error={null} jobId={jobId} onRetry={onRetry} />}
          >
            <ReportContent />
          </ErrorBoundary>
        );
      }
      return <ReportLoadingState status={status} jobId={jobId} />;

    case 'error':
      return <ReportErrorState error={error} jobId={jobId} onRetry={onRetry} />;

    case 'empty':
      return <ReportEmptyState jobId={jobId} />;

    case 'success':
      return (
        <ErrorBoundary fallback={<ReportErrorState error={null} jobId={jobId} onRetry={onRetry} />}>
          <ReportContent />
        </ErrorBoundary>
      );
  }
};

export const ReportRenderer: React.FC<ReportRendererProps> = ({
  pollingPromise,
  useStreaming = false,
}) => {
  const initialData = use(pollingPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const handleRetry = () => {
    router.replace({ pathname: paths.cvChecker });
  };

  const DataSource = useStreaming ? StreamingReportRenderer : PollingReportRenderer;
  return <DataSource initialData={initialData} jobId={jobId} onRetry={handleRetry} />;
};
