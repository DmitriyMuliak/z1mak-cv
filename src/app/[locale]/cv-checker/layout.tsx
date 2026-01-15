// import { Breadcrumbs } from '@/features/cv-checker/components/Breadcrumbs';

interface Props {
  children: React.ReactNode;
}

export default async function CVCheckerLayout({ children }: Props) {
  return (
    <div className="flex justify-center w-full pb-4 sm:p-6 md:p-8">
      {/* <Breadcrumbs /> */}
      {children}
    </div>
  );
}
