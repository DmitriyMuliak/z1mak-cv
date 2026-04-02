import React from 'react';
import { useTranslations } from 'next-intl';
import { TrendingUp } from 'lucide-react';

interface TrajectoryBadgeProps {
  trajectory: string;
  totalYears: number;
}

export const TrajectoryBadge: React.FC<TrajectoryBadgeProps> = ({ trajectory, totalYears }) => {
  const t = useTranslations('pages.cvReport.careerJourney');

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
        <TrendingUp className="size-3.5 text-muted-foreground" />
        {trajectory}
      </span>
      <span className="text-xs text-muted-foreground">
        {t('totalYears', { years: totalYears })}
      </span>
    </div>
  );
};
