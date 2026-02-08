import React from 'react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const arrStub = Array.from({ length: 6 });

export const HistoryLoadingState = () => {
  return (
    <div className="h-72 w-full rounded border">
      <div className="p-4">
        {arrStub.map((_, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Separator className="my-2 last:hidden" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const HistoryEmptyState = () => {
  const t = useTranslations('components.historyModal');
  return <div className="p-2 h-72 flex items-center justify-center ">{t('noHistory')}</div>;
};
