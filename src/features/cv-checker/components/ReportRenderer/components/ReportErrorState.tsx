import React, { PropsWithChildren } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AnimationContainer } from '@/components/AnimatedContainer';
import { AppError } from '@/types/server-actions';

interface Props {
  error: AppError | null;
  jobId: string | null;
  onRetry: () => void;
}

export const ReportErrorState: React.FC<Props> = ({ error, jobId, onRetry }) => {
  const tReport = useTranslations('pages.cvReport.loadingTitle');
  const tCommon = useTranslations('common');

  return (
    <AnimationContainer id={`${jobId}:error`}>
      <Container>
        <div className="pointer-events-auto grid place-items-center content-center text-center">
          <h3 className="text-md text-red-600 mb-4">
            {error?.code === 'NOT_FOUND' ? tReport('empty') : tReport('failed')}
          </h3>
          <Button onClick={onRetry} variant="outline">
            {tCommon('tryAgainButtonTitle')}
          </Button>
        </div>
      </Container>
    </AnimationContainer>
  );
};

const Container = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-[50vh] w-full grid place-items-center content-center">{children}</div>
  );
};
