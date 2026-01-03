'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { UserRow } from './UserRow';
import { Card, CardContent } from '@/components/ui/card';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import type { UserListItem } from '@/types/domain';
import { Users } from 'lucide-react';

interface UserTableProps {
  users: UserListItem[];
}

/**
 * UserTable - Displays table of users or cards on mobile
 * Story 7.1 Task 5
 *
 * - Desktop: Table with columns Name, Email, Role, Department, Status
 * - Mobile: Card layout for responsive design
 * - Empty state when no users exist (AC 5)
 */
export function UserTable({ users }: UserTableProps) {
  // AC 5: Empty state
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Email</TableHead>
              <TableHead scope="col">Role</TableHead>
              <TableHead scope="col">Department</TableHead>
              <TableHead scope="col">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {user.displayName || user.email.split('@')[0]}
                </span>
                <StatusBadge isActive={user.isActive} />
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2">
                <RoleBadge role={user.role} />
                {user.department && (
                  <span className="text-sm text-muted-foreground">
                    {user.department.name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
