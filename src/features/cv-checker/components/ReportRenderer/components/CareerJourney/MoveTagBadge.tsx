import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUp, Shuffle, ArrowRight, Star, RefreshCw } from 'lucide-react';

type MoveTag = 'Promotion' | 'Pivot' | 'Lateral' | 'First role' | 'Career change';

interface MoveTagBadgeProps {
  tag: string;
}

const CONFIG: Record<
  MoveTag,
  {
    icon: React.FC<{ className?: string }>;
    className: string;
    i18nKey: 'promotion' | 'pivot' | 'lateral' | 'firstRole' | 'careerChange';
  }
> = {
  Promotion: {
    icon: ArrowUp,
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    i18nKey: 'promotion',
  },
  Pivot: {
    icon: Shuffle,
    className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    i18nKey: 'pivot',
  },
  Lateral: {
    icon: ArrowRight,
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    i18nKey: 'lateral',
  },
  'First role': {
    icon: Star,
    className: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    i18nKey: 'firstRole',
  },
  'Career change': {
    icon: RefreshCw,
    className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    i18nKey: 'careerChange',
  },
};

export const MoveTagBadge: React.FC<MoveTagBadgeProps> = ({ tag }) => {
  const t = useTranslations('pages.cvReport.careerJourney.moveTag');
  const cfg = CONFIG[tag as MoveTag];

  if (!cfg) return null;

  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      <Icon className="size-3" />
      {t(cfg.i18nKey)}
    </span>
  );
};
