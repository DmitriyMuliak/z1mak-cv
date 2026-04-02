'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { ReportSection } from '../ui/ReportSection';
import { ScoreRing } from '../Header/ScoreRing';
import { KeywordTable } from './KeywordTable';

export const AtsKeywords: React.FC = () => {
  const t = useTranslations('pages.cvReport.atsKeywords');
  const matrix = useAnalysisStore((s) => s.data.atsKeywordMatrix);

  if (!matrix || !Array.isArray(matrix.keywords) || matrix.keywords.length === 0) return null;

  return (
    <ReportSection title={t('title')}>
      <div className="space-y-2">
        {/* Score ring + summary */}
        <div className="flex flex-col items-center">
          <ScoreRing value={matrix.compatibilityScore} label={t('title')} size={88} />
          {matrix.summary && (
            <p className="text-sm text-muted-foreground text-center max-w-sm">{matrix.summary}</p>
          )}
        </div>

        {/* Keyword table with filter */}
        <KeywordTable keywords={matrix.keywords} />
      </div>
    </ReportSection>
  );
};
