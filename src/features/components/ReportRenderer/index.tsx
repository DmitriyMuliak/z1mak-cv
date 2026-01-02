'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCvStore } from '@/features/store/useCvStore';
import { AnalysisSchemaType } from '../../schema/analysisSchema';
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

const SECTION_COMPONENTS: Record<UiSectionKey, React.FC<{ data: AnalysisSchemaType }>> = {
  header: Header,
  skills: Skills,
  experience: Experience,
  redFlags: RedFlags,
  improvements: Improvements,
  questions: InterviewQuestions,
};

export const ReportRenderer: React.FC = () => {
  const tReport = useTranslations('pages.cvReport.loadingTitle');
  const tCommon = useTranslations('common');
  const { lastReport, setLastReport } = useCvStore();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const { status, isProcessing, retry } = useResumePolling(jobId, setLastReport);

  const activeSections = useMemo(() => {
    if (!lastReport) return [];
    const service = new SchemaService(lastReport);
    return service.getUiSections();
  }, [lastReport]);

  if (isProcessing && loadingStatuses.has(status)) {
    return (
      <div className="absolute inset-0 min-h-full-screen">
        <div className="grid h-full w-full place-items-center content-center gap-4">
          <SphereLoader />
          <h3 className="text-md font-semibold text-center">
            {tReport(status as LoadingStatus)}...
          </h3>
        </div>
      </div>
    );
  }

  if (isProcessing === false && status === 'failed') {
    return (
      <div className="absolute inset-0 min-h-full-screen">
        <div className="grid h-full w-full place-items-center content-center gap-4">
          <h3 className="text-md text-red-600">{tReport('failed')}</h3>
          <Button onClick={retry} className="mt-2.5">
            {tCommon('tryAgainButtonTitle')}
          </Button>
        </div>
      </div>
    );
  }

  if (!lastReport) return null;

  return (
    <div className="space-y-6">
      {activeSections.map((sectionKey) => {
        const Component = SECTION_COMPONENTS[sectionKey];
        return <Component key={sectionKey} data={lastReport} />;
      })}
    </div>
  );
};

type LoadingStatus = 'loading' | 'queued' | 'in_progress';
const loadingStatuses = new Set(['loading', 'queued', 'in_progress']);
