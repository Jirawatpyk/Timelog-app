// src/components/team/TeamDashboard.tsx
import { TeamStatsCard } from '@/components/team/TeamStatsCard';
import { TeamPeriodSelector } from '@/components/team/TeamPeriodSelector';
import { WeeklyBreakdown } from '@/components/team/WeeklyBreakdown';
import { LoggedMembersList } from '@/components/team/LoggedMembersList';
import { NotLoggedMembersList } from '@/components/team/NotLoggedMembersList';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import { TeamErrorState } from '@/components/team/TeamErrorState';
import { DepartmentFilter } from '@/components/team/DepartmentFilter';
import { TeamHeader } from '@/components/team/TeamHeader';
import type { DepartmentOption } from '@/types/domain';
import type {
  TeamMembersGrouped,
  TeamStats,
  DailyBreakdown,
  TeamStatsPeriod,
} from '@/types/team';

export interface TeamDashboardProps {
  departments: DepartmentOption[];
  membersGrouped: TeamMembersGrouped;
  period?: TeamStatsPeriod;
  stats?: TeamStats | null;
  weeklyBreakdown?: DailyBreakdown[] | null;
  statsError?: string | null;
  showDepartmentFilter?: boolean;
  departmentFilter?: string;
  /** Last data update timestamp for display */
  lastUpdated?: Date;
}

export function TeamDashboard({
  departments,
  membersGrouped,
  period = 'today',
  stats,
  weeklyBreakdown,
  statsError,
  showDepartmentFilter = false,
  departmentFilter = 'all',
  lastUpdated,
}: TeamDashboardProps) {
  const totalMembers = membersGrouped.logged.length + membersGrouped.notLogged.length;

  if (totalMembers === 0) {
    return <EmptyTeamState />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header with Date and Last Updated - Story 6.6 */}
      <TeamHeader departments={departments} lastUpdated={lastUpdated} />

      {/* Department Filter - Story 6.5 (show only if multiple departments) */}
      {showDepartmentFilter && (
        <DepartmentFilter departments={departments} currentFilter={departmentFilter} />
      )}

      {/* Period Selector - Story 6.4 */}
      <TeamPeriodSelector period={period} />

      {/* Stats Card - Story 6.4 */}
      {statsError ? (
        <TeamErrorState message={statsError} />
      ) : (
        <TeamStatsCard
          totalMembers={totalMembers}
          loggedCount={membersGrouped.logged.length}
          totalHours={stats?.totalHours}
          averageHours={stats?.averageHours}
        />
      )}

      {/* Weekly Breakdown - Story 6.4 (only when period is week) */}
      {period === 'week' && weeklyBreakdown && (
        <WeeklyBreakdown breakdown={weeklyBreakdown} />
      )}

      {/* Logged Members List - Story 6.2 */}
      <LoggedMembersList
        members={membersGrouped.logged}
        showDepartmentName={departmentFilter === 'all' && showDepartmentFilter}
      />

      {/* Not Logged Members List - Story 6.3 */}
      <NotLoggedMembersList
        members={membersGrouped.notLogged}
        showDepartmentName={departmentFilter === 'all' && showDepartmentFilter}
      />
    </div>
  );
}
