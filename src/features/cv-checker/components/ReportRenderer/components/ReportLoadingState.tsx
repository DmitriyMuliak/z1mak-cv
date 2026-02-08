import React from 'react';
import { useTranslations } from 'next-intl';
import { DotAndBarLoader } from '@/components/Loaders/DotAndBar';
import { AnimationContainer } from '@/components/AnimatedContainer';
import { ReportSkeleton } from './ReportSkeleton';
import { LoadingStatus } from '../config';

interface Props {
  status: LoadingStatus | string;
  jobId: string | null;
}

export const ReportLoadingState: React.FC<Props> = ({ status, jobId }) => {
  const tReport = useTranslations('pages.cvReport.loadingTitle');

  return (
    <div className="space-y-6 w-full relative">
      <AnimationContainer id={`${jobId}:loading`}>
        <div className="opacity-50 pointer-events-none filter blur-[2px]">
          <ReportSkeleton />
        </div>
        <div className="absolute inset-0 z-10">
          <div className="grid h-[50vh] w-full place-items-center content-center gap-4 sticky top-0">
            <DotAndBarLoader />
            <h3 className="text-md font-medium text-center animate-pulse">
              {tReport(status as LoadingStatus)}...
            </h3>
          </div>
        </div>
      </AnimationContainer>
    </div>
  );
};
