// src/components/team/TeamStatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamStatsCardProps {
  totalMembers: number;
  loggedCount?: number;
  totalHours?: number;
  averageHours?: number;
}

function formatHours(hours: number): string {
  return hours.toFixed(1);
}

function calculateComplianceRate(logged: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((logged / total) * 100);
}

export function TeamStatsCard({
  totalMembers,
  loggedCount,
  totalHours,
  averageHours,
}: TeamStatsCardProps) {
  const hasExtendedStats = totalHours !== undefined;
  const complianceRate =
    loggedCount !== undefined ? calculateComplianceRate(loggedCount, totalMembers) : null;
  const isFullCompliance = complianceRate === 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Top row: member count and logged count */}
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

        {/* Extended stats (Story 6.4) */}
        {hasExtendedStats && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t">
            {/* Total Hours */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>hrs total</span>
              </div>
              <span className="text-lg font-semibold">{formatHours(totalHours)}</span>
            </div>

            {/* Average per Person */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>avg/person</span>
              </div>
              <span className="text-lg font-semibold">
                {averageHours !== undefined ? formatHours(averageHours) : '-'}
              </span>
            </div>

            {/* Compliance Rate */}
            {complianceRate !== null && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UserCheck className="h-3 w-3" />
                  <span>compliance</span>
                </div>
                <span
                  className={cn('text-lg font-semibold', isFullCompliance && 'text-green-600')}
                >
                  {complianceRate}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Compliance only (no extended stats) */}
        {!hasExtendedStats && complianceRate !== null && (
          <div className="flex items-center gap-2 pt-2 border-t text-sm">
            <span className="text-muted-foreground">Compliance:</span>
            <span className={cn('font-medium', isFullCompliance && 'text-green-600')}>
              {complianceRate}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
