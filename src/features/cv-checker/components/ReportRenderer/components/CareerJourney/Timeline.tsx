'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import { TimelineNode } from './TimelineNode';
import { TimelineGap } from './TimelineGap';
import { buildTimeline } from './utils';

type CareerJourney = NonNullable<AnalysisSchemaType['careerJourney']>;

// Dot color based on relevance
function getDotColor(relevance: number): string {
  if (relevance >= 80) return 'var(--chart-2)';
  if (relevance >= 60) return 'var(--chart-4)';
  return 'var(--border)';
}

interface TimelineProps {
  journey: CareerJourney;
}

export const Timeline: React.FC<TimelineProps> = ({ journey }) => {
  const items = buildTimeline(journey);
  return (
    <div className="relative">
      {items.map((item, i) => {
        if (item.kind === 'gap') {
          return <TimelineGap key={`gap-${i}`} gap={item.data} />;
        }

        const isLeft = item.index % 2 === 0;
        const isLast =
          i === items.length - 1 || (i === items.length - 2 && items[i + 1]?.kind === 'gap');
        const relevance = item.data.relevanceToTarget;

        return (
          <div
            key={`pos-${item.index}`}
            className="
              grid gap-x-3
              grid-cols-[20px_1fr]
              md:grid-cols-[1fr_20px_1fr]
            "
          >
            {/* Desktop left card slot */}
            <div className="hidden md:block pb-4">
              {isLeft && <TimelineNode position={item.data} isLeft={true} index={item.index} />}
            </div>

            {/* Center: dot + vertical line — stretches to card height */}
            <div className="flex flex-col items-center h-full">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.3,
                  delay: item.index * 0.06 + 0.1,
                  type: 'spring',
                  stiffness: 300,
                }}
                className="z-10 mt-1 size-3 rounded-full border-2 border-background shrink-0"
                style={{ background: getDotColor(relevance) }}
              />
              {!isLast && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: item.index * 0.06 + 0.2, ease: 'easeOut' }}
                  className="w-px flex-1 bg-border/60 origin-top mt-1"
                />
              )}
            </div>

            {/* Right card slot — always on mobile, conditionally on desktop */}
            <div className="pb-4">
              {/* Mobile: always show */}
              <div className="md:hidden">
                <TimelineNode position={item.data} isLeft={false} index={item.index} />
              </div>
              {/* Desktop: only odd-indexed positions */}
              {!isLeft && (
                <div className="hidden md:block">
                  <TimelineNode position={item.data} isLeft={false} index={item.index} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
