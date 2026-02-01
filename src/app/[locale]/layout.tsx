import '../globals.css';
import { Suspense } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Toaster } from '@/components/ui/sonner';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/ThemeProvider';
import { BackgroundContainer } from '@/components/BackgroundContainer';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { Geist, Geist_Mono, Bitter } from 'next/font/google';
import { Header } from '@/components/Header';
import { Configurator } from '@/components/Configurator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Lamp } from '@/components/Lamp';
import { getBaseUrl } from '@/utils/getBaseUrl';
import { cn } from '@/lib/utils';
import styles from './layout.module.css';
import type { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const bitter = Bitter({
  variable: '--font-bitter',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html lang={locale} dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bitter.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <ReactQueryProvider>
              <div className={styles.mainContainer}>
                <div className={styles.mainContent}>
                  <Configurator />
                  <Lamp />
                  <Suspense fallback={null}>
                    <LanguageSwitcher />
                  </Suspense>
                  <Header />
                  <div className={cn('flex-1 flex w-full max-w-300 mx-auto md:px-4')}>
                    {children}
                  </div>
                </div>
              </div>
              <Toaster position="top-right" richColors closeButton />
            </ReactQueryProvider>
          </ThemeProvider>
          <BackgroundContainer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// https://next-intl.dev/docs/routing/setup#static-rendering
// https://nextjs.org/docs/app/api-reference/functions/generate-static-params#static-rendering
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.pages.default' });

  return {
    metadataBase: new URL(getBaseUrl()),
    title: {
      template: `%s | ${t('brandName')}`,
      default: t('title'),
    },
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: './',
      siteName: t('brandName'),
      images: ['/og-image.png'],
      locale: locale,
      type: 'website',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
    alternates: {
      canonical: '/',
      languages: {
        en: '/en',
        uk: '/uk',
        'x-default': '/en',
      },
    },
  };
}
