import { create } from 'zustand';
import { getResentResumeBaseInfo } from '@/actions/resume/resumeActions';
import { formatToUserDate } from '@/utils/date';
import { paths } from '@/consts/routes';
import { HistoryTag } from '@/features/cv-checker/types';

interface HistoryState {
  history: HistoryTag[];
  isFetching: boolean;
  isFetched: boolean;
  setHistory: (history: HistoryTag[]) => void;
  fetchHistory: (locale: string) => Promise<void>;
}

// TODO: add util for request state handling (flow action) or use Tanstack
export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  isFetching: false,
  isFetched: false,
  setHistory: (history) => set({ history }),
  fetchHistory: async (locale) => {
    if (get().isFetching) {
      return;
    }

    set({ isFetching: true });
    try {
      const list = await getResentResumeBaseInfo();
      const history = list.map((item) => ({
        ...item,
        createdAt: formatToUserDate(item.createdAt, { locale }),
        link: `${paths.cvReport}?jobId=${item.id}`,
      }));
      set({ history, isFetched: true });
    } finally {
      set({ isFetching: false });
    }
  },
}));
