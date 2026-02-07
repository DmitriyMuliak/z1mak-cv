import { Skeleton } from '@/components/ui/skeleton';

export const CvCheckerStartSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-pulse">
      {/* --- ModeBar Skeleton --- */}
      <div className="flex flex-col gap-3 items-center md:flex-row">
        <div className="w-full md:w-1/3 space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select Trigger */}
        </div>
        <div className="w-full md:w-1/3 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="w-full md:w-1/3 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* --- Form Skeleton --- */}
      <div className="pt-10 space-y-8">
        {/* Section Input 1 (CV) */}
        <div className="space-y-3">
          <div className="flex flex-col space-y-3">
            {/* Label */}
            <Skeleton className="h-5 w-32" />
            {/* Toggle (Tabs) */}
            <Skeleton className="h-9 w-48 rounded-md" />
          </div>
          {/* Input Area (Textarea or Dropzone) */}
          <Skeleton className="h-40 w-full rounded-md" />
        </div>

        {/* Submit Button */}
        <div>
          <Skeleton className="h-10 w-full rounded-md" />
          {/* Error message placeholder space */}
          <div className="mt-2 h-4" />
        </div>
      </div>
    </div>
  );
};
