'use client';

import React, { useMemo } from 'react';
import { Mode, useCvStore } from '@/feature/store/useCvStore';
import { AnalysisSchemaType } from '../../schema/analysisSchema';
import { Header } from './components/Header';
import { Skills } from './components/Skills';
import { Experience } from './components/Experience';
import { RedFlags } from './components/RedFlags';
import { Improvements } from './components/Improvements';
import { InterviewQuestions } from './components/InterviewQuestions';
import { SchemaService, UiSectionKey } from '../../services/SchemaService';
// import { mockEmptyAnalysisData } from '@/feature/mokcs/mockAnalysisData';

const SECTION_COMPONENTS: Record<UiSectionKey, React.FC<{ data: AnalysisSchemaType }>> = {
  header: Header,
  skills: Skills,
  experience: Experience,
  redFlags: RedFlags,
  improvements: Improvements,
  questions: InterviewQuestions,
};

type Props = {
  mode?: Mode;
};

export const ReportRenderer: React.FC<Props> = () => {
  const { newJobMode, lastReport } = useCvStore();

  const activeSections = useMemo(() => {
    const service = new SchemaService(newJobMode);
    service;
    return service.getUiSections(lastReport);
  }, [newJobMode, lastReport]);

  if (!lastReport) return null;

  return (
    <div className="space-y-6">
      {activeSections.map((sectionKey) => {
        const Component = SECTION_COMPONENTS[sectionKey];
        return <Component key={sectionKey} data={lastReport} />;
      })}
    </div>
  );
};
