import React, { PropsWithChildren } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = PropsWithChildren<{
  title: React.ReactNode;
  className?: string;
}>;

export const ReportSection: React.FC<Props> = ({ title, children, className }) => {
  return (
    <Card className={`frosted-card ${className ?? ''}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
