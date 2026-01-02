/**
 * DateHeader Component - Story 5.3
 *
 * Displays date with day name and daily subtotal for grouped entry view.
 * AC2: Shows day name + date format
 * AC3: Shows daily subtotal
 * AC5: Muted styling for empty days
 */

import { cn } from '@/lib/utils';
import { formatThaiDate } from '@/lib/thai-date';

interface DateHeaderProps {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Total hours for this day */
  totalHours: number;
  /** Number of entries for this day */
  entryCount: number;
  /** Whether this day has no entries */
  isEmpty?: boolean;
}

export function DateHeader({
  date,
  totalHours,
  entryCount,
  isEmpty = false,
}: DateHeaderProps) {
  return (
    <div
      data-testid="date-header"
      className={cn(
        'flex items-center justify-between py-2 px-1',
        'border-b',
        isEmpty && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-medium',
            isEmpty && 'text-muted-foreground'
          )}
        >
          {formatThaiDate(date, 'full')}
        </span>
        {!isEmpty && (
          <span className="text-xs text-muted-foreground">
            ({entryCount} {entryCount === 1 ? 'entry' : 'entries'})
          </span>
        )}
      </div>

      <span
        className={cn(
          'text-sm font-semibold',
          isEmpty ? 'text-muted-foreground' : 'text-primary'
        )}
      >
        {totalHours.toFixed(1)} hr
      </span>
    </div>
  );
}
