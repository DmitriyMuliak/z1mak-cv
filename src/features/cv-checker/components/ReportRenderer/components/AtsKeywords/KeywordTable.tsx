'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KeywordRow } from './KeywordRow';
import { KeywordFilter } from './KeywordFilter';
import { AtsKeyword, FilterValue, sortKeywords, filterKeywords } from './utils';
import { cn } from '@/lib/utils';

interface KeywordTableProps {
  keywords: AtsKeyword[];
}
// ~1 header row (40px) + 5 rows (44px each) = 260px min

export const KeywordTable: React.FC<KeywordTableProps> = ({ keywords }) => {
  const t = useTranslations('pages.cvReport.atsKeywords');
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');

  const sorted = useMemo(() => sortKeywords(keywords), [keywords]);
  const filtered = useMemo(() => filterKeywords(sorted, activeFilter), [sorted, activeFilter]);

  const counts: Record<FilterValue, number> = useMemo(
    () => ({
      all: keywords.length,
      match: keywords.filter((k) => k.status === 'exact-match').length,
      partial: keywords.filter((k) => k.status === 'synonym-match').length,
      mentioned: keywords.filter((k) => k.status === 'mentioned').length,
      inferred: keywords.filter((k) => k.status === 'inferred').length,
      missing: keywords.filter((k) => k.status === 'missing').length,
    }),
    [keywords],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <KeywordFilter active={activeFilter} onChange={setActiveFilter} counts={counts} />
        <span className="text-xs text-muted-foreground">
          {t('showingOf', { shown: filtered.length, total: keywords.length })}
        </span>
      </div>

      <div className="rounded-md border border-border/40 overflow-hidden [&_[data-slot=table-container]]:overflow-y-auto [&_[data-slot=table-container]]:overflow-x-auto [&_[data-slot=table-container]]:min-h-[220px] [&_[data-slot=table-container]]:max-h-[220px]">
        <Table className="md:table-fixed md:min-w-[862px]">
          <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
            <TableRow className="border-border/40 text-xs text-muted-foreground hover:bg-transparent">
              <TableHead className="py-2 h-9 md:w-[42%]">{t('colKeyword')}</TableHead>
              <TableHead className="py-2 h-9 md:w-[11%] hidden sm:table-cell">
                {t('colPriority')}
              </TableHead>
              <TableHead className="py-2 h-9 md:w-[13%]">{t('colStatus')}</TableHead>
              <TableHead className="py-2 h-9 md:w-[29%] hidden md:table-cell">
                {t('colFound')}
              </TableHead>
              <TableHead className="py-2 h-9 md:w-[5%] text-right">{t('colFix')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((kw, _i) => (
              <tr
                key={`${kw.keyword}-${kw.status}`}
                className={cn(
                  'border-b border-border/40 last:border-0 transition-colors hover:bg-muted/50',
                )}
              >
                <KeywordRow keyword={kw} />
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
