import { describe, it, expect } from 'vitest';
import { buildTimeline } from '@/features/cv-checker/components/ReportRenderer/components/CareerJourney/utils';

const makePosition = (index: number) => ({
  role: `Role ${index}`,
  company: `Company ${index}`,
  startDate: '2020-01',
  endDate: '2021-01',
  moveTag: 'Lateral',
  relevanceToTarget: 70,
  highlight: '',
});

const makeGap = (afterPositionIndex: number) => ({
  afterPositionIndex,
  durationMonths: 4,
  concern: 'Consider addressing',
});

describe('buildTimeline', () => {
  it('returns position items in order when no gaps', () => {
    const journey = {
      title: '',
      totalYears: 2,
      careerTrajectory: '',
      positions: [makePosition(0), makePosition(1), makePosition(2)],
      gaps: [],
    };

    const items = buildTimeline(journey);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ kind: 'position', index: 0 });
    expect(items[1]).toMatchObject({ kind: 'position', index: 1 });
    expect(items[2]).toMatchObject({ kind: 'position', index: 2 });
  });

  it('inserts gap immediately after the referenced position', () => {
    const journey = {
      title: '',
      totalYears: 5,
      careerTrajectory: '',
      positions: [makePosition(0), makePosition(1), makePosition(2)],
      gaps: [makeGap(1)], // gap after index 1
    };

    const items = buildTimeline(journey);

    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({ kind: 'position', index: 0 });
    expect(items[1]).toMatchObject({ kind: 'position', index: 1 });
    expect(items[2]).toMatchObject({ kind: 'gap', data: makeGap(1) });
    expect(items[3]).toMatchObject({ kind: 'position', index: 2 });
  });

  it('inserts gap after first position (index 0)', () => {
    const journey = {
      title: '',
      totalYears: 5,
      careerTrajectory: '',
      positions: [makePosition(0), makePosition(1)],
      gaps: [makeGap(0)],
    };

    const items = buildTimeline(journey);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ kind: 'position', index: 0 });
    expect(items[1]).toMatchObject({ kind: 'gap' });
    expect(items[2]).toMatchObject({ kind: 'position', index: 1 });
  });

  it('handles multiple gaps correctly', () => {
    const journey = {
      title: '',
      totalYears: 8,
      careerTrajectory: '',
      positions: [makePosition(0), makePosition(1), makePosition(2), makePosition(3)],
      gaps: [makeGap(0), makeGap(2)],
    };

    const items = buildTimeline(journey);

    expect(items).toHaveLength(6);
    expect(items.map((i) => i.kind)).toEqual([
      'position',
      'gap',
      'position',
      'position',
      'gap',
      'position',
    ]);
  });

  it('returns empty array for empty positions', () => {
    const journey = {
      title: '',
      totalYears: 0,
      careerTrajectory: '',
      positions: [],
      gaps: [],
    };

    expect(buildTimeline(journey)).toHaveLength(0);
  });

  it('preserves position data and correct index', () => {
    const pos = makePosition(0);
    const journey = {
      title: '',
      totalYears: 1,
      careerTrajectory: '',
      positions: [pos],
      gaps: [],
    };

    const items = buildTimeline(journey);

    expect(items[0].kind).toBe('position');
    if (items[0].kind === 'position') {
      expect(items[0].data).toBe(pos);
      expect(items[0].index).toBe(0);
    }
  });
});
