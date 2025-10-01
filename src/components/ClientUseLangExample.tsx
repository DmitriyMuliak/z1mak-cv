'use client';
import { useTranslations } from 'next-intl';

export const ClientUseLangExample: React.FC = () => {
  const t = useTranslations('header.menu');
  return <h1>{t('aboutTitle')} Client Component</h1>;
};
