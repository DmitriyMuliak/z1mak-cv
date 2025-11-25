'use client';

import React from 'react';
import { AnalysisSchemaType } from '../../schema/analysisSchema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

type Props = {
  data: AnalysisSchemaType;
};

export const Skills: React.FC<Props> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('skills.analysisTitle')}</CardTitle>
        {/* <CardTitle>{data.detailedSkillAnalysis.title}</CardTitle> */}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.detailedSkillAnalysis.skills.map((s, idx) => (
            <div key={idx} className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{s.skill}</div>
                  <div className="text-sm">
                    {s.type} • {s.status}
                  </div>
                </div>
                <div className="text-sm">{s.confidenceScore}/10</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.evidenceFromCV}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
