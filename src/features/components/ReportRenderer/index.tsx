'use client';

import React, { useCallback, useMemo, useState, PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Header } from './components/Header';
import { Skills } from './components/Skills';
import { Experience } from './components/Experience';
import { RedFlags } from './components/RedFlags';
import { Improvements } from './components/Improvements';
import { InterviewQuestions } from './components/InterviewQuestions';
import { SchemaService, UiSectionKey } from '../../services/SchemaService';
import { useResumePolling } from './hooks/useResumePolling';
import { Button } from '@/components/ui/button';
import { SphereLoader } from '@/components/Loaders/Sphere';
import { useRouter } from '@/i18n/navigation';
import { paths } from '@/consts/routes';
import { ResultResponse, ResumeErrorCode } from '@/actions/resume/resumeActions';
import {
  ServerActionResultSuccess,
  ServerActionResultFailure,
  AppError,
} from '@/types/server-actions';
import { DEFAULT_RESUME_ERROR_KEY, RESUME_ERROR_KEY_MAP } from '@/features/consts/resumeErrors';
import type { AnalysisSchemaType } from '../../schema/analysisSchema';
import { AnimationContainer } from '@/components/AnimatedContainer';

const SECTION_COMPONENTS: Record<UiSectionKey, React.FC<{ data: AnalysisSchemaType }>> = {
  header: Header,
  skills: Skills,
  experience: Experience,
  redFlags: RedFlags,
  improvements: Improvements,
  questions: InterviewQuestions,
};

const toastId = 'resume-error-toast';

export const ReportRenderer: React.FC = () => {
  const [report, setReport] = useState<AnalysisSchemaType>();
  const router = useRouter();
  const tError = useTranslations('common.resumeErrors');
  const tReport = useTranslations('pages.cvReport.loadingTitle');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const onSuccess = useCallback((result: ServerActionResultSuccess<ResultResponse>) => {
    result.data.data && setReport(result.data.data);
  }, []);

  const onFailure = useCallback(
    ({ error }: ServerActionResultFailure<AppError>) => {
      const errorCode =
        typeof error === 'object' && error && 'code' in error ? error.code : undefined;

      toast.error(
        tError(RESUME_ERROR_KEY_MAP[errorCode as ResumeErrorCode] || DEFAULT_RESUME_ERROR_KEY),
        { id: toastId, duration: 2000 },
      );
    },
    [tError],
  );

  const { status, isProcessing } = useResumePolling(jobId, {
    onSuccess,
    onFailure,
    onPollingFailure: onFailure,
  });

  const activeSections = useMemo(() => {
    if (!report) return [];
    const service = new SchemaService(report);
    return service.getUiSections();
  }, [report]);

  if (isProcessing && loadingStatuses.has(status)) {
    return (
      <AnimationContainer id={jobId}>
        <Container>
          <SphereLoader />
          <h3 className="text-md font-semibold text-center">
            {tReport(status as LoadingStatus)}...
          </h3>
        </Container>
      </AnimationContainer>
    );
  }

  if (isProcessing === false && status === 'failed') {
    return (
      <AnimationContainer id={jobId}>
        <Container>
          <h3 className="text-md text-red-600">{tReport('failed')}</h3>
          <Button onClick={() => router.replace({ pathname: paths.cvChecker })} className="mt-2.5">
            {tCommon('tryAgainButtonTitle')}
          </Button>
        </Container>
      </AnimationContainer>
    );
  }

  if (!report) return null;

  return (
    <AnimationContainer id={jobId}>
      <div className="space-y-6">
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
    <div className="absolute inset-0 min-h-full-screen">
      <div className="grid h-full w-full place-items-center content-center gap-4">{children}</div>
    </div>
  );
};

type LoadingStatus = 'loading' | 'queued' | 'in_progress';
const loadingStatuses = new Set(['loading', 'queued', 'in_progress']);
