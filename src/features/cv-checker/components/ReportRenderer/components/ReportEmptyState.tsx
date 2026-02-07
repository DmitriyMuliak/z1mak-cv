import React, { PropsWithChildren } from 'react';
import { useTranslations } from 'next-intl';
import { AnimationContainer } from '@/components/AnimatedContainer';

interface Props {
  jobId: string | null;
}

export const ReportEmptyState: React.FC<Props> = ({ jobId }) => {
  const tReport = useTranslations('pages.cvReport.loadingTitle');

  return (
    <AnimationContainer id={`${jobId}:empty`}>
      <Container>
        <h3 className="text-md font-semibold text-center">{tReport('empty')}</h3>
      </Container>
    </AnimationContainer>
  );
};

const Container = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-[50vh] w-full grid place-items-center content-center">{children}</div>
  );
};
