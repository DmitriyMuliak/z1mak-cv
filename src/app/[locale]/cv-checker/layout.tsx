// import { Breadcrumbs } from '@/feature/components/Breadcrumbs';

interface Props {
  children: React.ReactNode;
}

export default async function CVCheckerLayout({ children }: Props) {
  return (
    <div className="sm:p-6 md:p-8">
      {/* <Breadcrumbs /> */}
      {children}
    </div>
  );
}
