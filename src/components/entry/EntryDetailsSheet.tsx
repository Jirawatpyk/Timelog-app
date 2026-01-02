'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import { formatThaiDate } from '@/lib/thai-date';
import { formatDuration } from '@/lib/duration';
import { canEditEntry, getDaysUntilLocked } from '@/lib/entry-rules';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EntryDetailsSheetProps {
  entry: TimeEntryWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (entry: TimeEntryWithDetails) => void;
  onDelete: (entry: TimeEntryWithDetails) => void;
}

export function EntryDetailsSheet({
  entry,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: EntryDetailsSheetProps) {
  if (!entry) return null;

  const isEditable = canEditEntry(entry.entry_date);
  const daysRemaining = getDaysUntilLocked(entry.entry_date);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Entry Details</SheetTitle>
          <SheetDescription className="sr-only">
            View and manage time entry details
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Entry details */}
          <div className="space-y-3">
            <DetailRow
              label="Date"
              value={formatThaiDate(entry.entry_date, 'full')}
            />
            <DetailRow
              label="Client"
              value={entry.job.project.client.name}
            />
            <DetailRow
              label="Project"
              value={entry.job.project.name}
            />
            <DetailRow
              label="Job"
              value={entry.job.job_no
                ? `${entry.job.job_no} - ${entry.job.name}`
                : entry.job.name}
            />
            <DetailRow
              label="Service"
              value={entry.service.name}
            />
            {entry.task && (
              <DetailRow
                label="Task"
                value={entry.task.name}
              />
            )}
            <DetailRow
              label="Duration"
              value={formatDuration(entry.duration_minutes, 'long')}
            />
            {entry.notes && (
              <DetailRow
                label="Notes"
                value={entry.notes}
              />
            )}

            {/* Timestamps - AC5 */}
            {entry.created_at && (
              <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{formatTimestamp(entry.created_at)}</span>
                </div>
                {entry.updated_at && entry.updated_at !== entry.created_at && (
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span>{formatTimestamp(entry.updated_at)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit restriction warning */}
          {isEditable && daysRemaining <= 2 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {daysRemaining === 1
                  ? 'Last day to edit this entry'
                  : `${daysRemaining} days left to edit`}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 min-h-[48px]"
              onClick={() => onEdit(entry)}
              disabled={!isEditable}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1 min-h-[48px]"
              onClick={() => onDelete(entry)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>

          {/* Edit restriction message */}
          {!isEditable && (
            <p className="text-sm text-muted-foreground text-center">
              Cannot edit entries older than 7 days
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
