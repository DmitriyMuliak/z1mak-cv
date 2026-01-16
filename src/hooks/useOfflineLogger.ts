import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { toast } from 'sonner';

const toastId = 'looksLikeNetworkIssue';

export const useOfflineLogger = () => {
  const t = useTranslations('common');
  useEffect(() => {
    const handleOffline = () => {
      toast.error(t('looksLikeNetworkIssue'), { id: toastId, duration: 2000 });
    };

    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
};
