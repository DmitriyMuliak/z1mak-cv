'use client';

import { Button } from '@/components/ui/button';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { AnalysisSchemaType } from '@/features/cv-checker/schema/analysisSchema';
import { generateAndDownloadDocxReport } from '@/features/cv-checker/utils/generateReportHtml';
import { downloadJson } from '@/utils/downloadFiles/downloadJson';
import { useLocale, useTranslations } from 'next-intl';

export const ExportActions: React.FC = () => {
  const t = useTranslations('pages.cvReport');
  const locale = useLocale();
  const data = useAnalysisStore((s) => s.data) as AnalysisSchemaType;
  const { metadata, ...result } = data;

  return (
    <div className="grid h-full">
      <h4 className="text-sm font-medium mb-2">{t('title')}</h4>
      <div className="grid gap-2 items-end">
        <div>
          <Button className="w-full" onClick={() => downloadJson(result, 'cv-report')}>
            {t('export.downloadJson')}
          </Button>
        </div>
        <div>
          <Button
            className="w-full"
            onClick={() => generateAndDownloadDocxReport(result, locale, t)}
          >
            {t('export.downloadDoc')}
          </Button>
        </div>
      </div>
    </div>
  );
};
