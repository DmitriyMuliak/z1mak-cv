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
// ~1 header row (40px) + 9 rows (44px each) = 436px max
const TBODY_MIN_H = 220;
const TBODY_MAX_H = 220;

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

      <div className="rounded-md border border-border/40 overflow-hidden">
        <div
          className="overflow-y-auto overflow-x-auto"
          style={{ minHeight: TBODY_MIN_H, maxHeight: TBODY_MAX_H }}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
              <TableRow className="border-border/40 text-xs text-muted-foreground hover:bg-transparent">
                <TableHead className="py-2 h-9">{t('colKeyword')}</TableHead>
                <TableHead className="py-2 h-9 hidden sm:table-cell">{t('colPriority')}</TableHead>
                <TableHead className="py-2 h-9">{t('colStatus')}</TableHead>
                <TableHead className="py-2 h-9 hidden md:table-cell">{t('colFound')}</TableHead>
                <TableHead className="py-2 h-9 text-right">{t('colFix')}</TableHead>
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
    </div>
  );
};
