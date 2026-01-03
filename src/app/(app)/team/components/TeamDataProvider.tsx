// src/app/(app)/team/components/TeamDataProvider.tsx
'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePolling } from '@/hooks/use-polling';
import { POLLING_INTERVAL_MS } from '@/constants/time';

interface TeamDataContextValue {
  /** Timestamp of the last successful data refresh */
  lastUpdated: Date;
  /** Whether polling is currently active */
  isPolling: boolean;
  /** Manually trigger a refresh and reset polling timer */
  refresh: () => void;
}

const TeamDataContext = createContext<TeamDataContextValue | null>(null);

interface TeamDataProviderProps {
  children: ReactNode;
}

/**
 * Client component wrapper that provides auto-refresh functionality
 * for the Team Dashboard using router.refresh().
 *
 * Features:
 * - Polls every 30 seconds (POLLING_INTERVAL_MS)
 * - Pauses when tab is hidden
 * - Resumes with immediate refresh when tab becomes visible
 * - Silent error handling (no UI disruption)
 */
export function TeamDataProvider({ children }: TeamDataProviderProps) {
  const router = useRouter();

  const handlePoll = useCallback(() => {
    try {
      router.refresh();
    } catch (error) {
      // Silent failure - keep showing stale data
      console.error('Team dashboard polling failed:', error);
    }
  }, [router]);

  const { lastUpdated, isPolling, reset } = usePolling({
    onPoll: handlePoll,
    intervalMs: POLLING_INTERVAL_MS,
  });

  const refresh = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <TeamDataContext.Provider value={{ lastUpdated, isPolling, refresh }}>
      {children}
    </TeamDataContext.Provider>
  );
}

/**
 * Hook to access team data refresh context.
 * Must be used within TeamDataProvider.
 */
export function useTeamData(): TeamDataContextValue {
  const context = useContext(TeamDataContext);
  if (!context) {
    throw new Error('useTeamData must be used within TeamDataProvider');
  }
  return context;
}
