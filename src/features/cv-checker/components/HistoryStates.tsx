import { useTranslations } from 'next-intl';

export const HistoryLoadingState = () => {
  const t = useTranslations('components.historyModal');
  return (
    <div className="animate-pulse rounded h-72 flex items-center justify-center bg-muted/10">
      <span className="text-muted-foreground">{t('loading')}</span>
    </div>
  );
};

export const HistoryEmptyState = () => {
  const t = useTranslations('components.historyModal');
  return (
    <div className="p-2 h-72 flex items-center justify-center text-muted-foreground">
      {t('noHistory')}
    </div>
  );
};
