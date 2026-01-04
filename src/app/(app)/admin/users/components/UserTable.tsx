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
import { EditUserDialog } from './EditUserDialog';
import { ManagerDeptPrompt } from './ManagerDeptPrompt';
import { StatusToggleButton } from './StatusToggleButton';
import { DepartmentChips } from './DepartmentChips';
import { DepartmentAssignDialog } from './DepartmentAssignDialog';
import type { UserListItem } from '@/types/domain';
import { Users, Send, Loader2, Pencil, AlertTriangle, Building2 } from 'lucide-react';
import { resendInvitation } from '@/actions/user';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserTableProps {
  users: UserListItem[];
  currentUserId: string;
}

/**
 * UserTable - Displays table of users or cards on mobile
 * Story 7.1 Task 5, Story 7.2a Task 8, 10, Story 7.6 Task 5
 *
 * - Desktop: Table with columns Name, Email, Role, Department, Status, Actions
 * - Mobile: Card layout for responsive design
 * - Empty state when no users exist (AC 5)
 * - Resend Invite button for pending users (AC 8, 9)
 * - Story 7.6: Show DepartmentChips for managers, warning for no departments
 */
export function UserTable({ users, currentUserId }: UserTableProps) {
  const router = useRouter();
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  // Story 7.5 AC 3: Track when to show department assignment prompt
  const [showDeptPrompt, setShowDeptPrompt] = useState(false);
  // Story 7.6: Track manager for department assignment
  const [newManagerId, setNewManagerId] = useState<string | null>(null);
  // Story 7.6 AC 6: Direct department assignment dialog
  const [assigningDeptUser, setAssigningDeptUser] = useState<UserListItem | null>(null);

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

  // Story 7.5 AC 3: Handle role change to manager
  const handleManagerRoleAssigned = (userId: string) => {
    setNewManagerId(userId);
    setShowDeptPrompt(true);
  };

  // Story 7.5 AC 3 + Story 7.6: Handle "Assign Now" - opens department assignment dialog
  const handleAssignDeptNow = () => {
    setShowDeptPrompt(false);
    if (newManagerId) {
      const user = users.find((u) => u.id === newManagerId);
      if (user) {
        setAssigningDeptUser(user);
      }
    }
    setNewManagerId(null);
  };

  // Story 7.5 AC 3: Handle "Later"
  const handleAssignDeptLater = () => {
    setShowDeptPrompt(false);
    setNewManagerId(null);
  };

  // Story 7.6: Handle department assignment success
  const handleDeptAssignSuccess = () => {
    router.refresh();
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
              <TableRow
                key={user.id}
                className={cn(!user.isActive && 'opacity-50 bg-muted/50')}
              >
                <TableCell className="font-medium">
                  {user.displayName || user.email.split('@')[0]}
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {user.department?.name || '-'}
                    {/* Story 7.6: Show managed departments for managers */}
                    {user.role === 'manager' && (
                      <>
                        {user.managedDepartments && user.managedDepartments.length > 0 ? (
                          <DepartmentChips departments={user.managedDepartments} maxShow={3} />
                        ) : (
                          /* AC 5: Warning indicator for managers without departments */
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center text-amber-600">
                                <AlertTriangle className="h-4 w-4" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              No departments assigned
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {/* Story 7.3: Edit button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingUser(user)}
                      aria-label={`Edit ${user.displayName || user.email}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* Story 7.6 AC 6: Direct assignment button for managers */}
                    {user.role === 'manager' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAssigningDeptUser(user)}
                            aria-label={`Assign departments to ${user.displayName || user.email}`}
                          >
                            <Building2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Assign Departments</TooltipContent>
                      </Tooltip>
                    )}
                    {/* Story 7.4: Deactivate/Reactivate button */}
                    {user.status !== 'pending' && (
                      <StatusToggleButton
                        userId={user.id}
                        isActive={user.isActive}
                        userName={user.displayName || user.email}
                        currentUserId={currentUserId}
                      />
                    )}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <Card key={user.id} className={cn(!user.isActive && 'opacity-50 bg-muted/50')}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {user.displayName || user.email.split('@')[0]}
                </span>
                <StatusBadge status={user.status} />
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {/* Story 7.6: Show managed departments for managers on mobile */}
              {user.role === 'manager' && (
                <div className="flex items-center gap-2">
                  {user.managedDepartments && user.managedDepartments.length > 0 ? (
                    <DepartmentChips departments={user.managedDepartments} maxShow={2} />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      No departments assigned
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RoleBadge role={user.role} />
                  {user.department && (
                    <span className="text-sm text-muted-foreground">
                      {user.department.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {/* Story 7.3: Edit button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(user)}
                    aria-label={`Edit ${user.displayName || user.email}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {/* Story 7.6 AC 6: Direct assignment button for managers (mobile) */}
                  {user.role === 'manager' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAssigningDeptUser(user)}
                      aria-label={`Assign departments to ${user.displayName || user.email}`}
                    >
                      <Building2 className="h-4 w-4" />
                    </Button>
                  )}
                  {/* Story 7.4: Deactivate/Reactivate button */}
                  {user.status !== 'pending' && (
                    <StatusToggleButton
                      userId={user.id}
                      isActive={user.isActive}
                      userName={user.displayName || user.email}
                      currentUserId={currentUserId}
                    />
                  )}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Story 7.3: Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onManagerRoleAssigned={handleManagerRoleAssigned}
        />
      )}

      {/* Story 7.5 AC 3: Department Assignment Prompt */}
      <ManagerDeptPrompt
        open={showDeptPrompt}
        onOpenChange={setShowDeptPrompt}
        onAssignNow={handleAssignDeptNow}
        onLater={handleAssignDeptLater}
      />

      {/* Story 7.6: Department Assignment Dialog */}
      {assigningDeptUser && (
        <DepartmentAssignDialog
          managerId={assigningDeptUser.id}
          managerName={assigningDeptUser.displayName || assigningDeptUser.email}
          open={!!assigningDeptUser}
          onOpenChange={(open) => !open && setAssigningDeptUser(null)}
          onSuccess={handleDeptAssignSuccess}
        />
      )}
    </>
  );
}
