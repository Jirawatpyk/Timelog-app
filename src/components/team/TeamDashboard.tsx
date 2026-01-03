// src/components/team/TeamDashboard.tsx
import { format } from 'date-fns';
import { TeamStatsCard } from '@/components/team/TeamStatsCard';
import { TeamMembersList } from '@/components/team/TeamMembersList';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import type { ManagerDepartment, TeamMember } from '@/types/team';

interface TeamDashboardProps {
  departments: ManagerDepartment[];
  members: TeamMember[];
}

export function TeamDashboard({ departments, members }: TeamDashboardProps) {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  if (members.length === 0) {
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
      <TeamStatsCard totalMembers={members.length} />

      {/* Team Members List (placeholder for Stories 6.2, 6.3) */}
      <TeamMembersList members={members} />
    </div>
  );
}
