import React, { useMemo } from 'react';
import { AnalysisSchemaType } from '@/features/cv-checker/schema/analysisSchema';
import { SchemaService } from '@/features/cv-checker/services/SchemaService';
import { AnimationContainer } from '@/components/AnimatedContainer';
import { SECTION_COMPONENTS } from '../config';

interface Props {
  report: AnalysisSchemaType;
  jobId: string | null;
}

export const ReportContent: React.FC<Props> = ({ report, jobId }) => {
  const activeSections = useMemo(() => {
    const service = new SchemaService(report);
    return service.getUiSections();
  }, [report]);

  return (
    <AnimationContainer id={`${jobId}:result`}>
      <div className="space-y-6 w-full">
        {activeSections.map((sectionKey) => {
          const Component = SECTION_COMPONENTS[sectionKey];
          return <Component key={sectionKey} data={report} />;
        })}
      </div>
    </AnimationContainer>
  );
};
