import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import { InfoRow } from '../ui/InfoRow';
import { BooleanRow } from '../ui/BooleanRow';

export const FitDetails: React.FC<{ data: AnalysisSchemaType['overallAnalysis'] }> = ({ data }) => {
  const t = useTranslations('pages.cvReport.overall');

  return (
    <div>
      <h4 className="text-sm font-medium mb-6">{t('fitAssessment')}</h4>
      <div className="grid gap-2">
        <InfoRow label={t('candidateLevel')} value={data.candidateLevel} />
        <InfoRow label={t('jobTargetLevel')} value={data.jobTargetLevel} />

        <BooleanRow
          label={t('levelMatch')}
          value={data.levelMatch}
          trueText={t('yes')}
          falseText={t('no')}
        />
        <BooleanRow
          label={t('educationMatch')}
          value={data.educationMatch}
          trueText={t('yes')}
          falseText={t('no')}
        />
        <BooleanRow
          label={t('jobHoppingFlag')}
          value={data.jobHoppingFlag}
          trueText={t('yes')}
          falseText={t('no')}
        />
      </div>
    </div>
  );
};
