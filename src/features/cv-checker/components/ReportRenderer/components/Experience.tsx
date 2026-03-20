'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { ReportSection } from './ui/ReportSection';
import { ExpandToggle } from './ui/ExpandToggle';

const PREVIEW_COUNT = 2;

export const Experience: React.FC = () => {
  const t = useTranslations('pages.cvReport');
  const expData = useAnalysisStore((s) => s.data.experienceRelevanceAnalysis);
  const jobs = Array.isArray(expData?.jobs) ? expData.jobs : [];

  const [isExpanded, setIsExpanded] = useState(false);

  if (!expData || jobs.length === 0) return null;

  const previewJobs = jobs.slice(0, PREVIEW_COUNT);
  const hiddenJobs = jobs.slice(PREVIEW_COUNT);
  const hasMore = hiddenJobs.length > 0;

  return (
    <ReportSection
      title={t('experience.title')}
      action={
        hasMore ? (
          <ExpandToggle
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded((v) => !v)}
            showAllLabel={t('experience.showAll', { count: jobs.length })}
            showLessLabel={t('experience.showLess')}
          />
        ) : undefined
      }
    >
      <div className="space-y-3">
        {previewJobs.map((j, i) => (
          <div key={i} className="p-3 border rounded hover:bg-muted/50 transition-colors">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">
                  {j.jobTitle} — {j.company}
                </div>
                <div className="text-sm text-muted-foreground">{j.period}</div>
              </div>
              <div className="text-sm">{j.relevanceToRoleScore}/10</div>
            </div>
            <div className="mt-2 text-sm">{j.comment}</div>
          </div>
        ))}

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="expanded-experience"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-3 overflow-hidden"
            >
              {hiddenJobs.map((j, i) => (
                <div key={i} className="p-3 border rounded hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">
                        {j.jobTitle} — {j.company}
                      </div>
                      <div className="text-sm text-muted-foreground">{j.period}</div>
                    </div>
                    <div className="text-sm">{j.relevanceToRoleScore}/10</div>
                  </div>
                  <div className="mt-2 text-sm">{j.comment}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ReportSection>
  );
};
