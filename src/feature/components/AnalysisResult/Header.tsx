'use client';

import React from 'react';
import { AnalysisSchemaType } from '../../schema/analysisSchema';
import { ScoreBar } from '../ScoreBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { generateAndDownloadDocxReport } from '../../utils/generateReportHtml';
import { useTranslations } from 'next-intl';
import { downloadJson } from '@/utils/downloadFiles/downloadJson';

type Props = {
  data: AnalysisSchemaType;
};

export const Header: React.FC<Props> = ({ data }) => {
  const t = useTranslations('pages.cvReport');
  const oa = data.overallAnalysis;
  const qm = data.quantitativeMetrics;
  const renderOverAllBoolean = (value: boolean) => (value ? t('overall.yes') : t('overall.no'));

  return (
    <Card className="frosted-card">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 md:gap-4">
          <div>
            <div className="text-sm text-muted-foreground">{t('overall.matchScore')}</div>
            <div className="text-3xl font-bold">{oa.matchScore}</div>
            <div className="mt-2 text-sm">{oa.suitabilitySummary}</div>
          </div>

          <Separator className="my-4 md:hidden" />

          <div>
            <h4 className="text-sm font-medium mb-6">{t('overall.fitAssessment')}</h4>
            <div className="grid gap-2">
              <div className="flex text-sm">
                <span className="block min-w-[150px] pr-2">{t('overall.candidateLevel')}</span>
                <strong>{oa.candidateLevel}</strong>
              </div>
              <div className="flex text-sm">
                <span className="block min-w-[150px] pr-2">{t('overall.jobTargetLevel')}</span>
                <strong>{oa.jobTargetLevel}</strong>
              </div>
              <div className="flex text-sm">
                <span className="block min-w-[150px] pr-2">{t('overall.levelMatch')}</span>
                <strong>{renderOverAllBoolean(oa.levelMatch)}</strong>
              </div>
              <div className="flex text-sm">
                <span className="block min-w-[150px] pr-2">{t('overall.educationMatch')}</span>
                <strong>{renderOverAllBoolean(oa.educationMatch)}</strong>
              </div>
              <div className="flex text-sm">
                <span className="block min-w-[150px] pr-2">{t('overall.jobHoppingFlag')}</span>
                <strong>{renderOverAllBoolean(oa.jobHoppingFlag)}</strong>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid md:grid-cols-3 md:gap-4 items-start">
          <div>
            <h4 className="text-sm font-medium mb-2">{t('metrics.title')}</h4>
            <div className="text-sm grid gap-2">
              <div>
                {t('metrics.totalYears')} <strong>{qm.totalYearsInCV}</strong>
              </div>
              <div>
                {t('metrics.relevantYears')} <strong>{qm.relevantYearsInCV}</strong>
              </div>
              <div>
                {t('metrics.requiredYears')} <strong>{qm.requiredYearsInJob}</strong>
              </div>
            </div>
          </div>

          <Separator className="my-4 md:hidden" />

          <div>
            <h4 className="text-sm font-medium mb-2">{t('skills.title')}</h4>
            <div className="grid gap-2">
              <ScoreBar
                label={t('skills.keyCoverage')}
                value={data.quantitativeMetrics.keySkillCoveragePercent}
              />
              <ScoreBar
                label={t('skills.stackRecency')}
                value={data.quantitativeMetrics.stackRecencyScore}
              />
              <ScoreBar
                label={t('skills.softMatch')}
                value={data.quantitativeMetrics.softSkillsScore}
              />
            </div>
          </div>

          <Separator className="my-4 md:hidden" />

          <div className="grid h-full">
            <h4 className="text-sm font-medium mb-2">{t('export.title')}</h4>
            <div className="grid gap-2 items-end">
              <div>
                <Button className="w-full" onClick={() => downloadJson(data, 'cv-report')}>
                  {t('export.downloadJson')}
                </Button>
              </div>
              <div>
                <Button className="w-full" onClick={() => generateAndDownloadDocxReport(data)}>
                  {t('export.downloadDoc')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
