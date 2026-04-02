'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/shallow';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Improvements } from './Improvements';
import { InterviewQuestions } from './InterviewQuestions';
import { ImprovementsSkeleton, InterviewQuestionsSkeleton } from './ReportSkeleton';
import { AtsKeywords } from './AtsKeywords';
import { CareerJourney } from './CareerJourney';
import { cn } from '@/lib/utils';

type TabId = 'overview' | 'improvements' | 'questions';

interface Tab {
  id: TabId;
  enabled: boolean;
}

interface ReportTabsProps {
  children: React.ReactNode;
}

export const ReportTabs: React.FC<ReportTabsProps> = ({ children }) => {
  const t = useTranslations('pages.cvReport.tabs');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set(['overview']));

  const { hasImprovementsTab, hasQuestionsTab, isStreamDone } = useAnalysisStore(
    useShallow((s) => ({
      hasImprovementsTab:
        !!s.data.actionableImprovementPlan ||
        (Array.isArray(s.data.atsKeywordMatrix?.keywords) &&
          s.data.atsKeywordMatrix!.keywords.length > 0),
      hasQuestionsTab:
        (Array.isArray(s.data.careerJourney?.positions) &&
          s.data.careerJourney!.positions.length > 0) ||
        (Array.isArray(s.data.suggestedInterviewQuestions?.questions) &&
          s.data.suggestedInterviewQuestions!.questions.length > 0),
      isStreamDone: s.status === 'completed' || s.status === 'failed',
    })),
  );

  const tabs: Tab[] = [
    { id: 'overview', enabled: true },
    { id: 'improvements', enabled: hasImprovementsTab },
    { id: 'questions', enabled: hasQuestionsTab },
  ];

  const tabLabel: Record<TabId, string> = {
    overview: t('overview'),
    improvements: t('improvements'),
    questions: t('questions'),
  };

  const handleTabClick = (tab: Tab) => {
    if (!tab.enabled) return;
    setActiveTab(tab.id);
    if (!visitedTabs.has(tab.id)) {
      setVisitedTabs((prev) => new Set([...prev, tab.id]));
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="frosted-card flex gap-1 p-1" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = !tab.enabled;

          const isLoadingSkeleton = isDisabled && tab.id !== 'overview' && !isStreamDone;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              aria-label={isLoadingSkeleton ? `${tabLabel[tab.id]} — loading` : undefined}
              disabled={isDisabled}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'flex-1 rounded-[14px] px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive && !isDisabled
                  ? 'bg-white/15 text-foreground shadow-sm'
                  : isDisabled
                    ? 'cursor-not-allowed opacity-35'
                    : 'text-muted-foreground hover:bg-white/8 hover:text-foreground',
              )}
            >
              {isLoadingSkeleton ? <Skeleton className="mx-auto h-4 w-3/4" /> : tabLabel[tab.id]}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        <div key="overview" hidden={activeTab !== 'overview'}>
          {children}
        </div>

        {visitedTabs.has('improvements') && (
          <div key="improvements" hidden={activeTab !== 'improvements'}>
            {hasImprovementsTab ? (
              <div className="space-y-4">
                <AtsKeywords />
                <Improvements />
              </div>
            ) : (
              <ImprovementsSkeleton />
            )}
          </div>
        )}

        {visitedTabs.has('questions') && (
          <div key="questions" hidden={activeTab !== 'questions'}>
            {hasQuestionsTab ? (
              <div className="space-y-4">
                <CareerJourney />
                <InterviewQuestions />
              </div>
            ) : (
              <InterviewQuestionsSkeleton />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
