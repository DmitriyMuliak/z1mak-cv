import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../schema/analysisSchema';
import { ReportSection } from './ui/ReportSection';

export const Skills: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const skills = data.detailedSkillAnalysis?.skills;

  if (!skills || skills.length === 0) return null;

  return (
    <ReportSection title={t('skills.analysisTitle')}>
      <div className="space-y-3">
        {skills.map((s, idx) => (
          <div key={idx} className="p-3 border rounded hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {s.skill}
                  {/* Badge for status? */}
                </div>
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
        ))}
      </div>
    </ReportSection>
  );
};
