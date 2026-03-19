'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useIntersectionTrigger } from '@/hooks/useIntersectionTrigger';
import { deriveRadarData } from '../../../utils/deriveRadarData';
import type { AnalysisSchemaType } from '../../../schema/analysisSchema';

type Skill = NonNullable<AnalysisSchemaType['detailedSkillAnalysis']>['skills'][number];

interface SkillRadarProps {
  skills: Skill[];
}

/**
 * Dynamically import the chart with ssr: false — Recharts' ResponsiveContainer
 * uses ResizeObserver internally which doesn't exist in the Node.js SSR environment.
 * The `loading` prop renders the pulse skeleton while the bundle loads.
 */
const DynamicChart = dynamic(() => import('./SkillRadarChart').then((m) => m.SkillRadarChart), {
  ssr: false,
  loading: () => <div className="w-full h-full rounded-lg bg-muted/30 animate-pulse" />,
});

/**
 * Animated radar chart — mounts (and animates) only once the container
 * scrolls into the viewport via a one-shot IntersectionObserver.
 */
export const SkillRadar: React.FC<SkillRadarProps> = ({ skills }) => {
  const [containerRef, hasIntersected] = useIntersectionTrigger<HTMLDivElement | null>({
    threshold: 0.2,
  });

  const radarData = useMemo(() => deriveRadarData(skills), [skills]);

  // Need at least 2 data points to render a meaningful shape.
  if (radarData.length < 2) return null;

  return (
    <div ref={containerRef} className="w-full h-56 mb-4">
      {hasIntersected ? (
        <DynamicChart data={radarData} />
      ) : (
        <div className="w-full h-full rounded-lg bg-muted/30 animate-pulse" />
      )}
    </div>
  );
};
