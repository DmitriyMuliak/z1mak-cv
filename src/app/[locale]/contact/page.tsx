import { getMetadata, MetadataBaseParams } from '@/utils/getPageMetadata';
import { ContactForm } from './ContactForm';

import { getTranslations } from 'next-intl/server';
type PageProps = { params: { locale: string } };

export default async function ContactPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return (
    <div className="flex flex-col w-full pb-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="font-heading text-3xl font-semibold mb-4 text-center">{t('title')}</h2>
        <div className="flex justify-center items-center">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: MetadataBaseParams) {
  return getMetadata({ params, pageKey: 'contact' });
}
