'use client';

import React from 'react';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export const InterviewQuestions: React.FC = () => {
  const t = useTranslations('pages.cvReport');
  const questionsData = useAnalysisStore((s) => s.data.suggestedInterviewQuestions);
  const questions = Array.isArray(questionsData?.questions) ? questionsData.questions : [];

  if (!questionsData || questions.length === 0) return null;

  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('questions.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal ml-5 space-y-2">
          {questions.map((q, i) => (
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
