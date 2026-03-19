import React, { PropsWithChildren } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = PropsWithChildren<{
  title: React.ReactNode;
  /** Optional element rendered on the right side of the card header. */
  action?: React.ReactNode;
  className?: string;
}>;

export const ReportSection: React.FC<Props> = ({ title, children, action, className }) => {
  return (
    <Card className={`frosted-card ${className ?? ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
