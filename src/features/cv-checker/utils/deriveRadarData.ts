import type { AnalysisSchemaType } from '../schema/analysisSchema';

export interface RadarDataPoint {
  subject: string;
  value: number; // average confidenceScore (0–10) for this skill type
  fullMark: number; // always 10
}

type Skill = NonNullable<AnalysisSchemaType['detailedSkillAnalysis']>['skills'][number];

function groupByKey(skills: Skill[], getKey: (s: Skill) => string): RadarDataPoint[] {
  const grouped = skills.reduce<Record<string, number[]>>((acc, skill) => {
    const key = getKey(skill).trim() || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill.confidenceScore);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([subject, scores]) => ({
      subject,
      value: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      fullMark: 10,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Groups skills by `type` (skill category). If fewer than 3 distinct types
 * exist the radar would be degenerate, so it falls back to grouping by
 * `status` — which always produces "Strongly Present / Mentioned / Missing"
 * giving a reliable 3-spoke coverage overview.
 *
 * Pure function: no side effects, fully testable in isolation.
 */
export function deriveRadarData(skills: Skill[]): RadarDataPoint[] {
  const byType = groupByKey(skills, (s) => s.type);
  if (byType.length >= 3) return byType;
  // Fall back to status distribution — always has 2-3 distinct values.
  return groupByKey(skills, (s) => s.status);
}
