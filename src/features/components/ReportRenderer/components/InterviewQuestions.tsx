'use client';

import React from 'react';
import { AnalysisSchemaType } from '../../../schema/analysisSchema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

type Props = {
  data: AnalysisSchemaType;
};

export const InterviewQuestions: React.FC<Props> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const questionsData = data.suggestedInterviewQuestions; // Optional

  if (!questionsData) return null;
  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('questions.title')}</CardTitle>
        {/* <CardTitle>{data.suggestedInterviewQuestions.title}</CardTitle> */}
      </CardHeader>
      <CardContent>
        <ol className="list-decimal ml-5 space-y-2">
          {questionsData.questions.map((q, i) => (
            <li key={i}>
              <div className="text-sm">{q.question}</div>
              <div className="text-sm text-muted-foreground">{q.reason}</div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
