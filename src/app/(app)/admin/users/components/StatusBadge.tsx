import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserStatus } from '@/types/domain';

interface StatusBadgeProps {
  /** User status: pending (not confirmed), active (confirmed + active), inactive */
  status: UserStatus;
}

/**
 * Status configuration for each state
 * Story 7.2a: AC 7 - User Status Column in Table
 */
const statusConfig: Record<
  UserStatus,
  { label: string; className: string; ariaLabel: string }
> = {
  pending: {
    label: '🟡 Pending',
    className: cn(
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80',
      'dark:bg-yellow-800 dark:text-yellow-100'
    ),
    ariaLabel: 'Status: Pending invitation',
  },
  active: {
    label: '🟢 Active',
    className: cn(
      'bg-green-100 text-green-800 hover:bg-green-100/80',
      'dark:bg-green-800 dark:text-green-100'
    ),
    ariaLabel: 'Status: Active',
  },
  inactive: {
    label: '🔴 Inactive',
    className: cn(
      'bg-red-100 text-red-600 hover:bg-red-100/80',
      'dark:bg-red-900 dark:text-red-200'
    ),
    ariaLabel: 'Status: Inactive',
  },
};

/**
 * Status badge component - Story 7.1 Task 9, Story 7.2a Task 7
 *
 * Displays user status with color-coded badges:
 * - 🟡 Pending (yellow) - invited but not confirmed
 * - 🟢 Active (green) - confirmed and is_active = true
 * - 🔴 Inactive (red) - is_active = false
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, 'font-medium')}
      aria-label={config.ariaLabel}
    >
      {config.label}
    </Badge>
  );
}
