/**
 * RoleBadge Component
 * Story 4.12: Desktop Header Enhancement (AC 4)
 *
 * Displays user role with appropriate color styling per role:
 * - Staff: Neutral/slate style
 * - Manager: Blue style
 * - Admin: Purple style
 * - Super Admin: Amber/gold style
 */

import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/domain';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  staff: {
    label: 'Staff',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  manager: {
    label: 'Manager',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  admin: {
    label: 'Admin',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  super_admin: {
    label: 'Super Admin',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
