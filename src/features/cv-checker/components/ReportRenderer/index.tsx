'use client';

import React, { useMemo, PropsWithChildren, use } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Header } from './components/Header';
import { Skills } from './components/Skills';
import { Experience } from './components/Experience';
import { RedFlags } from './components/RedFlags';
import { Improvements } from './components/Improvements';
import { InterviewQuestions } from './components/InterviewQuestions';
import { SchemaService, UiSectionKey } from '../../services/SchemaService';
import { useResumePolling } from '@/features/cv-checker/hooks/useResumePolling';
import { Button } from '@/components/ui/button';
import { DotAndBarLoader } from '@/components/Loaders/DotAndBar';
import { useRouter } from '@/i18n/navigation';
import { paths } from '@/consts/routes';
import type { AnalysisSchemaType } from '../../schema/analysisSchema';
import { AnimationContainer } from '@/components/AnimatedContainer';
import { StatusResponse } from '@/actions/resume/resumeActions';
import { ReportSkeleton } from './components/ReportSkeleton';

const SECTION_COMPONENTS: Record<UiSectionKey, React.FC<{ data: AnalysisSchemaType }>> = {
  header: Header,
  skills: Skills,
  experience: Experience,
  redFlags: RedFlags,
  improvements: Improvements,
  questions: InterviewQuestions,
};

interface ReportRendererProps {
  pollingPromise: Promise<{
    status?: StatusResponse;
    report?: AnalysisSchemaType;
  }>;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ pollingPromise }) => {
  const initialData = use(pollingPromise);
  const router = useRouter();
  const tReport = useTranslations('pages.cvReport.loadingTitle');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { status, isProcessing, report, error } = useResumePolling(jobId, initialData);

  const activeSections = useMemo(() => {
    if (!report) return [];
    const service = new SchemaService(report);
    return service.getUiSections();
  }, [report]);

  // Handle updating status
  if (isProcessing && loadingStatuses.has(status)) {
    return (
      <div className="space-y-6 w-full">
        <div className="opacity-50 pointer-events-none filter blur-[2px] ">
          <ReportSkeleton />
        </div>
        <div className="absolute inset-0 full-screen-container-loader">
          <div className="grid h-screen w-full place-items-center content-center gap-4">
            <DotAndBarLoader />
            <h3 className="text-md font-medium text-center animate-pulse">
              {tReport(status as LoadingStatus)}...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // Handle failed status
  if (isProcessing === false && status === 'failed') {
    return (
      <AnimationContainer id={`${jobId}:error`}>
        <Container>
          <div className="pointer-events-auto grid place-items-center content-center">
            <h3 className="text-md text-red-600">
              {error?.code === 'NOT_FOUND' ? tReport('empty') : tReport('failed')}
            </h3>
            <Button
              onClick={() => router.replace({ pathname: paths.cvChecker })}
              className="mt-2.5"
            >
              {tCommon('tryAgainButtonTitle')}
            </Button>
          </div>
        </Container>
      </AnimationContainer>
    );
  }

  // Handle empty result
  if (status === 'completed' && !report) {
    return (
      <AnimationContainer id={`${jobId}:loading`}>
        <Container>
          <h3 className="text-md font-semibold text-center">{tReport('empty')}</h3>
        </Container>
      </AnimationContainer>
    );
  }

  if (!report) return null;

  return (
    <AnimationContainer id={`${jobId}:result`}>
      <div className="space-y-6 w-full">
        {activeSections.map((sectionKey) => {
          const Component = SECTION_COMPONENTS[sectionKey];
          return <Component key={sectionKey} data={report} />;
        })}
      </div>
    </AnimationContainer>
  );
};

const Container = ({ children }: PropsWithChildren) => {
  return (
    <div className="absolute inset-0 full-screen-container-loader">
      <div className="grid h-full w-full place-items-center content-center gap-4">{children}</div>
    </div>
  );
};

type LoadingStatus = 'loading' | 'queued' | 'in_progress';
const loadingStatuses = new Set(['loading', 'queued', 'in_progress']);
