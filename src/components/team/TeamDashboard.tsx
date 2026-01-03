// src/components/team/TeamDashboard.tsx
import { format } from 'date-fns';
import { TeamStatsCard } from '@/components/team/TeamStatsCard';
import { TeamPeriodSelector } from '@/components/team/TeamPeriodSelector';
import { WeeklyBreakdown } from '@/components/team/WeeklyBreakdown';
import { LoggedMembersList } from '@/components/team/LoggedMembersList';
import { NotLoggedMembersList } from '@/components/team/NotLoggedMembersList';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import { TeamErrorState } from '@/components/team/TeamErrorState';
import { DepartmentFilter } from '@/components/team/DepartmentFilter';
import type {
  ManagerDepartment,
  TeamMembersGrouped,
  TeamStats,
  DailyBreakdown,
  TeamStatsPeriod,
} from '@/types/team';

interface TeamDashboardProps {
  departments: ManagerDepartment[];
  membersGrouped: TeamMembersGrouped;
  period?: TeamStatsPeriod;
  stats?: TeamStats | null;
  weeklyBreakdown?: DailyBreakdown[] | null;
  statsError?: string | null;
  showDepartmentFilter?: boolean;
  departmentFilter?: string;
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
}: TeamDashboardProps) {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  const totalMembers = membersGrouped.logged.length + membersGrouped.notLogged.length;

  if (totalMembers === 0) {
    return <EmptyTeamState />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header with Date */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Team Dashboard</h1>
        <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
        {departments.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {departments.map((d) => d.name).join(', ')}
          </p>
        )}
      </div>

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
