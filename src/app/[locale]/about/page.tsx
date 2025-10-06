import { getTranslations } from 'next-intl/server';
import { AnimatedPhoto } from '@/components/AnimatedPhoto';
import { cn } from '@/lib/utils';
// import ToggleTheme from '@/components/ToggleTheme';

type PageProps = { params: { locale: string } };

export default async function AboutPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return (
    <div className={cn('flex flex-col md:flex-row gap-4')}>
      <div className={cn('md:w-1/2 flex flex-col justify-center ')}>
        <h1 className={cn('text-xl mb-4 md:text-6xl')}>{t('title')}</h1>
        <div>
          <h2 className={cn('text-base mb-4 md:text-2xl')}>{t('description1')}</h2>
          <h3 style={{ whiteSpace: 'pre-line' }} className={cn('text-base mb-4 md:text-2xl')}>
            {t('description2')}
          </h3>
        </div>
      </div>
      <div className={cn('md:w-1/2 h-[250px] sm:h-auto flex flex-col justify-center items-center')}>
        <AnimatedPhoto />
        {/* <ToggleTheme />  */}
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

// fill: #000000;
// fill-opacity: 1;
// stroke: #000000;
// stroke-width: 10.5px;
// stroke-linejoin: round;
// stroke-dasharray: none;
// stroke-opacity: 1;
// transform: scale(1, -1) translate(2px, -10px);
