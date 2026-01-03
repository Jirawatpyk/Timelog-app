// src/app/(app)/team/page.tsx
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { checkManagerAccess } from '@/lib/auth/check-manager-access';
import {
  getManagerDepartments,
  getTeamMembersWithTodayStats,
  getTeamStats,
  getWeeklyBreakdown,
} from '@/lib/queries/team';
import { TeamDashboard } from '@/components/team/TeamDashboard';
import { TeamDashboardSkeleton } from '@/components/team/TeamDashboardSkeleton';
import type { TeamStatsPeriod } from '@/types/team';

interface TeamPageProps {
  searchParams: Promise<{ period?: string; dept?: string }>;
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const { canAccess, userId, isAdmin } = await checkManagerAccess();

  if (!canAccess) {
    // Redirect with message (toast handled client-side)
    redirect('/dashboard?error=no-access');
  }

  const params = await searchParams;
  const period: TeamStatsPeriod =
    params.period === 'week' ? 'week' : 'today';
  const departmentFilter = params.dept || 'all';

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<TeamDashboardSkeleton />}>
        <TeamDashboardContent
          userId={userId}
          isAdmin={isAdmin}
          period={period}
          departmentFilter={departmentFilter}
        />
      </Suspense>
    </div>
  );
}

async function TeamDashboardContent({
  userId,
  isAdmin,
  period,
  departmentFilter,
}: {
  userId: string;
  isAdmin: boolean;
  period: TeamStatsPeriod;
  departmentFilter: string;
}) {
  const departmentsResult = await getManagerDepartments(userId, isAdmin);

  if (!departmentsResult.success) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading departments: {departmentsResult.error}
      </div>
    );
  }

  const departments = departmentsResult.data;

  // Determine which departments to query based on filter
  let departmentIds: string[];
  if (departmentFilter === 'all') {
    departmentIds = departments.map((d) => d.id);
  } else {
    // Filter to specific department (validate it exists in manager's departments)
    const selectedDept = departments.find((d) => d.id === departmentFilter);
    departmentIds = selectedDept ? [selectedDept.id] : departments.map((d) => d.id);
  }

  // Fetch data in parallel
  const [membersGrouped, statsResult, breakdownResult] = await Promise.all([
    getTeamMembersWithTodayStats(departmentIds),
    getTeamStats(period, departmentIds),
    period === 'week' ? getWeeklyBreakdown(departmentIds) : Promise.resolve(null),
  ]);

  // Extract stats data (handle error gracefully)
  const stats = statsResult.success ? statsResult.data : null;
  const statsError = !statsResult.success ? 'Unable to load stats' : null;
  const breakdown =
    breakdownResult && breakdownResult.success ? breakdownResult.data : null;

  // Determine if filter should be shown (multiple departments)
  const showDepartmentFilter = departments.length > 1;

  return (
    <TeamDashboard
      departments={departments}
      membersGrouped={membersGrouped}
      period={period}
      stats={stats}
      weeklyBreakdown={breakdown}
      statsError={statsError}
      showDepartmentFilter={showDepartmentFilter}
      departmentFilter={departmentFilter}
    />
  );
}
