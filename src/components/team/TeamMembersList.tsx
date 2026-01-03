// src/components/team/TeamMembersList.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamMember } from '@/types/team';

interface TeamMembersListProps {
  members: TeamMember[];
}

export function TeamMembersList({ members }: TeamMembersListProps) {
  return (
    <div className="space-y-4">
      {/* Logged Section - Will be detailed in Story 6.2 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Logged Today</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Details will be added in Story 6.2
          </p>
        </CardContent>
      </Card>

      {/* Not Logged Section - Will be detailed in Story 6.3 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Not Logged Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Details will be added in Story 6.3
          </p>
          {/* Show member names as placeholder */}
          <div className="mt-2 space-y-1">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="text-sm">
                {member.displayName}
              </div>
            ))}
            {members.length > 5 && (
              <div className="text-xs text-muted-foreground">
                and {members.length - 5} more...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
