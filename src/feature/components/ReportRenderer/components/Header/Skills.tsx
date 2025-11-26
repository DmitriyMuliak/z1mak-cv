import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import { ScoreBar } from '../../../ScoreBar';

export const Skills: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const qm = data.quantitativeMetrics;

  return (
    <div className="grid items-start">
      <h4 className="text-sm font-medium mb-2">{t('skills.title')}</h4>
      <div className="grid gap-2">
        <ScoreBar label={t('skills.keyCoverage')} value={qm.keySkillCoveragePercent} />

        {qm.stackRecencyScore !== undefined && (
          <ScoreBar label={t('skills.stackRecency')} value={qm.stackRecencyScore} />
        )}
        {qm.softSkillsScore !== undefined && (
          <ScoreBar label={t('skills.softMatch')} value={qm.softSkillsScore} />
        )}
      </div>
    </div>
  );
};
