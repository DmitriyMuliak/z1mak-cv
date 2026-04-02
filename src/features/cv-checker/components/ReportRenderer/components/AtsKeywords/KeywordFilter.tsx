import React from 'react';
import { useTranslations } from 'next-intl';

export type FilterValue = 'all' | 'match' | 'partial' | 'missing';

interface KeywordFilterProps {
  active: FilterValue;
  onChange: (filter: FilterValue) => void;
  counts: Record<FilterValue, number>;
}

const FILTERS: {
  value: FilterValue;
  labelKey: 'filterAll' | 'filterMatch' | 'filterPartial' | 'filterMissing';
}[] = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'match', labelKey: 'filterMatch' },
  { value: 'partial', labelKey: 'filterPartial' },
  { value: 'missing', labelKey: 'filterMissing' },
];

export const KeywordFilter: React.FC<KeywordFilterProps> = ({ active, onChange, counts }) => {
  const t = useTranslations('pages.cvReport.atsKeywords');

  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Filter keywords">
      {FILTERS.map(({ value, labelKey }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 border',
              isActive
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground',
            ].join(' ')}
          >
            {t(labelKey)}
            {counts[value] > 0 && <span className="ml-1 opacity-60">{counts[value]}</span>}
          </button>
        );
      })}
    </div>
  );
};
