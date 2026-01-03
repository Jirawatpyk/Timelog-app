// src/components/team/WeeklyBreakdown.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyBreakdown } from '@/types/team';

interface WeeklyBreakdownProps {
  breakdown: DailyBreakdown[];
}

function formatHours(hours: number): string {
  return hours.toFixed(1);
}

export function WeeklyBreakdown({ breakdown }: WeeklyBreakdownProps) {
  if (breakdown.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul role="list" className="grid grid-cols-7 gap-1 text-center">
          {breakdown.map((day) => (
            <li
              key={day.date}
              data-today={day.isToday}
              className={cn(
                'flex flex-col items-center p-2 rounded-lg transition-colors',
                day.isToday && 'bg-primary/10 ring-2 ring-primary/20'
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium',
                  day.isToday ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {day.dayOfWeek}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold mt-1',
                  day.isToday && 'text-primary',
                  day.totalHours === 0 && !day.isToday && 'text-muted-foreground'
                )}
              >
                {formatHours(day.totalHours)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
