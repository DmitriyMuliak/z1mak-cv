import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';

export const Scores: React.FC<{ data: AnalysisSchemaType['overallAnalysis'] }> = ({ data }) => {
  const t = useTranslations('pages.cvReport.overall');
  const scoreList = [
    { key: 'matchScore', tKey: 'matchScore', value: data.matchScore } as const,
    {
      key: 'independentCvScore',
      tKey: 'independentCvScore',
      value: data.independentCvScore,
    } as const,
    {
      key: 'independentTechCvScore',
      tKey: 'independentTechCvScore',
      value: data.independentTechCvScore,
    } as const,
  ].filter((v) => v.value !== undefined);

  return (
    <div className="grid sm:grid-cols-2 sm:gap-2 md:gap-4">
      {scoreList.map((item) => {
        return (
          <div key={item.key} className="grid items-end">
            <div className="text-sm font-medium">{t(item.tKey)}</div>
            <div className="text-3xl font-bold mb-2">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
};
