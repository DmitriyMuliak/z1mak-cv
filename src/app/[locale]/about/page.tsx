import { getTranslations } from 'next-intl/server';
import { ClientUseLangExample } from '@/components/ClientUseLangExample';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import ToggleTheme from '@/components/ToggleTheme';
import { AnimatedPhoto } from '@/components/AnimatedPhoto';

type PageProps = { params: { locale: string } };

export default async function AboutPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'header.menu' });

  return (
    <div>
      <h1>{t('aboutTitle')}</h1>
      <ClientUseLangExample />
      <LanguageSwitcher />
      <ToggleTheme />
      <AnimatedPhoto />
    </div>
  );
}

type MetadataParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: MetadataParams) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.pages.about' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

// fill: #000000;
// fill-opacity: 1;
// stroke: #000000;
// stroke-width: 10.5px;
// stroke-linejoin: round;
// stroke-dasharray: none;
// stroke-opacity: 1;
// transform: scale(1, -1) translate(2px, -10px);
