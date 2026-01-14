import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';
import { ScoreBar } from '../../../ScoreBar';

export const Skills: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const qm = data.quantitativeMetrics;
  const isKeyCoverage = qm.keySkillCoveragePercent !== undefined;
  const isStackRecency = qm.stackRecencyScore !== undefined;
  const isSoftMatch = qm.softSkillsScore !== undefined;

  if (!isKeyCoverage && !isStackRecency && !isSoftMatch) {
    return null;
  }

  return (
    <div className="grid items-start">
      <h4 className="text-sm font-medium mb-2">{t('skills.title')}</h4>
      <div className="grid gap-2">
        {isKeyCoverage && (
          <ScoreBar label={t('skills.keyCoverage')} value={qm.keySkillCoveragePercent as number} />
        )}
        {isStackRecency && (
          <ScoreBar label={t('skills.stackRecency')} value={qm.stackRecencyScore as number} />
        )}
        {isSoftMatch && (
          <ScoreBar label={t('skills.softMatch')} value={qm.softSkillsScore as number} />
        )}
      </div>
    </div>
  );
};
