import { Suspense } from 'react';
import { paths } from '@/consts/routes';
import { ReportRenderer } from '@/features/cv-checker/components/ReportRenderer';
import { redirect } from '@/i18n/navigation';
import { getMetadata, MetadataBaseParams } from '@/utils/getPageMetadata';
import { getResumeResult, getResumeStatus } from '@/actions/resume/resumeActions';
import { ReportSkeleton } from '@/features/cv-checker/components/ReportRenderer/components/ReportSkeleton';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ jobId?: string }>;
};

async function fetchInitialResumeData(jobId: string) {
  const statusRes = await getResumeStatus(jobId);

  if (!statusRes.success) return {};

  const status = statusRes.data;

  if (status.status === 'completed') {
    const resultRes = await getResumeResult(jobId);
    if (resultRes.success && resultRes.data.data) {
      return {
        status,
        report: resultRes.data.data,
      };
    }
  }

  return { status };
}

export default async function CVCheckerAnalysis(props: Props) {
  const [{ locale }, { jobId }] = await Promise.all([props.params, props.searchParams]);

  if (!jobId) {
    return redirect({ href: paths.cvChecker, locale });
  }

  const pollingPromise = fetchInitialResumeData(jobId);

  return (
    <Suspense fallback={<ReportSkeleton />}>
      <ReportRenderer pollingPromise={pollingPromise} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: MetadataBaseParams) {
  return getMetadata({ params, pageKey: 'cvReport', absolute: true });
}
