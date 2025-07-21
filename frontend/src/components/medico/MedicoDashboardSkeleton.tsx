// src/components/medico/MedicoDashboardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function MedicoDashboardSkeleton() {
  return (
    <div className="space-y-8 p-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Widgets Skeleton */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
       </div>
       <Skeleton className="h-14 w-full" />


      {/* Tool Sections Skeleton */}
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>

        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
