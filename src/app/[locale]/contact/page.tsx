import { ContactForm } from './ContactForm';

import { getTranslations } from 'next-intl/server';
type PageProps = { params: { locale: string } };

export default async function ContactPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return (
    <div className="md:p-8">
      <h2 className="font-heading text-3xl font-semibold mb-4">{t('title')}</h2>
      <div className="flex justify-center items-center">
        <ContactForm />
      </div>
    </div>
  );
}
