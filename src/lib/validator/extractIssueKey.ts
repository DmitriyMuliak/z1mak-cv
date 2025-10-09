import type { BaseIssue } from 'valibot';

/*
 *  issue.path =
 *  { type: 'array', key: 0 },
 *  { type: 'object', key: 'file' }
 */
export function extractIssueKey<TInput>(issue: BaseIssue<TInput>): string {
  if (!issue.path || issue.path.length === 0) return '_form';
  return issue.path.map((p) => (typeof p === 'object' ? String(p.key ?? p) : String(p))).join('.');
}
