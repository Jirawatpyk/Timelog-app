'use client';

/**
 * UserProfileDropdown Component
 * Story 4.12: Desktop Header Enhancement (AC 1, 2, 3, 5, 6)
 *
 * Features:
 * - Displays user name/email and role badge (AC 1)
 * - Dropdown with profile info and sign out (AC 2)
 * - Sign out functionality (AC 3)
 * - Compact mode for mobile consistency (AC 5)
 * - Loading skeleton state (AC 6)
 */

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Loader2, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { logout } from '@/actions/auth';
import { RoleBadge } from './role-badge';
import { cn } from '@/lib/utils';

interface UserProfileDropdownProps {
  /** Compact mode for mobile - shows only avatar and first name */
  compact?: boolean;
}

export function UserProfileDropdown({ compact = false }: UserProfileDropdownProps) {
  const { user, role, displayName, isLoading } = useUser();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Show skeleton while loading or if no user
  if (isLoading || !user || !role) {
    return <UserProfileDropdownSkeleton compact={compact} />;
  }

  const userName = displayName || user.email || 'User';
  const userEmail = user.email || '';
  // For compact mode, show first name only or first part of email
  const shortName = displayName
    ? displayName.split(' ')[0]
    : user.email?.split('@')[0] || 'User';

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logout();
      if (!result.success) {
        console.error('Logout failed:', result.error);
        router.refresh();
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 h-auto",
            compact ? "px-1.5 py-1" : "px-2 py-1.5"
          )}
        >
          {/* User avatar placeholder */}
          <div className={cn(
            "flex items-center justify-center rounded-full bg-muted",
            compact ? "h-7 w-7" : "h-8 w-8"
          )}>
            <User className={cn(
              "text-muted-foreground",
              compact ? "h-3.5 w-3.5" : "h-4 w-4"
            )} />
          </div>

          {/* User info - compact shows short name only, full shows name + badge */}
          {compact ? (
            <span className="text-sm font-medium">{shortName}</span>
          ) : (
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">{userName}</span>
              <RoleBadge role={role} className="mt-0.5" />
            </div>
          )}

          <ChevronDown className={cn(
            "text-muted-foreground",
            compact ? "h-3.5 w-3.5" : "h-4 w-4"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="font-normal py-1.5">
          <RoleBadge role={role} />
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className={cn(
            'cursor-pointer',
            isPending && 'opacity-50'
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>กำลังออกจากระบบ...</span>
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>ออกจากระบบ</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface UserProfileDropdownSkeletonProps {
  compact?: boolean;
}

/**
 * Skeleton loading state for UserProfileDropdown
 * Shows placeholder while user data is loading (AC 6)
 */
export function UserProfileDropdownSkeleton({ compact = false }: UserProfileDropdownSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact ? "px-1.5 py-1" : "px-2 py-1.5"
      )}
      aria-label="Loading user profile"
    >
      {/* Avatar skeleton */}
      <div className={cn(
        "rounded-full bg-muted animate-pulse",
        compact ? "h-7 w-7" : "h-8 w-8"
      )} />

      {/* Text skeleton - compact shows only name, full shows name + badge */}
      {compact ? (
        <div className="h-4 w-14 bg-muted rounded animate-pulse" />
      ) : (
        <div className="flex flex-col gap-1">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
        </div>
      )}

      {/* Chevron skeleton */}
      <div className={cn(
        "bg-muted rounded animate-pulse",
        compact ? "h-3.5 w-3.5" : "h-4 w-4"
      )} />
    </div>
  );
}
