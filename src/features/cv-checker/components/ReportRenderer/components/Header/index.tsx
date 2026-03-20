'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { Separator } from '@/components/ui/separator';
import { ReportSection } from '../ui/ReportSection';
import { FitDetails } from './FitDetails';
import { Metrics } from './Metrics';
import { Skills } from './Skills';
import { ExportActions } from './ExportActions';
import { Scores } from './Scores';
// import { TypewriterText } from '../TypewriterText';
import { MediaQuery, screenType } from '@/components/MediaQuery';

export const Header: React.FC = () => {
  const t = useTranslations('pages.cvReport');
  const oa = useAnalysisStore((s) => s.data.overallAnalysis);
  const qm = useAnalysisStore((s) => s.data.quantitativeMetrics);
  const metadata = useAnalysisStore((s) => s.data.metadata);

  const hasOverall = !!oa;
  const hasMetrics = !!qm;

  if (!hasOverall && !hasMetrics && !metadata) {
    return null;
  }

  return (
    <ReportSection title={t('title')}>
      <div className="grid md:gap-4 md:grid-cols-2 ">
        <MediaQuery screen={screenType.md} mode="hide">
          <Scores data={oa} />
        </MediaQuery>
        {hasOverall && (
          <div>
            {oa.suitabilitySummary && (
              <>
                <div className="text-sm font-medium">{t('overall.suitabilitySummary')}</div>
                <div className="text-sm">{oa.suitabilitySummary}</div>
                {/* <TypewriterText text={oa.suitabilitySummary} className="text-sm" /> */}
              </>
            )}
          </div>
        )}

        {hasOverall && <Separator className="my-4 md:hidden" />}

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {hasOverall && <FitDetails data={oa} />}
          <MediaQuery screen={screenType.md}>
            <Scores data={oa} />
          </MediaQuery>
        </div>
      </div>

      <Separator className="my-4" />
      <div className="grid md:grid-cols-3 md:gap-4 lg:gap-10 items-start">
        <div>
          <Metrics qm={qm} />
        </div>

        <Separator className="my-4 md:hidden" />

        <div>
          <Skills qm={qm} />
        </div>

        <Separator className="my-4 md:hidden" />

        <div>
          <ExportActions />
        </div>
      </div>
    </ReportSection>
  );
};
