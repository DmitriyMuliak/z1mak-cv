import React from 'react';

type Props = {
  label: string;
  value: React.ReactNode | null | undefined;
  className?: string;
};

export const InfoRow: React.FC<Props> = ({ label, value, className }) => {
  if (value === null || value === undefined) return null;

  return (
    <div className={`flex text-sm ${className ?? ''}`}>
      <span className="block min-w-[150px] pr-2 text-muted-foreground">{label}</span>
      <strong className="text-foreground">{value}</strong>
    </div>
  );
};
