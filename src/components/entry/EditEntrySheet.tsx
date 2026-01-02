'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { EditEntryForm } from './EditEntryForm';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EditEntrySheetProps {
  entry: TimeEntryWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Edit Entry Sheet Component
 * Story 4.5 - AC2: Full-screen edit form in bottom sheet
 */
export function EditEntrySheet({
  entry,
  open,
  onOpenChange,
  onSuccess,
}: EditEntrySheetProps) {
  if (!entry) return null;

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Edit Entry</SheetTitle>
          <SheetDescription className="sr-only">
            Edit your time entry details
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-8">
          <EditEntryForm
            entry={entry}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
