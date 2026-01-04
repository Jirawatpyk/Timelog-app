'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
import { deactivateUser, reactivateUser } from '@/actions/user';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, UserMinus, UserPlus } from 'lucide-react';

interface StatusToggleButtonProps {
  userId: string;
  isActive: boolean;
  userName: string;
  currentUserId: string;
}

/**
 * StatusToggleButton - Toggle user active status
 * Story 7.4: Deactivate User (AC 1, 2, 3)
 *
 * - Shows "Deactivate" (red) for active users
 * - Shows "Reactivate" (green) for inactive users
 * - Confirmation dialog for deactivation
 * - Direct action for reactivation
 */
export function StatusToggleButton({
  userId,
  isActive,
  userName,
  currentUserId,
}: StatusToggleButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  // AC 5: Prevent self-deactivation
  const isSelf = userId === currentUserId;

  const handleDeactivate = () => {
    setShowConfirm(true);
  };

  const handleConfirmDeactivate = () => {
    startTransition(async () => {
      const result = await deactivateUser(userId);
      if (result.success) {
        toast.success('User deactivated');
        setShowConfirm(false);
        router.refresh();
      } else {
        toast.error(result.error);
        // Keep dialog open on error so user can retry or cancel
      }
    });
  };

  const handleReactivate = () => {
    startTransition(async () => {
      const result = await reactivateUser(userId);
      if (result.success) {
        toast.success('User reactivated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  if (isActive) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeactivate}
          disabled={isPending || isSelf}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label={`Deactivate ${userName}`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserMinus className="h-4 w-4 mr-1" />
              Deactivate
            </>
          )}
        </Button>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertDialogTitle>Deactivate User</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Are you sure you want to deactivate this user?
                <br />
                <strong>{userName}</strong> will no longer be able to log in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeactivate}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReactivate}
      disabled={isPending}
      className="text-green-600 hover:text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-400 dark:hover:bg-green-900/30"
      aria-label={`Reactivate ${userName}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Reactivate
        </>
      )}
    </Button>
  );
}
