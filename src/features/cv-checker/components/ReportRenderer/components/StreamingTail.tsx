'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';

export const StreamingTail: React.FC = () => {
  const t = useTranslations('pages.cvReport');
  const isStreaming = useAnalysisStore(
    (s) => s.status !== 'completed' && s.status !== 'failed' && s.status !== 'idle',
  );

  return (
    <AnimatePresence>
      {isStreaming && (
        <motion.div
          className="flex items-center gap-2 px-1 py-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
          // transition={{ layout: { duration: 0.3 } }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs text-muted-foreground">{t('generating')}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
