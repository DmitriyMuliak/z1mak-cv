'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { ReportSection } from '../ui/ReportSection';
import { TrajectoryBadge } from './TrajectoryBadge';
import { Timeline } from './Timeline';

export const CareerJourney: React.FC = () => {
  const t = useTranslations('pages.cvReport.careerJourney');
  const journey = useAnalysisStore((s) => s.data.careerJourney);

  if (!journey || !Array.isArray(journey.positions) || journey.positions.length === 0) return null;

  return (
    <ReportSection title={t('title')}>
      <TrajectoryBadge trajectory={journey.careerTrajectory} totalYears={journey.totalYears} />
      <Timeline journey={journey} />
    </ReportSection>
  );
};
