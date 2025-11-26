import React from 'react';
import { InfoRow } from './InfoRow';

type Props = {
  label: string;
  value: boolean | undefined | null;
  trueText?: string;
  falseText?: string;
};

export const BooleanRow: React.FC<Props> = ({
  label,
  value,
  trueText = 'Yes',
  falseText = 'No',
}) => {
  if (value === null || value === undefined) return null;
  return <InfoRow label={label} value={value ? trueText : falseText} />;
};
