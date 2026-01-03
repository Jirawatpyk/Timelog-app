/**
 * Dashboard Types - Story 5.1, 5.6, 5.7
 *
 * Types for the Personal Dashboard feature including
 * period selection, statistics display, filtering, and search.
 */

export type Period = 'today' | 'week' | 'month';

/**
 * Story 5.6, 5.7: Filter state for dashboard entries
 */
export interface FilterState {
  clientId?: string;
  searchQuery?: string; // Story 5.7: Text search query (min 2 chars)
  // Future: serviceId, dateRange, etc.
}

/**
 * Story 5.6: Client option for filter dropdown
 */
export interface ClientOption {
  id: string;
  name: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardStats {
  totalHours: number;
  entryCount: number;
  topClient?: {
    id: string;
    name: string;
    hours: number;
  };
  // Story 5.4, 5.5: Period-specific stats
  /** Number of unique days with entries (for week/month view) */
  daysWithEntries?: number;
  /** Average hours per day based on actual days with entries (for week/month) */
  averagePerDay?: number;
  /** Number of weeks in the current month (for average calculation) */
  weeksInMonth?: number;
  /** Average hours per week (for month view) */
  averagePerWeek?: number;
}

export interface DashboardPageProps {
  searchParams: Promise<{ period?: string; client?: string; q?: string }>;
}
