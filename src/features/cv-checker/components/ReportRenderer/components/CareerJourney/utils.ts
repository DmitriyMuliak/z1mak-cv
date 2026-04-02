import { AnalysisSchemaType } from '../../../../schema/analysisSchema';

type CareerJourney = NonNullable<AnalysisSchemaType['careerJourney']>;
type CareerPosition = CareerJourney['positions'][number];
type CareerGap = CareerJourney['gaps'][number];

export type TimelineItem =
  | { kind: 'position'; data: CareerPosition; index: number }
  | { kind: 'gap'; data: CareerGap };

export function buildTimeline(journey: CareerJourney): TimelineItem[] {
  const items: TimelineItem[] = [];
  journey.positions.forEach((pos, i) => {
    items.push({ kind: 'position', data: pos, index: i });
    const gap = journey.gaps.find((g) => g.afterPositionIndex === i);
    if (gap) items.push({ kind: 'gap', data: gap });
  });
  return items;
}
