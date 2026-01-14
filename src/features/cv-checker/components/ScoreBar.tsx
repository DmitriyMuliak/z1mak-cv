import React from 'react';

type Props = {
  label: string;
  value: number; // 0..100
};

export const ScoreBar: React.FC<Props> = ({ label, value }) => {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm">{safe}%</span>
      </div>
      <div className="w-full h-3 bg-muted rounded overflow-hidden">
        <div
          className="h-3 rounded"
          style={{
            width: `${safe}%`,
            background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
          }}
        />
      </div>
    </div>
  );
};
