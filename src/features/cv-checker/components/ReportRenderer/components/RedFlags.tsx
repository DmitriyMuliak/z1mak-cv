'use client';

import React from 'react';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export const RedFlags: React.FC = () => {
  const t = useTranslations('pages.cvReport');
  const flags = useAnalysisStore((s) => s.data.redFlagsAndConcerns?.flags);

  if (!flags || flags.length === 0) {
    return null;
  }

  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('redFlags.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc ml-5 space-y-2">
          {flags.map((f, i) => (
            <li key={i}>
              <div className="font-medium">
                {f.concern} <span className="text-xs text-muted-foreground">({f.severity})</span>
              </div>
              <div className="text-sm">{f.details}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
