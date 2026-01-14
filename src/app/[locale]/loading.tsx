import { TwoLineCircle } from '@/components/Loaders/TwoLineCircle';

export default async function Loader() {
  return (
    <div className="min-h-full-screen flex items-center justify-center mt-[-70px] lg:mt-[-83px]">
      <TwoLineCircle />
    </div>
  );
}
