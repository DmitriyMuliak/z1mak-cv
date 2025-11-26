'use client';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useEffect } from 'react';

export const RealtimeJobListener: React.FC<{
  jobId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onResult: (r: any) => void;
  onStatus?: (s: string) => void;
}> = ({ jobId, onResult, onStatus }) => {
  useEffect(() => {
    if (!jobId) return;
    const channel = supabaseBrowser
      .channel(`public:jobs:id=${jobId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` },
        (payload) => {
          const newRow = payload.new;
          onStatus?.(newRow.status);
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'job_results', filter: `job_id=eq.${jobId}` },
        (payload) => {
          onResult?.(payload.new.result);
        },
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [jobId, onResult, onStatus]);
  return null;
};
