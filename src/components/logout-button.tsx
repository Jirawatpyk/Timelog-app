'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

/**
 * Logout button component with loading state
 * Story 2.2: Session Persistence & Logout (AC: 4, 7)
 *
 * Uses server action for secure logout with loading indicator.
 */
export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logout();
      // If logout fails (doesn't redirect), handle the error
      if (!result.success) {
        console.error('Logout failed:', result.error);
        // Force refresh only on failure since redirect didn't happen
        router.refresh();
      }
      // On success, server action redirects - no need for client-side refresh
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="gap-2"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </>
      )}
    </Button>
  );
}
