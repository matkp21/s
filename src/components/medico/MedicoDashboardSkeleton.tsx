// src/components/medico/MedicoDashboardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function MedicoDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
