'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { ReportSection } from './ui/ReportSection';

export const Improvements: React.FC = () => {
  const t = useTranslations('pages.cvReport.improvement');
  const plan = useAnalysisStore((s) => s.data.actionableImprovementPlan);

  if (!plan) return null;

  const summarySuggestion = plan.summaryRewrite?.suggestion;
  const summaryExample = plan.summaryRewrite?.example;
  const keywordSuggestion = plan.keywordOptimization?.suggestion;
  const missingKeywords = Array.isArray(plan.keywordOptimization?.missingKeywords)
    ? plan.keywordOptimization.missingKeywords
    : [];
  const quantifySuggestion = plan.quantifyAchievements?.suggestion;
  const examplesToImprove = Array.isArray(plan.quantifyAchievements?.examplesToImprove)
    ? plan.quantifyAchievements.examplesToImprove
    : [];
  const hasAnySection =
    !!summarySuggestion ||
    !!summaryExample ||
    !!keywordSuggestion ||
    missingKeywords.length > 0 ||
    !!quantifySuggestion ||
    examplesToImprove.length > 0;

  if (!hasAnySection) return null;

  return (
    <ReportSection title={t('title')}>
      <div className="space-y-6 text-sm">
        {(summarySuggestion || summaryExample) && (
          <SuggestionBlock title={t('summaryRewrite')} text={summarySuggestion}>
            {summaryExample && <CodeBox>{`"${summaryExample}"`}</CodeBox>}
          </SuggestionBlock>
        )}

        {(keywordSuggestion || missingKeywords.length > 0) && (
          <SuggestionBlock title={t('keywordOptimization')}>
            <div className="mb-2">
              <span className="text-muted-foreground">{t('missing')}</span>{' '}
              <span className="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1 py-0.5 rounded">
                {missingKeywords.join(', ') || '-'}
              </span>
            </div>
            {keywordSuggestion && <CodeBox>{keywordSuggestion}</CodeBox>}
          </SuggestionBlock>
        )}

        {(quantifySuggestion || examplesToImprove.length > 0) && (
          <SuggestionBlock title={t('quantifyAchievements')} text={quantifySuggestion}>
            {examplesToImprove.length > 0 && (
              <ul className="list-disc ml-5 space-y-1">
                {examplesToImprove.map((ex, i) => (
                  <li key={i}>{`"${ex}"`}</li>
                ))}
              </ul>
            )}
          </SuggestionBlock>
        )}
      </div>
    </ReportSection>
  );
};

const SuggestionBlock: React.FC<{
  title: string;
  text?: string;
  children?: React.ReactNode;
}> = ({ title, text, children }) => (
  <div>
    <div className="font-medium mb-1">{title}</div>
    {text && <div className="mb-2 text-muted-foreground">{text}</div>}
    {children}
  </div>
);

const CodeBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-secondary/50 p-3 rounded-md italic border border-border/50 text-sm">
    {children}
  </div>
);
