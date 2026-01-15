import { TwoLineCircle } from '@/components/Loaders/TwoLineCircle';

export default async function Loader() {
  return (
    <div className="absolute inset-0 full-screen-container-loader flex items-center justify-center">
      <TwoLineCircle />
    </div>
  );
}
