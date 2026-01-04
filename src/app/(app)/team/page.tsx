// src/app/(app)/team/page.tsx
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Building2 } from 'lucide-react';
import { checkManagerAccess } from '@/lib/auth/check-manager-access';
import {
  getManagerDepartments,
  getTeamMembersWithTodayStats,
  getTeamStats,
  getWeeklyBreakdown,
} from '@/lib/queries/team';
import { TeamDashboardClient } from '@/components/team/TeamDashboardClient';
import { TeamDashboardSkeleton } from '@/components/team/TeamDashboardSkeleton';
import { TeamDataProvider } from '@/app/(app)/team/components/TeamDataProvider';
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
    <TeamDataProvider>
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
    </TeamDataProvider>
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

  // Story 7.6 AC 5: Show empty state when manager has no departments assigned
  if (departments.length === 0 && !isAdmin) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">No departments assigned yet</h2>
        <p className="text-muted-foreground">Contact your admin.</p>
      </div>
    );
  }

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
    <TeamDashboardClient
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
