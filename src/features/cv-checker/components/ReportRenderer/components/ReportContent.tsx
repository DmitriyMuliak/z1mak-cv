'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { AnalysisSchemaType } from '@/features/cv-checker/schema/analysisSchema';
import {
  SchemaService,
  UI_SECTION_ORDER,
  UiSectionKey,
} from '@/features/cv-checker/services/SchemaService';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { SECTION_COMPONENTS } from '../config';

interface Props {
  report: AnalysisSchemaType;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.34, 1.2, 0.64, 1] },
  },
} satisfies Variants;

/**
 * Renders analysis sections as they arrive via SSE patches.
 *
 * Each new section key added to `activeSections` triggers a Framer Motion
 * enter animation (slide-up + scale + blur-clear). Sections already known
 * are ignored to prevent double-renders.
 *
 * Session detection (same pattern as TypewriterText):
 *   - status === 'completed' on mount  → page reload → initial={false}, no animation
 *   - status === 'in_progress' on mount → live stream → animate from 'hidden'
 */
export const ReportContent: React.FC<Props> = ({ report }) => {
  const activeSections = useMemo(() => new SchemaService(report).getUiSections(), [report]);

  const [showImmediately] = useState(() => useAnalysisStore.getState().status === 'completed');

  const [displayedSections, setDisplayedSections] = useState<UiSectionKey[]>([]);
  const knownSections = useRef(new Set<UiSectionKey>());

  useEffect(() => {
    const newKeys = activeSections.filter((k) => !knownSections.current.has(k));
    if (newKeys.length === 0) return;
    newKeys.forEach((k) => knownSections.current.add(k));
    setDisplayedSections((prev) => {
      const all = new Set([...prev, ...newKeys]);
      return UI_SECTION_ORDER.filter((s) => all.has(s));
    });
  }, [activeSections]);

  return (
    <div className="space-y-6 w-full">
      {displayedSections.map((sectionKey) => {
        const Component = SECTION_COMPONENTS[sectionKey];
        return (
          <motion.div
            key={sectionKey}
            variants={sectionVariants}
            initial={showImmediately ? false : 'hidden'}
            animate="visible"
          >
            <Component data={report} />
          </motion.div>
        );
      })}
    </div>
  );
};
