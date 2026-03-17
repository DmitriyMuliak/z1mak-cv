import React, { useMemo } from 'react';
import { AnalysisSchemaType } from '@/features/cv-checker/schema/analysisSchema';
import { SchemaService } from '@/features/cv-checker/services/SchemaService';
import { AnimationContainer } from '@/components/AnimatedContainer';
import { SECTION_COMPONENTS } from '../config';

interface Props {
  report: AnalysisSchemaType;
}

export const ReportContent: React.FC<Props> = ({ report }) => {
  const activeSections = useMemo(() => {
    const service = new SchemaService(report);
    return service.getUiSections();
  }, [report]);

  return (
    <div className="space-y-6 w-full">
      {activeSections.map((sectionKey) => {
        const Component = SECTION_COMPONENTS[sectionKey];
        return (
          <AnimationContainer key={sectionKey} id={sectionKey}>
            <Component data={report} />
          </AnimationContainer>
        );
      })}
    </div>
  );
};
