import React from 'react';
import { TableCell } from '@/components/ui/table';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import { StatusBadge } from './StatusBadge';
import { ImportanceBar } from './ImportanceBar';
import { SuggestionPopover } from './SuggestionPopover';

type AtsKeyword = NonNullable<AnalysisSchemaType['atsKeywordMatrix']>['keywords'][number];

interface KeywordRowProps {
  keyword: AtsKeyword;
}

// Renders <td> cells only — the parent KeywordTable wraps them in <motion.tr>
export const KeywordRow: React.FC<KeywordRowProps> = ({ keyword }) => {
  return (
    <>
      <TableCell className="py-2.5 font-mono text-xs font-medium whitespace-normal break-words">
        {keyword.keyword}
      </TableCell>

      <TableCell className="py-2.5 hidden sm:table-cell">
        <ImportanceBar importance={keyword.importance} />
      </TableCell>

      <TableCell className="py-2.5">
        <StatusBadge status={keyword.status} foundAs={keyword.foundAs} />
      </TableCell>

      <TableCell className="py-2.5 text-xs text-muted-foreground hidden md:table-cell whitespace-normal break-words">
        {keyword.cvSection ? (
          <span className="inline-block bg-secondary/60 rounded px-1.5 py-0.5">
            {keyword.cvSection}
          </span>
        ) : (
          <span className="opacity-30">—</span>
        )}
      </TableCell>

      <TableCell className="py-2.5 text-right">
        {keyword.suggestion ? (
          <SuggestionPopover keyword={keyword.keyword} suggestion={keyword.suggestion} />
        ) : (
          <span className="opacity-20 text-xs">—</span>
        )}
      </TableCell>
    </>
  );
};
