import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';

type Props = {
  qm: AnalysisSchemaType['quantitativeMetrics'] | undefined;
};

export const Metrics: React.FC<Props> = ({ qm }) => {
  const t = useTranslations('pages.cvReport');
  if (!qm) {
    return null;
  }

  return (
    <div className="grid items-start">
      <h4 className="text-sm font-medium mb-2">{t('metrics.title')}</h4>
      <div className="text-sm grid gap-2">
        <div>
          {t('metrics.totalYears')} <strong>{qm.totalYearsInCV}</strong>
        </div>
        {qm.relevantYearsInCV !== undefined && (
          <div>
            {t('metrics.relevantYears')} <strong>{qm.relevantYearsInCV}</strong>
          </div>
        )}
        {qm.requiredYearsInJob !== undefined && (
          <div>
            {t('metrics.requiredYears')} <strong>{qm.requiredYearsInJob}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
