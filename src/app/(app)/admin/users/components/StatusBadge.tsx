import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isActive: boolean;
}

/**
 * Status badge component - Story 7.1 Task 9
 * Labels in English per project-context.md:
 * - Active = green "Active"
 * - Inactive = gray "Inactive"
 */
export function StatusBadge({ isActive }: StatusBadgeProps) {
  if (isActive) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'bg-green-100 text-green-800 hover:bg-green-100/80',
          'dark:bg-green-800 dark:text-green-100',
          'font-medium'
        )}
        aria-label="Status: Active"
      >
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'bg-gray-100 text-gray-500 hover:bg-gray-100/80',
        'dark:bg-gray-700 dark:text-gray-300',
        'font-medium'
      )}
      aria-label="Status: Inactive"
    >
      Inactive
    </Badge>
  );
}
