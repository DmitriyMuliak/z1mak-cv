'use client';

import { useTemplateSettingsStore } from '../../store/templateSettingsStore';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PageSelectProps {
  selectedPage: number;
  onSelect: (page: number) => void;
}

export function PageSelect({ selectedPage, onSelect }: PageSelectProps) {
  const pageCount = useTemplateSettingsStore((s) => s.pageCount);

  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 mb-3">
      <span className="text-xs text-muted-foreground">Page:</span>
      <Select value={String(selectedPage)} onValueChange={(v) => onSelect(Number(v))}>
        <SelectTrigger className="w-full max-w-15">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Array.from({ length: pageCount }, (_, i) => (
              <SelectItem key={i} value={String(i)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
