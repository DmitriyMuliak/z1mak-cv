import { getTranslations } from 'next-intl/server';
// import { AnimatedPhoto } from '@/components/AnimatedPhoto';
import { cn } from '@/lib/utils';
// import { Link } from '@/i18n/navigation';
// import { paths } from '@/consts/routes';
import { getMetadata, MetadataBaseParams } from '@/utils/getPageMetadata';

type PageProps = { params: { locale: string } };

export default async function AboutPage(props: PageProps) {
  const { locale } = await props.params;
  const _t = await getTranslations({ locale, namespace: 'pages.about' });

  return <div className={cn('flex flex-col w-full sm:flex-row gap-4')}></div>;
}

export async function generateMetadata({ params }: MetadataBaseParams) {
  return getMetadata({ params, pageKey: 'about' });
}
