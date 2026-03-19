'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { RadarDataPoint } from '../../../utils/deriveRadarData';

interface SkillRadarChartProps {
  data: RadarDataPoint[];
}

/**
 * The actual Recharts markup — kept in its own module so it can be
 * dynamically imported with `ssr: false` from SkillRadar.tsx.
 * ResponsiveContainer uses ResizeObserver internally, which does not
 * exist in the Node.js SSR environment.
 */
export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
      <PolarGrid stroke="var(--border)" />
      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
      <Tooltip
        contentStyle={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--card-foreground)',
          fontSize: 12,
        }}
        formatter={(value) => [`${value} / 10`, 'Avg confidence']}
      />
      <Radar
        name="Skills"
        dataKey="value"
        stroke="var(--chart-2)"
        fill="var(--chart-2)"
        fillOpacity={0.25}
        strokeWidth={2}
        animationBegin={0}
        animationDuration={900}
        animationEasing="ease-out"
      />
    </RadarChart>
  </ResponsiveContainer>
);
