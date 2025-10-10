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
    <div className="absolute top-[20px] lg:top-[72px] right-0 text-white">
      <Select onValueChange={changeLanguage} defaultValue={locale}>
        <SelectTrigger className="w-[120px] cursor-pointer frosted-card">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent className=" m-0 p-0">
          {routing.locales.map((l) => (
            <SelectItem key={l} value={l}>
              {l === 'en' ? 'English' : 'Українська'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
