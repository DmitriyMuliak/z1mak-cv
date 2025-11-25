'use client';

import React from 'react';
import { useCvStore } from '@/feature/store/useCvStore';
import { AnalysisSchemaType } from '../../schema/analysisSchema';
import { Header } from './Header';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { RedFlags } from './RedFlags';
import { Improvements } from './Improvements';
import { InterviewQuestions } from './InterviewQuestions';

type Props = {
  data: AnalysisSchemaType;
};

export const AnalysisResult: React.FC<Props> = ({ data }) => {
  const { newJobMode } = useCvStore();
  // const { newJobMode, lastReport } = useCvStore();
  // console.log('lastReport', lastReport);
  console.log('newJobMode', newJobMode);
  const isDeep = newJobMode.depth === 'deep';
  const isByJob = newJobMode.evaluationMode === 'byJob';
  const isHardMode = isByJob && isDeep;

  const lastReport = data;

  if (lastReport === null) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Header data={lastReport} />
      {isHardMode && <Skills data={lastReport} />}
      {isByJob && <Experience data={lastReport} />}
      <RedFlags data={lastReport} />
      {(isHardMode || isDeep) && <Improvements data={lastReport} />}
      {isHardMode && <InterviewQuestions data={lastReport} />}
    </div>
  );
};
