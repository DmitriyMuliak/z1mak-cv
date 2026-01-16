import { CvCheckerStartFlow } from '@/features/cv-checker/CvCheckerStartFlow';
import { getMetadata, MetadataBaseParams } from '@/utils/getPageMetadata';

export default async function CVCheckerPage() {
  return (
    <>
      <CvCheckerStartFlow />
    </>
  );
}

export async function generateMetadata({ params }: MetadataBaseParams) {
  return getMetadata({ params, pageKey: 'cvChecker', absolute: true });
}
