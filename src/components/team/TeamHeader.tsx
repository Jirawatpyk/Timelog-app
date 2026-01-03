// src/components/team/TeamHeader.tsx
import { format } from 'date-fns';
import type { DepartmentOption } from '@/types/domain';

interface TeamHeaderProps {
  /** Manager's departments */
  departments: DepartmentOption[];
  /** Last data update timestamp */
  lastUpdated?: Date;
}

/**
 * Team Dashboard header with title, date, and last updated indicator.
 *
 * Displays:
 * - Title: "Team Dashboard"
 * - Current date in full format
 * - Department names
 * - Last updated timestamp (subtle, optional)
 */
export function TeamHeader({ departments, lastUpdated }: TeamHeaderProps) {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Team Dashboard</h1>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Last updated: {format(lastUpdated, 'HH:mm')}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
      {departments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {departments.map((d) => d.name).join(', ')}
        </p>
      )}
    </div>
  );
}
