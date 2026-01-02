'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { getUserEntries, deleteTimeEntry } from '@/actions/entry';
import { formatThaiDate } from '@/lib/thai-date';
import { formatDuration } from '@/lib/duration';
import { canEditEntry } from '@/lib/entry-rules';
import { hapticFeedback } from '@/lib/haptic';
import {
  EntryDetailsSheet,
  EditEntrySheet,
  DeleteConfirmDialog,
} from '@/components/entry';
import type { TimeEntryWithDetails } from '@/types/domain';

/**
 * Recent Entries Component
 * Story 4.5 - AC1: Entry details view on tap
 * Story 4.5 - AC3: Edit form and submission
 */
export function RecentEntries() {
  const queryClient = useQueryClient();

  // Selected entry for viewing details
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Entry being edited
  const [editEntry, setEditEntry] = useState<TimeEntryWithDetails | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Delete confirmation
  const [deleteEntry, setDeleteEntry] = useState<TimeEntryWithDetails | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch entries
  const { data: entriesResult, isLoading, error } = useQuery({
    queryKey: ['userEntries'],
    queryFn: async () => {
      const result = await getUserEntries({ limit: 10 });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const entries = entriesResult ?? [];

  // Handle entry tap
  const handleEntryTap = (entry: TimeEntryWithDetails) => {
    setSelectedEntry(entry);
    setDetailsOpen(true);
  };

  // Handle edit action from details sheet
  const handleEdit = (entry: TimeEntryWithDetails) => {
    setDetailsOpen(false);
    setEditEntry(entry);
    setEditOpen(true);
  };

  // Handle delete action from details sheet
  const handleDeleteRequest = (entry: TimeEntryWithDetails) => {
    setDetailsOpen(false);
    setDeleteEntry(entry);
    setDeleteOpen(true);
  };

  // Confirm delete (AC3: Delete success, AC7: Animation via optimistic update)
  const handleDeleteConfirm = async () => {
    if (!deleteEntry) return;

    const entryToDelete = deleteEntry;

    // Close dialog immediately for better UX
    setDeleteOpen(false);
    setDeleteEntry(null);

    // Optimistic update: remove from cache immediately to trigger exit animation
    queryClient.setQueryData<TimeEntryWithDetails[]>(['userEntries'], (old) =>
      old?.filter((e) => e.id !== entryToDelete.id) ?? []
    );

    setIsDeleting(true);
    try {
      const result = await deleteTimeEntry(entryToDelete.id);
      if (!result.success) {
        // Rollback: restore the entry to the list
        queryClient.invalidateQueries({ queryKey: ['userEntries'] });
        toast.error(result.error);
        return;
      }

      // Haptic feedback for delete (Task 6 - AC3)
      hapticFeedback('error'); // Different pattern for delete

      toast.success('Entry deleted');

      // Ensure cache is in sync with server
      queryClient.invalidateQueries({ queryKey: ['userEntries'] });
    } catch {
      // Rollback on network error
      queryClient.invalidateQueries({ queryKey: ['userEntries'] });
      toast.error('Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setEditOpen(false);
    setEditEntry(null);
    queryClient.invalidateQueries({ queryKey: ['userEntries'] });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load entries
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p>No entries yet</p>
        <p className="text-sm">Your logged time will appear here</p>
      </div>
    );
  }

  return (
    <>
      {/* Entry List with Delete Animation (AC7) */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: -100,
                transition: { duration: 0.2 },
              }}
              transition={{
                opacity: { duration: 0.2 },
                layout: { duration: 0.3 },
              }}
            >
              <EntryRow
                entry={entry}
                onTap={handleEntryTap}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Entry Details Sheet */}
      <EntryDetailsSheet
        entry={selectedEntry}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Edit Entry Sheet */}
      <EditEntrySheet
        entry={editEntry}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog with Entry Summary (AC2, AC4) */}
      <DeleteConfirmDialog
        entry={deleteEntry}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}

interface EntryRowProps {
  entry: TimeEntryWithDetails;
  onTap: (entry: TimeEntryWithDetails) => void;
}

function EntryRow({ entry, onTap }: EntryRowProps) {
  const isEditable = canEditEntry(entry.entry_date);

  return (
    <button
      type="button"
      onClick={() => onTap(entry)}
      className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">
            {entry.job.project.client.name}
          </span>
          {!isEditable && (
            <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground shrink-0">
              Locked
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {entry.job.project.name} • {entry.job.name}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          <span>{formatThaiDate(entry.entry_date)}</span>
          <span>•</span>
          <span>{formatDuration(entry.duration_minutes)}</span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </button>
  );
}
