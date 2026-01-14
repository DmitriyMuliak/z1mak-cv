import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type ModeOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value: string;
  options: ModeOption[];
  onValueChange: (value: string) => void;
  contentClassName?: string;
};

export const ModeSelect: React.FC<Props> = ({
  label,
  value,
  options,
  onValueChange,
  contentClassName,
}) => {
  return (
    <div className="flex gap-2 items-center w-full md:w-auto">
      <span className="text-md">{label}</span>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="min-w-[128px] cursor-pointer frosted-card w-full md:w-auto [&_svg:not([class*='text-'])]:text-current [&_svg:not([class*='text-'])]:opacity-100">
          <SelectValue placeholder={value} />
        </SelectTrigger>

        <SelectContent className={cn('z-[9999] frosted-card !rounded-[10px]', contentClassName)}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
