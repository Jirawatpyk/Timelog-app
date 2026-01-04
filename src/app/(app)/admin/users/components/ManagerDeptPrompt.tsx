/**
 * Manager Department Assignment Prompt
 * Story 7.5: Assign Roles (Task 4, AC 3)
 *
 * AlertDialog shown after role change to manager,
 * prompting user to assign departments now or later.
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

interface ManagerDeptPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user clicks "Assign Now" */
  onAssignNow: () => void;
  /** Called when user clicks "Later" */
  onLater: () => void;
}

export function ManagerDeptPrompt({
  open,
  onOpenChange,
  onAssignNow,
  onLater,
}: ManagerDeptPromptProps) {
  const handleAssignNow = () => {
    onAssignNow();
    onOpenChange(false);
  };

  const handleLater = () => {
    onLater();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Departments</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to assign departments now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLater}>Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleAssignNow}>Assign Now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
