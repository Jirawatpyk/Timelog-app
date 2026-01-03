// src/hooks/use-polling.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { POLLING_INTERVAL_MS } from '@/constants/time';

interface UsePollingOptions {
  /** Callback function to execute on each poll */
  onPoll: () => void;
  /** Polling interval in milliseconds (default: POLLING_INTERVAL_MS = 30_000) */
  intervalMs?: number;
}

interface UsePollingReturn {
  /** Whether polling is currently active */
  isPolling: boolean;
  /** Timestamp of the last successful poll */
  lastUpdated: Date;
  /** Reset polling timer and trigger immediate poll */
  reset: () => void;
}

/**
 * Generic polling hook with visibility-based pause/resume.
 *
 * Features:
 * - Executes callback at specified interval
 * - Pauses when tab is hidden (saves resources)
 * - Resumes with immediate poll when tab becomes visible
 * - Manual reset capability
 */
export function usePolling({
  onPoll,
  intervalMs = POLLING_INTERVAL_MS,
}: UsePollingOptions): UsePollingReturn {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onPollRef = useRef(onPoll);

  // Keep onPoll ref updated to avoid stale closures
  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      onPollRef.current();
      setLastUpdated(new Date());
    }, intervalMs);

    setIsPolling(true);
  }, [intervalMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    onPollRef.current();
    setLastUpdated(new Date());
    startPolling();
  }, [startPolling, stopPolling]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Immediate refresh on tab return
        onPollRef.current();
        setLastUpdated(new Date());
        startPolling();
      }
    };

    // Start polling on mount
    startPolling();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling]);

  return {
    isPolling,
    lastUpdated,
    reset,
  };
}
