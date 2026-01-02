/**
 * Entry List - Story 5.1
 *
 * Displays a list of time entries for the selected period.
 * This is a placeholder that will be enhanced in Stories 5.2-5.4.
 */

import { Card, CardContent } from '@/components/ui/card';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EntryListProps {
  entries: TimeEntryWithDetails[];
}

export function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No entries for this period
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.job?.project?.client?.name} &gt; {entry.job?.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {entry.service?.name}
                  {entry.task && ` • ${entry.task.name}`}
                </p>
                {entry.notes && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {entry.notes}
                  </p>
                )}
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <p className="text-lg font-semibold">
                  {(entry.duration_minutes / 60).toFixed(1)} hr
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.entry_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
