import React from 'react';
import { useTranslations } from 'next-intl';
import { AnalysisSchemaType } from '../../../../schema/analysisSchema';

export const Metrics: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const qm = data.quantitativeMetrics;

  return (
    <div className="grid items-start">
      <h4 className="text-sm font-medium mb-2">{t('metrics.title')}</h4>
      <div className="text-sm grid gap-2">
        <div>
          {t('metrics.totalYears')} <strong>{qm.totalYearsInCV}</strong>
        </div>
        <div>
          {t('metrics.relevantYears')} <strong>{qm.relevantYearsInCV}</strong>
        </div>
        {qm.requiredYearsInJob !== undefined && (
          <div>
            {t('metrics.requiredYears')} <strong>{qm.requiredYearsInJob}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
