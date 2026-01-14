import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCvStore } from '../store/useCvStore';
import { supabaseBrowser } from '@/lib/supabase/client';

export const HistoryList: React.FC<{ userId: string }> = ({ userId }) => {
  const { jobs, setJobs, setCurrentJobId } = useCvStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabaseBrowser
        .from('cv_analyzes')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['completed', 'failed', 'processing'])
        .order('created_at', { ascending: false })
        .limit(5);
      if (!mounted) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data) setJobs(data as any);
    })();
    return () => {
      mounted = false;
    };
  }, [userId, setJobs]);

  return (
    <div className="space-y-2">
      {jobs.map((j) => (
        <div key={j.id} className="p-2 border rounded flex justify-between items-center">
          <div>
            <div className="text-sm font-medium">{j.id}</div>
            <div className="text-xs text-muted-foreground">
              {j.status} • {new Date(j.created_at).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCurrentJobId(j.id)}>
              Open
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
