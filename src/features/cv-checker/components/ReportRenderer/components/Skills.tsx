'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisSchemaType } from '../../../schema/analysisSchema';
import { ReportSection } from './ui/ReportSection';
// import { SkillRadar } from './SkillRadar';

const PREVIEW_COUNT = 3;

const STATUS_BORDER: Record<string, string> = {
  'Strongly Present': 'var(--chart-2)',
  Present: 'var(--chart-2)',
  Mentioned: 'var(--chart-4)',
  'Partially Present': 'var(--chart-4)',
  Missing: 'var(--destructive)',
  'Not Mentioned': 'var(--destructive)',
};

function getStatusColor(status: string): string {
  return STATUS_BORDER[status] ?? 'var(--border)';
}

type Skill = NonNullable<AnalysisSchemaType['detailedSkillAnalysis']>['skills'][number];

function SkillCard({ s }: { s: Skill }) {
  return (
    <div
      className="p-3 border rounded hover:bg-muted/50 transition-colors"
      style={{ borderLeft: `3px solid ${getStatusColor(s.status)}` }}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium flex items-center gap-2">{s.skill}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {s.type} • {s.status}
          </div>
        </div>
        <div className="text-sm font-semibold">{s.confidenceScore}/10</div>
      </div>
      {s.evidenceFromCV !== 'N/A' && (
        <div className="mt-2 text-sm text-muted-foreground italic border-l-2 pl-2">
          {`"${s.evidenceFromCV}"`}
        </div>
      )}
    </div>
  );
}

export const Skills: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const skills = data.detailedSkillAnalysis?.skills;
  const safeSkills = Array.isArray(skills) ? skills : [];

  const [isExpanded, setIsExpanded] = useState(false);

  if (safeSkills.length === 0) return null;

  const previewSkills = safeSkills.slice(0, PREVIEW_COUNT);
  const hiddenSkills = safeSkills.slice(PREVIEW_COUNT);
  const hasMore = hiddenSkills.length > 0;

  const toggleButton = hasMore ? (
    <button
      onClick={() => setIsExpanded((v) => !v)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      aria-expanded={isExpanded}
    >
      {isExpanded ? (
        <>
          {t('skills.showLess')} <ChevronUp className="w-3.5 h-3.5" />
        </>
      ) : (
        <>
          {t('skills.showAll', { count: safeSkills.length })}{' '}
          <ChevronDown className="w-3.5 h-3.5" />
        </>
      )}
    </button>
  ) : null;

  return (
    <ReportSection title={t('skills.analysisTitle')} action={toggleButton}>
      {/* <SkillRadar skills={safeSkills} /> */}

      <div className="space-y-3">
        {/* Always-visible preview items */}
        {previewSkills.map((s) => (
          <SkillCard key={s.skill} s={s} />
        ))}

        {/* Collapsible rest */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="expanded-skills"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-3 overflow-hidden"
            >
              {hiddenSkills.map((s) => (
                <SkillCard key={s.skill} s={s} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ReportSection>
  );
};
