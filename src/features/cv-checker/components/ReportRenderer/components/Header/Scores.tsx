import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import { ScoreRing } from './ScoreRing';

export const Scores: React.FC<{ data?: AnalysisSchemaType['overallAnalysis'] }> = ({ data }) => {
  const t = useTranslations('pages.cvReport.overall');
  if (!data) {
    return null;
  }

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
  ].filter((v): v is typeof v & { value: number } => v.value !== undefined);

  return (
    <div className="flex flex-wrap gap-4">
      {scoreList.map((item) => (
        <ScoreRing key={item.key} value={item.value} label={t(item.tKey)} />
      ))}
    </div>
  );
};
