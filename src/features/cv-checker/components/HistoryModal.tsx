'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { AnimationContainer } from '@/components/AnimatedContainer';
import { useResumeHistory } from '@/features/cv-checker/hooks/useResumeHistory';
import { HistoryList } from './HistoryList';
import { HistoryLoadingState, HistoryEmptyState } from './HistoryStates';

export function HistoryModal() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('components.historyModal');
  const { history, isLoading, isRefreshing } = useResumeHistory(open);

  const hasHistory = history.length > 0;

  return (
    <ResponsiveDialog
      isOpen={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="mb-8" data-testid="history-button">
          {t('trigger')}
        </Button>
      }
      title={t('title')}
      description={t('description')}
      isLoading={isRefreshing}
    >
      <AnimationContainer id="tag-history-list">
        {isLoading ? (
          <HistoryLoadingState />
        ) : hasHistory ? (
          <HistoryList tags={history} onItemClick={() => setOpen(false)} />
        ) : (
          <HistoryEmptyState />
        )}
      </AnimationContainer>
    </ResponsiveDialog>
  );
}
