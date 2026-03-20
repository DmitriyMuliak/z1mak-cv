'use client';

import React from 'react';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

interface ScoreRingProps {
  value: number;
  label: string;
  size?: number;
}

function getStrokeColor(score: number): string {
  if (score >= 80) return 'var(--chart-2)'; // teal — strong match
  if (score >= 60) return 'var(--chart-4)'; // yellow — moderate
  return 'var(--destructive)'; // red — weak
}

const RADIUS = 36;
const CENTER = 48;
const STROKE_WIDTH = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ScoreRing: React.FC<ScoreRingProps> = ({ value, label, size = 96 }) => {
  const animated = useAnimatedNumber(value);

  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;
  const strokeColor = getStrokeColor(animated);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG ring — rotated so progress starts at 12 o'clock */}
        <svg
          viewBox="0 0 96 96"
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-border"
            opacity={0.4}
          />
          {/* Animated progress arc */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.4s ease' }}
          />
        </svg>

        {/* Centered numeric value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold tabular-nums leading-none">{animated}</span>
        </div>
      </div>

      <span className="text-xs font-medium text-muted-foreground text-center leading-tight max-w-[120px]">
        {label}
      </span>
    </div>
  );
};
