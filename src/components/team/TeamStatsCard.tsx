// src/components/team/TeamStatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TeamStatsCardProps {
  totalMembers: number;
}

export function TeamStatsCard({ totalMembers }: TeamStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{totalMembers}</span>
          <span className="text-muted-foreground">team members</span>
        </div>
        {/* Additional stats will be added in Story 6.4 */}
      </CardContent>
    </Card>
  );
}
