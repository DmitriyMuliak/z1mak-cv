import { TwoLineCircle } from '@/components/Loaders/TwoLineCircle';

export default async function Loader() {
  return (
    <div className="flex items-center justify-center w-full">
      <TwoLineCircle />
    </div>
  );
}
