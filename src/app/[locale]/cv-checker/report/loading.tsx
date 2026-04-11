import { ReportSkeleton } from '@/features/cv-checker/components/ReportRenderer/components/ReportSkeleton';

export default async function Loader() {
  return (
    <div className="opacity-50 pointer-events-none filter blur-[2px]">
      <ReportSkeleton animated={false} />
    </div>
  );
}
