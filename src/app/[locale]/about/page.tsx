import { getTranslations } from 'next-intl/server';
import { ClientUseLangExample } from '@/components/ClientUseLangExample';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import ToggleTheme from '@/components/ToggleTheme';

type PageProps = { params: { locale: string } }

export default async function AboutPage(props: PageProps) {
  const {locale} = await props.params;
  const t = await getTranslations({locale, namespace: 'header.menu'});

  return <div>
    <h1>{t('aboutTitle')}</h1>
    <ClientUseLangExample />
    <LanguageSwitcher />
    <ToggleTheme />
  </div>;
};

type MetadataParams = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: MetadataParams) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.pages.about'});

  return {
    title: t('title'),
    description: t('description')
  };
}
