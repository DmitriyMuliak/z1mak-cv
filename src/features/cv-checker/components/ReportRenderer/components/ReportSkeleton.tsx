import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const ReportSkeleton = () => {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* --- SECTION 1: HEADER SKELETON --- */}
      {/* ReportSection */}
      <Card className="frosted-card">
        {/* Title */}
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-6" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 md:gap-4 gap-6">
              {/* Left: Scores & Summary */}
              <div className="space-y-4">
                {/* Scores area */}
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                {/* Suitability text */}
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-16 w-full rounded-md" />
                </div>
              </div>

              {/* Mobile Separator (hidden on md) */}
              <Separator className="md:hidden" />

              {/* Right: Fit Details */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <Separator className="my-4 hidden md:block" />

            {/* Bottom Grid: Metrics, Skills, Export */}
            <div className="grid md:grid-cols-3 md:gap-4 gap-6 items-start">
              {/* Metrics */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>

              <Separator className="md:hidden" />

              {/* Skills */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </div>

              <Separator className="md:hidden" />

              {/* Export Actions */}
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* --- SECTION 2: EXPERIENCE SKELETON --- */}
      <Card className="frosted-card">
        <CardHeader>
          <Skeleton className="h-7 w-40" /> {/* Title: Experience Analysis */}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-3 border rounded-lg space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 w-full">
                    {/* Job Title & Company */}
                    <Skeleton className="h-5 w-2/3" />
                    {/* Period */}
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  {/* Score */}
                  <Skeleton className="h-6 w-10 shrink-0" />
                </div>
                {/* Comment */}
                <div className="space-y-2 pt-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
