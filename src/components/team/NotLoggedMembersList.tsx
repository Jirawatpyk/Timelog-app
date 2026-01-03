// src/components/team/NotLoggedMembersList.tsx
'use client';

import { PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotLoggedMemberCard } from '@/components/team/NotLoggedMemberCard';
import type { TeamMemberWithStats } from '@/types/team';

interface NotLoggedMembersListProps {
  members: TeamMemberWithStats[];
}

export function NotLoggedMembersList({ members }: NotLoggedMembersListProps) {
  // All logged - success state!
  if (members.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-green-600">●</span>
            Not Logged
            <span className="text-muted-foreground font-normal">(0 people)</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <PartyPopper className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">
              Everyone has logged!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Great job team!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-muted-foreground">○</span>
          Not Logged
          <span className="text-muted-foreground font-normal">
            ({members.length} {members.length === 1 ? 'person' : 'people'})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {members.map((member) => (
            <NotLoggedMemberCard key={member.id} member={member} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
