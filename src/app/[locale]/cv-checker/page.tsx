import { CvCheckerStartFlow } from '@/feature/CvCheckerStartFlow';
import { Link } from '@/i18n/navigation';

export default async function CVCheckerPage() {
  return (
    <>
      <Link href={'/cv-checker/report'}>GO next</Link>
      <CvCheckerStartFlow />
    </>
  );
}
