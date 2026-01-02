/**
 * MonthlyEntryList Component - Story 5.4
 *
 * Displays time entries grouped by week for the monthly view.
 * AC1: Shows entries from 1st to last day of current month
 * AC2: Entries grouped by week with week headers
 * AC3: Performance acceptable with 100+ entries (no virtualization needed for typical usage)
 * AC4: Sticky week headers
 * AC6: Empty days NOT shown
 * AC7: Entry tap opens bottom sheet (reuses EntryDetailsSheet)
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { WeekHeader } from '@/components/dashboard/WeekHeader';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { EntryDetailsSheet, DeleteConfirmDialog } from '@/components/entry';
import { groupEntriesByWeek } from '@/lib/dashboard/group-entries';
import { deleteTimeEntry } from '@/actions/entry';
import type { TimeEntryWithDetails } from '@/types/domain';

interface MonthlyEntryListProps {
  /** Time entries for the month */
  entries: TimeEntryWithDetails[];
  /** A date within the target month (used to determine week boundaries) */
  monthDate: Date;
}

export function MonthlyEntryList({ entries, monthDate }: MonthlyEntryListProps) {
  const router = useRouter();
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryWithDetails | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Group entries by week (memoized for performance)
  const weekGroups = useMemo(
    () => groupEntriesByWeek(entries, monthDate),
    [entries, monthDate]
  );

  // Handle empty state
  if (entries.length === 0) {
    return <EmptyState message="No entries this month" showCta={true} />;
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
      <div className="flex flex-col" data-testid="monthly-entry-list">
        {weekGroups.map((week) => (
          <div key={week.weekNumber} className="mb-4">
            {/* Sticky week header */}
            <WeekHeader
              label={week.label}
              totalHours={week.totalHours}
              entryCount={week.entries.length}
              isSticky={true}
            />

            {/* Entries within this week */}
            <div className="flex flex-col gap-2 mt-2 pl-2">
              {week.entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onTap={handleEntryTap}
                />
              ))}
            </div>
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
