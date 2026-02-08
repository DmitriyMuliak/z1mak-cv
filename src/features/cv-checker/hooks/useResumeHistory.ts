import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { getResentResumeBaseInfo } from '@/actions/resume/resumeActions';
import { formatToUserDate } from '@/utils/date';
import { paths } from '@/consts/routes';
import { HistoryTag } from '@/features/cv-checker/types';

export const useResumeHistory = (isOpen: boolean) => {
  const locale = useLocale();

  const query = useQuery<HistoryTag[], Error>({
    queryKey: ['resume:history', locale],
    enabled: isOpen,
    queryFn: async () => {
      const list = await getResentResumeBaseInfo();
      return list.map((item) => ({
        ...item,
        createdAt: formatToUserDate(item.createdAt, { locale }),
        link: `${paths.cvReport}?jobId=${item.id}`,
      }));
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading && query.fetchStatus !== 'idle',
    isRefreshing: query.isRefetching,
    error: query.error,
  };
};
