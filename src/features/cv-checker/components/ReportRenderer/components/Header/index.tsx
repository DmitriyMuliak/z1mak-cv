import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import { Separator } from '@/components/ui/separator';
import { ReportSection } from '../ui/ReportSection';
import { FitDetails } from './FitDetails';
import { Metrics } from './Metrics';
import { Skills } from './Skills';
import { ExportActions } from './ExportActions';
import { Scores } from './Scores';
import { TypewriterText } from '../TypewriterText';

export const Header: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const oa = data.overallAnalysis;
  const hasOverall = !!oa;
  const hasMetrics = !!data.quantitativeMetrics;

  if (!hasOverall && !hasMetrics && !data.metadata) {
    return null;
  }

  return (
    <ReportSection title={t('title')}>
      <div className="grid md:grid-cols-2 md:gap-4">
        {hasOverall && (
          <div>
            <Scores data={oa} />
            {oa.suitabilitySummary && (
              <>
                <div className="text-sm font-medium">{t('overall.suitabilitySummary')}</div>
                <TypewriterText text={oa.suitabilitySummary} className="text-sm" />
              </>
            )}
          </div>
        )}

        {hasOverall && <Separator className="my-4 md:hidden" />}

        {hasOverall && <FitDetails data={oa} />}
      </div>

      <Separator className="my-4" />

      <div className="grid md:grid-cols-3 md:gap-4 items-start">
        <Metrics data={data} />

        <Separator className="my-4 md:hidden" />

        <Skills data={data} />

        <Separator className="my-4 md:hidden" />

        <ExportActions data={data} />
      </div>
    </ReportSection>
  );
};
