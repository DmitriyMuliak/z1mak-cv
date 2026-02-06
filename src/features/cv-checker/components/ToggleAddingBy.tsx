'use client';

import { TextInitial, FileText } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslations } from 'next-intl';

interface Props {
  onValueChange: (value: string) => void;
  value?: string;
}

export const ToggleAddingBy: React.FC<Props> = (props) => {
  const t = useTranslations('pages.cvChecker.common');

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      spacing={2}
      size="sm"
      value={props.value}
      defaultValue="file"
      onValueChange={props.onValueChange}
    >
      <ToggleGroupItem
        value="file"
        aria-label="Toggle text"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 transition-colors"
      >
        <FileText />
        {t('fileTitle')}
      </ToggleGroupItem>
      <span>{t('orTitle')}</span>
      <ToggleGroupItem
        value="text"
        aria-label="Toggle files"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-blue-500 transition-colors"
      >
        <TextInitial />
        {t('textTitle')}
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
