import { TwoLineCircle } from '@/components/Loaders/TwoLineCircle';

export default async function Loader() {
  return (
    <div className="flex items-center justify-center w-full">
      <TwoLineCircle />
    </div>
  );
}

// TODO: add to loader
// position: fixed;
// top: 50%;
// left: 50%;
// transform: translate(-50%, -50%);
