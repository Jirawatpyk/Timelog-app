/**
 * Deactivate Confirm Dialog
 * Story 3.4: Soft Delete Protection (AC: 1)
 *
 * Shows a confirmation dialog before deactivating items that are in use.
 * Displays the usage count and explains the soft delete behavior.
 */

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeactivateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: 'service' | 'task' | 'client';
  usageCount: number;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeactivateConfirmDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  usageCount,
  onConfirm,
  isPending,
}: DeactivateConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {itemName}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {usageCount > 0 ? (
                <p>
                  This {itemType} is used in <strong>{usageCount}</strong> time{' '}
                  {usageCount === 1 ? 'entry' : 'entries'}.
                </p>
              ) : (
                <p>
                  This {itemType} is not currently used in any time entries.
                </p>
              )}
              <p className="text-muted-foreground">
                {usageCount > 0 ? (
                  <>
                    It will be hidden from new entries but historical data will be
                    preserved. You can reactivate it later if needed.
                  </>
                ) : (
                  <>
                    It can be reactivated later if needed.
                  </>
                )}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deactivating...' : 'Deactivate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
