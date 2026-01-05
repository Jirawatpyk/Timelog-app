// src/components/team/TeamDashboardClient.tsx
'use client';

import { useState, useCallback } from 'react';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { TeamDashboard, TeamDashboardProps } from '@/components/team/TeamDashboard';
import { useTeamData } from '@/app/(app)/team/components/TeamDataProvider';
import { REFRESH_INDICATOR_DELAY_MS } from '@/constants/time';

/**
 * Client wrapper for TeamDashboard that adds:
 * - Pull-to-refresh functionality
 * - Last updated indicator from polling context
 */
export function TeamDashboardClient(props: TeamDashboardProps) {
  const { lastUpdated, refresh } = useTeamData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      refresh();
      // Small delay to show loading indicator
      await new Promise((resolve) => setTimeout(resolve, REFRESH_INDICATOR_DELAY_MS));
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  return (
    <PullToRefresh onRefresh={handleRefresh} isLoading={isRefreshing}>
      <TeamDashboard {...props} lastUpdated={lastUpdated} />
    </PullToRefresh>
  );
}
