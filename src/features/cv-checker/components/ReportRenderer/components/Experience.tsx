'use client';

import React from 'react';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export const Experience: React.FC = () => {
  const t = useTranslations('pages.cvReport');
  const expData = useAnalysisStore((s) => s.data.experienceRelevanceAnalysis);
  const jobs = Array.isArray(expData?.jobs) ? expData.jobs : [];

  if (!expData || jobs.length === 0) return null;

  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('experience.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs.map((j, i) => (
            <div key={i} className="p-3 border rounded hover:bg-muted/50 transition-colors">
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
