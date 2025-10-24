import type { BaseIssue } from 'valibot';

/*
 *  issue.path = array of steps
 *  { type: 'object', key: 'files' }
 *  { type: 'array', key: 0 },
 *  { type: 'object', key: 'file' }
 *  return comfort format for RHF - "files.0.file" (for ex. "files.0.file")
 */
export function extractIssueKey<TInput>(issue: BaseIssue<TInput>): string {
  if (!issue.path || issue.path.length === 0) return '_form';
  return issue.path.map((p) => (typeof p === 'object' ? String(p.key ?? p) : String(p))).join('.');
}
