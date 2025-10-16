import { TermsOfService } from './TermsOfService';
import { Messages } from './types';

type Props = {
  params: { locale: string };
};

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params;
  const messages = (await import(`./locales/${locale}.json`)).default as Messages;

  return <TermsOfService messages={messages.TermsOfService} />;
}

// export const dynamic = 'force-static';

// export async function generateStaticParams() {
//   const locales = ['en', 'uk'];
//   return locales.map((locale) => ({locale}));
// }

// export async function generateMetadata({params}: {params: {locale: string}}) {
//   const messages = (await import(`./locales/${params.locale}.json`)).default;
//   return {messages};
// }
