import { getTranslations } from 'next-intl/server';
import { AnimatedPhoto } from '@/components/AnimatedPhoto';
import { cn } from '@/lib/utils';

type PageProps = { params: { locale: string } };

export default async function AboutPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return (
    <div className={cn('flex flex-col sm:flex-row gap-4')}>
      <div className={cn('sm:w-1/2 flex flex-col justify-center ')}>
        <h1 className={cn('text-xl mb-4 md:text-4xl lg:text-7xl font-heading whitespace-pre-line')}>
          {t.rich('title', {
            name: (chunks) => (
              <span className={cn('font-bold text-[oklch(0.35_0_0)] dark:text-[oklch(0.75_0_0)]')}>
                {chunks}
              </span>
            ),
          })}
        </h1>
        <div>
          <h2 className={cn('text-base mb-4 md:text-lg lg:text-2xl font-heading')}>
            {t('description1')}
          </h2>
          <h3
            className={cn('text-base mb-4 md:text-lg lg:text-2xl font-heading whitespace-pre-line')}
          >
            {t('description2')}
          </h3>
        </div>
      </div>
      <div
        className={cn(
          'sm:w-1/2 h-[250px] sm:h-[350px] md:h-auto lg:max-h-[600px] flex flex-col justify-center items-center',
        )}
      >
        <AnimatedPhoto />
      </div>
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
