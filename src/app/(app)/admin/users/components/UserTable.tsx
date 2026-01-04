'use client';

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import type { UserListItem } from '@/types/domain';
import { Users, Send, Loader2 } from 'lucide-react';
import { resendInvitation } from '@/actions/user';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserTableProps {
  users: UserListItem[];
}

/**
 * UserTable - Displays table of users or cards on mobile
 * Story 7.1 Task 5, Story 7.2a Task 8, 10
 *
 * - Desktop: Table with columns Name, Email, Role, Department, Status, Actions
 * - Mobile: Card layout for responsive design
 * - Empty state when no users exist (AC 5)
 * - Resend Invite button for pending users (AC 8, 9)
 */
export function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResendInvite = async (userId: string, email: string) => {
    setResendingId(userId);
    try {
      const result = await resendInvitation(userId);
      if (result.success) {
        toast.success(`Invitation resent to ${email}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setResendingId(null);
    }
  };

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
              <TableHead scope="col" className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
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
                <TableCell className="text-right">
                  {/* AC 8, 9: Resend button only for pending users */}
                  {user.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResendInvite(user.id, user.email)}
                      disabled={resendingId === user.id}
                      aria-label={`Resend invitation to ${user.email}`}
                    >
                      {resendingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Resend
                        </>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
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
                <StatusBadge status={user.status} />
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RoleBadge role={user.role} />
                  {user.department && (
                    <span className="text-sm text-muted-foreground">
                      {user.department.name}
                    </span>
                  )}
                </div>
                {/* AC 8, 9: Resend button only for pending users */}
                {user.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResendInvite(user.id, user.email)}
                    disabled={resendingId === user.id}
                    aria-label={`Resend invitation to ${user.email}`}
                  >
                    {resendingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Resend
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
