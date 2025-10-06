import { redirect } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RootPage({ params }: Props) {
  const { locale } = await params;
  // If there's no locale in the URL, use the browser's language.
  // If it's not supported, fall back to 'en'.
  redirect({ href: `/about`, locale });
}
