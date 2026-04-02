import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import type { FilterValue } from './KeywordFilter';

export type { FilterValue };
export type AtsKeyword = NonNullable<AnalysisSchemaType['atsKeywordMatrix']>['keywords'][number];

const STATUS_WEIGHT: Record<AtsKeyword['status'], number> = {
  missing: 0,
  mentioned: 1,
  'synonym-match': 2,
  'exact-match': 3,
};
const IMPORTANCE_WEIGHT: Record<AtsKeyword['importance'], number> = {
  critical: 0,
  important: 1,
  'nice-to-have': 2,
};

export function sortKeywords(list: AtsKeyword[]): AtsKeyword[] {
  return [...list].sort((a, b) => {
    const statusDiff = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
    if (statusDiff !== 0) return statusDiff;
    return IMPORTANCE_WEIGHT[a.importance] - IMPORTANCE_WEIGHT[b.importance];
  });
}

export function filterKeywords(list: AtsKeyword[], filter: FilterValue): AtsKeyword[] {
  if (filter === 'all') return list;
  if (filter === 'match') return list.filter((k) => k.status === 'exact-match');
  if (filter === 'partial') return list.filter((k) => k.status === 'synonym-match');
  return list.filter((k) => k.status === 'missing');
}
