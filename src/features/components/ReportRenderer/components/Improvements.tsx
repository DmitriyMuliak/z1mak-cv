import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../schema/analysisSchema';
import { ReportSection } from './ui/ReportSection';

export const Improvements: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport.improvement');
  const plan = data.actionableImprovementPlan;

  if (!plan) return null;

  return (
    <ReportSection title={t('title')}>
      <div className="space-y-6 text-sm">
        <SuggestionBlock title={t('summaryRewrite')} text={plan.summaryRewrite.suggestion}>
          <CodeBox>{`"${plan.summaryRewrite.example}"`}</CodeBox>
        </SuggestionBlock>

        {plan.keywordOptimization && (
          <SuggestionBlock title={t('keywordOptimization')}>
            <div className="mb-2">
              <span className="text-muted-foreground">{t('missing')}</span>{' '}
              <span className="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1 py-0.5 rounded">
                {plan.keywordOptimization.missingKeywords.join(', ') || '-'}
              </span>
            </div>
            <CodeBox>{plan.keywordOptimization.suggestion}</CodeBox>
          </SuggestionBlock>
        )}

        <SuggestionBlock
          title={t('quantifyAchievements')}
          text={plan.quantifyAchievements.suggestion}
        >
          {plan.quantifyAchievements.examplesToImprove.length > 0 && (
            <ul className="list-disc ml-5 space-y-1">
              {plan.quantifyAchievements.examplesToImprove.map((ex, i) => (
                <li key={i}>{`"${ex}"`}</li>
              ))}
            </ul>
          )}
        </SuggestionBlock>

        {/* <SuggestionBlock title="Remove Irrelevant" text={plan.removeIrrelevant.suggestion} /> */}
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
