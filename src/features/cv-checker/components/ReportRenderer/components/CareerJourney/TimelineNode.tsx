'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import { MoveTagBadge } from './MoveTagBadge';

type CareerPosition = NonNullable<AnalysisSchemaType['careerJourney']>['positions'][number];

interface TimelineNodeProps {
  position: CareerPosition;
  isLeft: boolean;
  index: number;
}

function getRelevanceColor(r: number): string {
  if (r >= 80) return 'var(--chart-2)';
  if (r >= 60) return 'var(--chart-4)';
  return 'var(--muted-foreground)';
}

function formatDate(date: string, presentLabel: string): string {
  if (date === 'present') return presentLabel;
  const [year, month] = date.split('-');
  return `${new Date(0, Number(month) - 1).toLocaleString('en', { month: 'short' })} ${year}`;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({ position, isLeft, index }) => {
  const t = useTranslations('pages.cvReport.careerJourney');

  const card = (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -16 : 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-lg border border-border/60 bg-card p-3 text-sm shadow-sm space-y-2"
    >
      {/* Role + company */}
      <div>
        <div className="font-medium leading-snug">{position.role}</div>
        <div className="text-xs text-muted-foreground">{position.company}</div>
      </div>

      {/* Dates */}
      <div className="text-xs text-muted-foreground">
        {formatDate(position.startDate, t('present'))} —{' '}
        {formatDate(position.endDate, t('present'))}
      </div>

      {/* Move tag */}
      <MoveTagBadge tag={position.moveTag} />

      {/* Relevance bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('relevance')}</span>
          <span>{position.relevanceToTarget}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${position.relevanceToTarget}%`,
              background: getRelevanceColor(position.relevanceToTarget),
            }}
          />
        </div>
      </div>

      {/* Highlight */}
      {position.highlight && (
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          "{position.highlight}"
        </p>
      )}
    </motion.div>
  );

  return card;
};
