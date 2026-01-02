/**
 * WeekHeader Component - Story 5.4
 *
 * Displays a week header with week number, date range, entry count, and subtotal.
 * Used in the monthly view to group entries by week.
 *
 * Features:
 * - Sticky positioning (stays visible on scroll)
 * - Week label with date range (e.g., "Week 3 (13-19 Jan)")
 * - Entry count and total hours display
 */

import { cn } from '@/lib/utils';

interface WeekHeaderProps {
  /** Formatted label: "Week X (DD-DD Mon)" */
  label: string;
  /** Total hours for this week */
  totalHours: number;
  /** Number of entries in this week */
  entryCount: number;
  /** Whether to apply sticky positioning (default: true) */
  isSticky?: boolean;
}

export function WeekHeader({
  label,
  totalHours,
  entryCount,
  isSticky = true,
}: WeekHeaderProps) {
  const entryText = entryCount === 1 ? 'entry' : 'entries';

  return (
    <div
      data-testid="week-header"
      className={cn(
        'flex items-center justify-between py-3 px-2',
        'bg-background/95 backdrop-blur-sm',
        'border-b',
        isSticky && 'sticky top-0 z-10'
      )}
    >
      <div>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground ml-2">
          ({entryCount} {entryText})
        </span>
      </div>

      <span className="text-sm font-bold text-primary">
        {totalHours.toFixed(1)} hrs
      </span>
    </div>
  );
}
