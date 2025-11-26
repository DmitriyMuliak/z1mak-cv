import { Button } from '@/components/ui/button';
import { AnalysisSchemaType } from '@/feature/schema/analysisSchema';
import { generateAndDownloadDocxReport } from '@/feature/utils/generateReportHtml';
import { downloadJson } from '@/utils/downloadFiles/downloadJson';
import { useTranslations } from 'next-intl';

export const ExportActions: React.FC<{ data: AnalysisSchemaType }> = ({ data }) => {
  const t = useTranslations('pages.cvReport.export');

  return (
    <div className="grid h-full">
      <h4 className="text-sm font-medium mb-2">{t('title')}</h4>
      <div className="grid gap-2 items-end">
        <div>
          <Button className="w-full" onClick={() => downloadJson(data, 'cv-report')}>
            {t('downloadJson')}
          </Button>
        </div>
        <div>
          <Button className="w-full" onClick={() => generateAndDownloadDocxReport(data)}>
            {t('downloadDoc')}
          </Button>
        </div>
      </div>
    </div>
  );
};
