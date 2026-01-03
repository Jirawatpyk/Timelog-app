import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types/domain';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
}

/**
 * Role badge with color coding - Story 7.1 Task 8
 * Colors per story Dev Notes:
 * - staff: gray
 * - manager: blue
 * - admin: purple
 * - super_admin: red
 *
 * Labels in English per project-context.md:
 * UI Language: English only (no Thai mixed)
 */
const roleConfig: Record<
  UserRole,
  { label: string; className: string }
> = {
  staff: {
    label: 'Staff',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-100',
  },
  manager: {
    label: 'Manager',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-800 dark:text-blue-100',
  },
  admin: {
    label: 'Admin',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-800 dark:text-purple-100',
  },
  super_admin: {
    label: 'Super Admin',
    className: 'bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-100',
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, 'font-medium')}
      aria-label={`Role: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
