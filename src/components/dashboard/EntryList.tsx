/**
 * Entry List - Story 5.1, 5.2
 *
 * Displays a list of time entries for the selected period.
 * Story 5.2: Enhanced with EntryCard, EntryDetailsSheet, and delete functionality
 *
 * AC1: Entry list sorted by created_at (handled by query)
 * AC4: Entry tap opens bottom sheet
 * AC6: Edit/Delete actions from sheet
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { EntryDetailsSheet, DeleteConfirmDialog } from '@/components/entry';
import { deleteTimeEntry } from '@/actions/entry';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EntryListProps {
  entries: TimeEntryWithDetails[];
  emptyMessage?: string;
}

export function EntryList({
  entries,
  emptyMessage = 'No entries for this period',
}: EntryListProps) {
  const router = useRouter();
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryWithDetails | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    // Close sheet and navigate to edit form
    setSelectedEntry(null);
    router.push(`/entry/edit/${entry.id}`);
  };

  const handleDeleteRequest = (entry: TimeEntryWithDetails) => {
    // Close details sheet and open delete confirmation
    setSelectedEntry(null);
    setEntryToDelete(entry);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);
    const result = await deleteTimeEntry(entryToDelete.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Entry deleted');
      setEntryToDelete(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteCancel = () => {
    setEntryToDelete(null);
  };

  return (
    <>
      <div className="flex flex-col gap-2" data-testid="entry-list">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onTap={handleEntryTap} />
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
