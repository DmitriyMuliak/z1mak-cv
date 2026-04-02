import { describe, it, expect } from 'vitest';
import {
  sortKeywords,
  filterKeywords,
  type AtsKeyword,
} from '@/features/cv-checker/components/ReportRenderer/components/AtsKeywords/utils';

const kw = (
  keyword: string,
  status: AtsKeyword['status'],
  importance: AtsKeyword['importance'],
): AtsKeyword => ({ keyword, status, importance });

describe('sortKeywords', () => {
  it('places missing keywords before partial and exact matches', () => {
    const input = [
      kw('C', 'exact-match', 'critical'),
      kw('B', 'synonym-match', 'important'),
      kw('A', 'missing', 'nice-to-have'),
    ];

    const result = sortKeywords(input);

    expect(result[0].keyword).toBe('A'); // missing first
    expect(result[1].keyword).toBe('B'); // synonym second
    expect(result[2].keyword).toBe('C'); // exact last
  });

  it('within same status, orders by importance: critical → important → nice-to-have', () => {
    const input = [
      kw('C', 'missing', 'nice-to-have'),
      kw('B', 'missing', 'important'),
      kw('A', 'missing', 'critical'),
    ];

    const result = sortKeywords(input);

    expect(result[0].keyword).toBe('A'); // critical
    expect(result[1].keyword).toBe('B'); // important
    expect(result[2].keyword).toBe('C'); // nice-to-have
  });

  it('missing critical comes before missing important', () => {
    const input = [kw('B', 'missing', 'important'), kw('A', 'missing', 'critical')];

    const [first, second] = sortKeywords(input);
    expect(first.keyword).toBe('A');
    expect(second.keyword).toBe('B');
  });

  it('synonym-match critical comes before exact-match nice-to-have', () => {
    const input = [kw('B', 'exact-match', 'nice-to-have'), kw('A', 'synonym-match', 'critical')];

    const [first] = sortKeywords(input);
    expect(first.keyword).toBe('A');
  });

  it('does not mutate the original array', () => {
    const input = [kw('B', 'missing', 'important'), kw('A', 'exact-match', 'critical')];
    const original = [...input];
    sortKeywords(input);
    expect(input).toEqual(original);
  });

  it('returns empty array unchanged', () => {
    expect(sortKeywords([])).toEqual([]);
  });
});

describe('filterKeywords', () => {
  const keywords: AtsKeyword[] = [
    kw('A', 'exact-match', 'critical'),
    kw('B', 'synonym-match', 'important'),
    kw('C', 'missing', 'nice-to-have'),
    kw('D', 'exact-match', 'nice-to-have'),
    kw('E', 'missing', 'critical'),
  ];

  it('"all" returns every keyword', () => {
    expect(filterKeywords(keywords, 'all')).toHaveLength(5);
  });

  it('"match" returns only exact-match keywords', () => {
    const result = filterKeywords(keywords, 'match');
    expect(result).toHaveLength(2);
    expect(result.every((k) => k.status === 'exact-match')).toBe(true);
  });

  it('"partial" returns only synonym-match keywords', () => {
    const result = filterKeywords(keywords, 'partial');
    expect(result).toHaveLength(1);
    expect(result[0].keyword).toBe('B');
  });

  it('"missing" returns only missing keywords', () => {
    const result = filterKeywords(keywords, 'missing');
    expect(result).toHaveLength(2);
    expect(result.every((k) => k.status === 'missing')).toBe(true);
  });

  it('returns empty array when no keywords match the filter', () => {
    const noPartial = [kw('A', 'exact-match', 'critical')];
    expect(filterKeywords(noPartial, 'partial')).toHaveLength(0);
  });
});
