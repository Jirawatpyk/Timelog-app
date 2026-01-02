/**
 * Dashboard Types - Story 5.1
 *
 * Types for the Personal Dashboard feature including
 * period selection and statistics display.
 */

export type Period = 'today' | 'week' | 'month';

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
}

export interface DashboardPageProps {
  searchParams: Promise<{ period?: string }>;
}
