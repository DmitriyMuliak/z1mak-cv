// import { Breadcrumbs } from '@/feature/components/Breadcrumbs';

interface Props {
  children: React.ReactNode;
}

export default async function CVCheckerLayout({ children }: Props) {
  return (
    <div className="p-8">
      {/* <Breadcrumbs /> */}
      {children}
    </div>
  );
}
