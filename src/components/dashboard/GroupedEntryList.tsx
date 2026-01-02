/**
 * GroupedEntryList Component - Story 5.3
 *
 * Displays time entries grouped by date with daily subtotals.
 * Used for weekly and monthly views on the dashboard.
 *
 * AC1: Entries sorted by date (newest first)
 * AC2: Date headers with day name
 * AC3: Daily subtotals
 * AC5: Empty days handling
 * AC6: Entry tap behavior (reuses EntryDetailsSheet)
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DateHeader } from '@/components/dashboard/DateHeader';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { EntryDetailsSheet, DeleteConfirmDialog } from '@/components/entry';
import { groupEntriesByDate } from '@/lib/dashboard/group-entries';
import { deleteTimeEntry } from '@/actions/entry';
import type { TimeEntryWithDetails } from '@/types/domain';
import type { Period } from '@/types/dashboard';

interface GroupedEntryListProps {
  entries: TimeEntryWithDetails[];
  period: Period;
  showEmptyDays?: boolean;
  emptyMessage?: string;
}

export function GroupedEntryList({
  entries,
  period,
  showEmptyDays = false,
  emptyMessage = 'No entries for this period',
}: GroupedEntryListProps) {
  const router = useRouter();
  const [selectedEntry, setSelectedEntry] =
    useState<TimeEntryWithDetails | null>(null);
  const [entryToDelete, setEntryToDelete] =
    useState<TimeEntryWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const groupedEntries = useMemo(
    () => groupEntriesByDate(entries, period, showEmptyDays),
    [entries, period, showEmptyDays]
  );

  if (entries.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  const handleEntryTap = (entry: TimeEntryWithDetails) => {
    setSelectedEntry(entry);
  };

  const handleCloseSheet = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: TimeEntryWithDetails) => {
    setSelectedEntry(null);
    router.push(`/entry/edit/${entry.id}`);
  };

  const handleDeleteRequest = (entry: TimeEntryWithDetails) => {
    setSelectedEntry(null);
    setEntryToDelete(entry);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteTimeEntry(entryToDelete.id);

      if (result.success) {
        toast.success('Entry deleted');
        setEntryToDelete(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete entry. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setEntryToDelete(null);
  };

  return (
    <>
      <div
        className="flex flex-col gap-4"
        data-testid="grouped-entry-list"
      >
        {groupedEntries.map((group) => (
          <div key={group.date} className="space-y-2">
            <DateHeader
              date={group.date}
              totalHours={group.totalHours}
              entryCount={group.entries.length}
              isEmpty={group.entries.length === 0}
            />

            {group.entries.length > 0 ? (
              <div className="flex flex-col gap-2 pl-2">
                {group.entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onTap={handleEntryTap}
                  />
                ))}
              </div>
            ) : (
              showEmptyDays && (
                <p className="text-sm text-muted-foreground pl-2">No entries</p>
              )
            )}
          </div>
        ))}
      </div>

      {/* Entry Details Sheet - Reused from Story 4.5 */}
      <EntryDetailsSheet
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => !open && handleCloseSheet()}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Delete Confirmation Dialog - Reused from Story 4.6 */}
      <DeleteConfirmDialog
        entry={entryToDelete}
        open={!!entryToDelete}
        onOpenChange={(open) => !open && handleDeleteCancel()}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
