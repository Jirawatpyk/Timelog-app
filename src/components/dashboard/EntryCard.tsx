/**
 * Entry Card Component - Story 5.2
 *
 * Displays a single time entry with client, job, service, duration.
 * AC1: Entry list sorted by created_at
 * AC2: Entry card shows all required information
 */

'use client';

import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/duration';
import { formatThaiDate } from '@/lib/thai-date';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EntryCardProps {
  entry: TimeEntryWithDetails;
  onTap: (entry: TimeEntryWithDetails) => void;
}

export function EntryCard({ entry, onTap }: EntryCardProps) {
  const clientName = entry.job?.project?.client?.name ?? 'Unknown Client';
  const jobDisplay = entry.job?.job_no
    ? `${entry.job.job_no} - ${entry.job.name}`
    : entry.job?.name ?? 'Unknown Job';

  return (
    <button
      type="button"
      onClick={() => onTap(entry)}
      data-testid="entry-card"
      className={cn(
        'w-full text-left p-4 rounded-lg border bg-card',
        'transition-colors duration-200',
        'hover:bg-accent/50 active:bg-accent',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'min-h-[72px] touch-manipulation'
      )}
    >
      <div className="flex justify-between items-start gap-2">
        {/* Left: Client > Job > Service */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{clientName}</p>
          <p className="text-xs text-muted-foreground truncate">{jobDisplay}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {entry.service?.name}
            {entry.task && ` • ${entry.task.name}`}
          </p>
        </div>

        {/* Right: Duration and Date */}
        <div className="text-right shrink-0">
          <p className="font-semibold text-primary">
            {formatDuration(entry.duration_minutes)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatThaiDate(entry.entry_date, 'short')}
          </p>
        </div>
      </div>
    </button>
  );
}
