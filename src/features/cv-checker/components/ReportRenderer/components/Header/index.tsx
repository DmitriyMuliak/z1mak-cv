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

export const Header: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const oa = data.overallAnalysis;
  return (
    <ReportSection title={t('title')}>
      <div className="grid md:grid-cols-2 md:gap-4">
        <div>
          <Scores data={oa} />
          <div className="text-sm font-medium">{t('overall.suitabilitySummary')}</div>
          <div className="text-sm">{oa.suitabilitySummary}</div>
        </div>

        <Separator className="my-4 md:hidden" />

        <FitDetails data={oa} />
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
