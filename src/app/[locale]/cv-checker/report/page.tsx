import { paths } from '@/consts/routes';
import { ReportRenderer } from '@/features/cv-checker/components/ReportRenderer';
import { redirect } from '@/i18n/navigation';
import { getMetadata, MetadataBaseParams } from '@/utils/getPageMetadata';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ jobId?: string }>;
};

export default async function CVCheckerAnalysis(props: Props) {
  const [{ locale }, { jobId }] = await Promise.all([props.params, props.searchParams]);

  if (!jobId) {
    redirect({ href: paths.cvChecker, locale });
  }

  return (
    <>
      <ReportRenderer />
    </>
  );
}

export async function generateMetadata({ params }: MetadataBaseParams) {
  return getMetadata({ params, pageKey: 'cvReport', absolute: true });
}
