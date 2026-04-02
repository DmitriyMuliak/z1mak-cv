import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';

type CareerGap = NonNullable<AnalysisSchemaType['careerJourney']>['gaps'][number];

interface TimelineGapProps {
  gap: CareerGap;
}

export const TimelineGap: React.FC<TimelineGapProps> = ({ gap }) => {
  const t = useTranslations('pages.cvReport.careerJourney');

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Left spacer — aligns with dot column */}
      <div className="shrink-0 flex flex-col items-center" style={{ width: 20 }}>
        <div className="w-px border-l-2 border-dashed border-amber-400/60" style={{ height: 32 }} />
      </div>

      {/* Gap label */}
      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
        <span>⚠️</span>
        <span className="font-medium">{t('gap', { months: gap.durationMonths })}</span>
        {gap.concern && (
          <span className="text-muted-foreground hidden sm:inline">— {gap.concern}</span>
        )}
      </div>
    </div>
  );
};
