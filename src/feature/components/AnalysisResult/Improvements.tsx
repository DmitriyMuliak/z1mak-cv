'use client';

import React from 'react';
import { AnalysisSchemaType } from '../../schema/analysisSchema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

type Props = {
  data: AnalysisSchemaType;
};

export const Improvements: React.FC<Props> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('improvement.title')}</CardTitle>
        {/* <CardTitle>{data.actionableImprovementPlan.title}</CardTitle> */}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium mb-1">{t('improvement.summaryRewrite')}</div>
            <div>{data.actionableImprovementPlan.summaryRewrite.suggestion}</div>
            <div className="bg-[hsl(208deg_21.34%_83.3%)] dark:bg-[hsl(208deg_21%_35%)] mt-1.5 p-2 rounded">
              {data.actionableImprovementPlan.summaryRewrite.example}
            </div>
          </div>

          {data.actionableImprovementPlan.keywordOptimization && (
            <div>
              <div className="font-medium mb-1">{t('improvement.keywordOptimization')}</div>
              <div>
                {t('improvement.missing')}{' '}
                {data.actionableImprovementPlan.keywordOptimization.missingKeywords.join(', ')}
              </div>
              <div className="bg-[hsl(208deg_21.34%_83.3%)] dark:bg-[hsl(208deg_21%_35%)] mt-1.5 p-2 rounded">
                {data.actionableImprovementPlan.keywordOptimization.suggestion}
              </div>
            </div>
          )}

          <div>
            <div className="font-medium mb-1">{t('improvement.quantifyAchievements')}</div>
            <div>{data.actionableImprovementPlan.quantifyAchievements.suggestion}</div>
            <div className="bg-[hsl(208deg_21.34%_83.3%)] dark:bg-[hsl(208deg_21%_35%)] mt-1.5 p-2 rounded">
              {data.actionableImprovementPlan.quantifyAchievements.examplesToImprove.join('\n')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
