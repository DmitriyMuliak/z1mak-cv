'use client';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useRouter, usePathname } from '@/navigation';
import { routing } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const changeLanguage = (newLocale: string) => {
    router.replace({ pathname }, { locale: newLocale });
  };

  return (
    <Select onValueChange={changeLanguage} defaultValue={locale}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            {l === 'en' ? 'English' : 'Українська'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
