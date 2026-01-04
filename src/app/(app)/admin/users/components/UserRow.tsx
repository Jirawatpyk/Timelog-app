import { TableRow, TableCell } from '@/components/ui/table';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import type { UserListItem } from '@/types/domain';

interface UserRowProps {
  user: UserListItem;
}

/**
 * UserRow - Single user row in the table
 * Story 7.1 Task 6
 *
 * Displays: Name, Email, Role badge, Department, Status badge
 * Actions dropdown is deferred to later stories (Edit, Deactivate)
 */
export function UserRow({ user }: UserRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {user.displayName || user.email.split('@')[0]}
      </TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {user.department?.name || '-'}
      </TableCell>
      <TableCell>
        <StatusBadge status={user.status} />
      </TableCell>
    </TableRow>
  );
}
