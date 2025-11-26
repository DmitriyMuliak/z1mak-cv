'use client';

import React from 'react';
import { AnalysisSchemaType } from '../../../schema/analysisSchema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

type Props = {
  data: AnalysisSchemaType;
};

export const Experience: React.FC<Props> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const expData = data.experienceRelevanceAnalysis;

  if (!expData) return null;

  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('experience.title')}</CardTitle>
        {/* <CardTitle>{data.experienceRelevanceAnalysis.title}</CardTitle> */}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expData.jobs.map((j, i) => (
            <div key={i} className="p-3 border rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">
                    {j.jobTitle} — {j.company}
                  </div>
                  <div className="text-sm text-muted-foreground">{j.period}</div>
                </div>
                <div className="text-sm">{j.relevanceToRoleScore}/10</div>
              </div>
              <div className="mt-2 text-sm">{j.comment}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
