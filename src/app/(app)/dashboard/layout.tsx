/**
 * Dashboard Layout - Story 5.1
 *
 * Layout wrapper for dashboard pages.
 * Provides consistent structure for all dashboard routes.
 *
 * Note: NO TanStack Query providers here - Dashboard uses Server Components only.
 * Note: Suspense is handled at the page level, not here.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Timelog',
  description: 'View your time entries organized by time period',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <>{children}</>;
}
