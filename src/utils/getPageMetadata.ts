import { getTranslations } from 'next-intl/server';
import { MessagesBase } from '@/types/translations';
import type { Metadata } from 'next';

export type MetadataBaseParams = {
  params: Promise<{ locale: string }>;
};

type MetadataProps = {
  params: Promise<{ locale: string }>;
  pageKey: keyof MessagesBase['metadata']['pages'];
  absolute?: boolean;
};

export async function getMetadata({ params, pageKey, absolute }: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.pages' });

  const title = t(`${pageKey}.title`);
  const titleSettings = absolute ? { title: { absolute: title } } : { title };

  return {
    ...titleSettings,
    description: t(`${pageKey}.description`),
    openGraph: {
      title: t(`${pageKey}.title`),
      description: t(`${pageKey}.description`),
    },
  };
}
