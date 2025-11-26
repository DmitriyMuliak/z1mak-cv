'use client';

import React from 'react';
import { AnalysisSchemaType } from '../../../schema/analysisSchema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

type Props = {
  data: AnalysisSchemaType;
};

export const RedFlags: React.FC<Props> = ({ data }) => {
  const t = useTranslations('pages.cvReport');

  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('redFlags.title')}</CardTitle>
        {/* <CardTitle>{data.redFlagsAndConcerns.title}</CardTitle> */}
      </CardHeader>
      <CardContent>
        <ul className="list-disc ml-5 space-y-2">
          {data.redFlagsAndConcerns.flags.map((f, i) => (
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
