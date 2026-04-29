import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';

type AtsKeyword = NonNullable<AnalysisSchemaType['atsKeywordMatrix']>['keywords'][number];

interface ImportanceBarProps {
  importance: AtsKeyword['importance'];
}

const CONFIG = {
  critical: {
    widthClass: 'w-full',
    colorClass: 'bg-gradient-to-r from-red-500 to-orange-400',
    labelKey: 'importanceCritical' as const,
  },
  important: {
    widthClass: 'w-3/4',
    colorClass: 'bg-gradient-to-r from-yellow-500 to-amber-400',
    labelKey: 'importanceImportant' as const,
  },
  'nice-to-have': {
    widthClass: 'w-1/2',
    colorClass: 'bg-gradient-to-r from-blue-500 to-sky-400',
    labelKey: 'importanceNiceToHave' as const,
  },
};

export const ImportanceBar: React.FC<ImportanceBarProps> = ({ importance }) => {
  const t = useTranslations('pages.cvReport.atsKeywords');
  const cfg = CONFIG[importance.toLowerCase() as keyof typeof CONFIG] || {
    widthClass: '',
    colorClass: '',
    labelKey: 'unknown',
  };

  return (
    <div className="flex flex-col gap-0.5 min-w-[72px]">
      <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
        <div className={`h-full rounded-full ${cfg.widthClass} ${cfg.colorClass}`} />
      </div>
      <span className="text-[10px] text-muted-foreground leading-none">{t(cfg.labelKey)}</span>
    </div>
  );
};
