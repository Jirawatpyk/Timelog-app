// src/components/team/TeamStatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck } from 'lucide-react';

interface TeamStatsCardProps {
  totalMembers: number;
  loggedCount?: number;
}

export function TeamStatsCard({ totalMembers, loggedCount }: TeamStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{totalMembers}</span>
            <span className="text-muted-foreground">team members</span>
          </div>

          {loggedCount !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span>
                <span className="font-medium text-green-600">{loggedCount}</span>
                <span className="text-muted-foreground"> logged</span>
              </span>
            </div>
          )}
        </div>
        {/* Additional stats will be added in Story 6.4 */}
      </CardContent>
    </Card>
  );
}
