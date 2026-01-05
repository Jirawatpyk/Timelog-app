/**
 * DashboardRefreshWrapper - Story 8.5
 *
 * Client component that wraps dashboard content with PullToRefresh.
 * Uses router.refresh() to trigger Server Component refetch.
 */

'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { REFRESH_INDICATOR_DELAY_MS } from '@/constants/time';

interface DashboardRefreshWrapperProps {
  children: ReactNode;
}

export function DashboardRefreshWrapper({ children }: DashboardRefreshWrapperProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    router.refresh();
    // Small delay to ensure server has processed
    await new Promise((resolve) => setTimeout(resolve, REFRESH_INDICATOR_DELAY_MS));
    setIsRefreshing(false);
  }, [router]);

  return (
    <PullToRefresh onRefresh={handleRefresh} isLoading={isRefreshing}>
      {children}
    </PullToRefresh>
  );
}
