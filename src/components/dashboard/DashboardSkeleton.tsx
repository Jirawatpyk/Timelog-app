/**
 * Dashboard Skeleton - Story 5.1
 *
 * Loading skeleton for dashboard content.
 * Used as Suspense fallback.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Stats Card Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-3 w-12 ml-auto" />
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry List Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="space-y-2 text-right ml-4">
                <Skeleton className="h-5 w-12 ml-auto" />
                <Skeleton className="h-3 w-10 ml-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
