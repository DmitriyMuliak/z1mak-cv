import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';

type AtsKeyword = NonNullable<AnalysisSchemaType['atsKeywordMatrix']>['keywords'][number];

interface StatusBadgeProps {
  status: AtsKeyword['status'];
  foundAs?: string;
}

const CONFIG = {
  'exact-match': {
    icon: '✓',
    labelKey: 'statusMatch' as const,
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  'synonym-match': {
    icon: '~',
    labelKey: 'statusPartial' as const,
    className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  },
  missing: {
    icon: '✕',
    labelKey: 'statusMissing' as const,
    className: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  mentioned: {
    icon: '◎',
    labelKey: 'statusMentioned' as const,
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  inferred: {
    icon: '≈',
    labelKey: 'statusInferred' as const,
    className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, foundAs }) => {
  const t = useTranslations('pages.cvReport.atsKeywords');
  const cfg = CONFIG[status];

  if (!cfg) return null;

  return (
    <span
      title={status === 'synonym-match' && foundAs ? `Found as: "${foundAs}"` : undefined}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {t(cfg.labelKey)}
    </span>
  );
};
