// src/components/team/TeamDashboard.tsx
import { format } from 'date-fns';
import { TeamStatsCard } from '@/components/team/TeamStatsCard';
import { TeamMembersList } from '@/components/team/TeamMembersList';
import { LoggedMembersList } from '@/components/team/LoggedMembersList';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import type { ManagerDepartment, TeamMembersGrouped } from '@/types/team';

interface TeamDashboardProps {
  departments: ManagerDepartment[];
  membersGrouped: TeamMembersGrouped;
}

export function TeamDashboard({ departments, membersGrouped }: TeamDashboardProps) {
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
        <p className="text-sm text-muted-foreground capitalize">
          {formattedDate}
        </p>
        {departments.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {departments.map((d) => d.name).join(', ')}
          </p>
        )}
      </div>

      {/* Stats Card (placeholder for Story 6.4) */}
      <TeamStatsCard totalMembers={totalMembers} />

      {/* Logged Members List - Story 6.2 */}
      <LoggedMembersList members={membersGrouped.logged} />

      {/* Not Logged Members List (placeholder for Story 6.3) */}
      <TeamMembersList members={membersGrouped.notLogged} />
    </div>
  );
}
