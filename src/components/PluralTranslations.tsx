import { useTranslations } from 'next-intl';

export default function PluralTranslateExample({ count }: { count: number }) {
  const t = useTranslations('examples');

  // count — змінна з числом.
  // one {# товар} — для 1.
  // few {# товари} — для 2,3,4.
  // many {# товарів} — для 5,6… та 11-14.
  // other — резервна форма (іноді для дробів).

  return <p>{t('pluralTranslationExample', { count })}</p>;
}
