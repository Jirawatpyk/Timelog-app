/**
 * Edit User Dialog Component
 * Story 7.3: Edit User Information (AC 1, 2, 3, 4, 5)
 *
 * Modal dialog for editing existing users with pre-populated data.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { updateUser, getActiveDepartments, getCurrentUserRole } from '@/actions/user';
import { editUserSchema, type EditUserInput } from '@/schemas/user.schema';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { UserListItem, UserRole, DepartmentOption } from '@/types/domain';

interface EditUserDialogProps {
  user: UserListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Role options with labels
const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
      departmentId: user.department?.id || '',
    },
    mode: 'onBlur',
  });

  // Reset form when user changes
  useEffect(() => {
    if (open) {
      form.reset({
        email: user.email,
        displayName: user.displayName || '',
        role: user.role,
        departmentId: user.department?.id || '',
      });
    }
  }, [user.id, open, form, user.email, user.displayName, user.role, user.department?.id]);

  // Load departments and current user role when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      setFetchError(null);
      Promise.all([getActiveDepartments(), getCurrentUserRole()])
        .then(([deptResult, roleResult]) => {
          if (!deptResult.success) {
            setFetchError('Failed to load departments');
            return;
          }
          if (!roleResult.success) {
            setFetchError('Failed to verify permissions');
            return;
          }
          setDepartments(deptResult.data);
          setCurrentUserRole(roleResult.data);
        })
        .catch(() => {
          setFetchError('Failed to load form data');
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Scroll to first error when validation fails
  useEffect(() => {
    const errors = form.formState.errors;
    const firstErrorKey = Object.keys(errors)[0] as keyof EditUserInput | 'root';
    if (firstErrorKey && firstErrorKey !== 'root' && formRef.current) {
      const errorElement = formRef.current.querySelector(`[id="${firstErrorKey}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (errorElement as HTMLElement).focus?.();
      }
    }
  }, [form.formState.errors]);

  // Filter role options - admin can't assign super_admin
  const availableRoles = ROLE_OPTIONS.filter((role) => {
    if (role.value === 'super_admin') {
      return currentUserRole === 'super_admin';
    }
    return true;
  });

  const onSubmit = async (data: EditUserInput) => {
    const result = await updateUser(user.id, data);

    if (result.success) {
      toast.success('User updated successfully');
      router.refresh();
      onOpenChange(false);
    } else {
      // Set error on email field for duplicate email
      if (result.error.includes('Email')) {
        form.setError('email', { message: result.error });
      }
      toast.error(result.error);
    }
  };

  // AC 5: Handle dialog close with unsaved changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty) {
      setShowUnsavedChangesDialog(true);
      return;
    }
    if (!newOpen) {
      form.reset();
      setFetchError(null);
    }
    onOpenChange(newOpen);
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedChangesDialog(false);
    form.reset();
    setFetchError(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-8" role="status">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="sr-only">Loading...</span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <p className="text-destructive text-sm">{fetchError}</p>
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  {...form.register('email')}
                  aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
                />
                {form.formState.errors.email && (
                  <p id="email-error" className="text-destructive text-sm" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Display Name Field */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  {...form.register('displayName')}
                  aria-describedby={
                    form.formState.errors.displayName ? 'displayName-error' : undefined
                  }
                />
                {form.formState.errors.displayName && (
                  <p id="displayName-error" className="text-destructive text-sm" role="alert">
                    {form.formState.errors.displayName.message}
                  </p>
                )}
              </div>

              {/* Role Select */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={form.watch('role')}
                  onValueChange={(value) => form.setValue('role', value as UserRole, { shouldDirty: true })}
                >
                  <SelectTrigger id="role" aria-label="Role" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-destructive text-sm" role="alert">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              {/* Department Select */}
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select
                  value={form.watch('departmentId')}
                  onValueChange={(value) => form.setValue('departmentId', value, { shouldDirty: true })}
                >
                  <SelectTrigger id="departmentId" aria-label="Department" className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.departmentId && (
                  <p className="text-destructive text-sm" role="alert">
                    {form.formState.errors.departmentId.message}
                  </p>
                )}
              </div>

              {/* Root Error */}
              {form.formState.errors.root && (
                <p className="text-destructive text-sm" role="alert">
                  {form.formState.errors.root.message}
                </p>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* AC 5: Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
