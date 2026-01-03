// src/components/team/LoggedMembersList.tsx
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoggedMemberCard } from '@/components/team/LoggedMemberCard';
import type { TeamMemberWithStats } from '@/types/team';

interface LoggedMembersListProps {
  members: TeamMemberWithStats[];
  showDepartmentName?: boolean;
}

export function LoggedMembersList({
  members,
  showDepartmentName = false,
}: LoggedMembersListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-green-600">●</span>
          Logged Today
          <span className="text-muted-foreground font-normal">
            ({members.length} people)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {members.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-2 lucide-users" />
            <p className="text-sm text-muted-foreground">No one logged today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <LoggedMemberCard
                key={member.id}
                member={member}
                showDepartmentName={showDepartmentName}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
