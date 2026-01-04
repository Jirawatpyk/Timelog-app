/**
 * Add User Dialog Component
 * Story 7.2: Create New User (AC 1, 2, 3, 4, 5, 6)
 *
 * Modal dialog for creating new users with form validation.
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
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Loader2 } from 'lucide-react';
import { createUser, getActiveDepartments, getCurrentUserRole } from '@/actions/user';
import { createUserSchema, type CreateUserInput } from '@/schemas/user.schema';
import { toast } from 'sonner';
import type { User, UserRole, DepartmentOption } from '@/types/domain';

interface AddUserDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUserCreated?: (user: User) => void;
}

// Role options with labels
const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export function AddUserDialog({
  open: controlledOpen,
  onOpenChange,
  onUserCreated,
}: AddUserDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      displayName: '',
      role: 'staff',
      departmentId: '',
    },
    mode: 'onBlur', // AC 5: Validate when field loses focus
  });

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

  // AC 6: Scroll to first error when validation fails
  useEffect(() => {
    const errors = form.formState.errors;
    const firstErrorKey = Object.keys(errors)[0] as keyof CreateUserInput | 'root';
    if (firstErrorKey && firstErrorKey !== 'root' && formRef.current) {
      const errorElement = formRef.current.querySelector(`[id="${firstErrorKey}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (errorElement as HTMLElement).focus?.();
      }
    }
  }, [form.formState.errors]);

  // Filter role options - admin can't create super_admin
  const availableRoles = ROLE_OPTIONS.filter((role) => {
    if (role.value === 'super_admin') {
      return currentUserRole === 'super_admin';
    }
    return true;
  });

  const onSubmit = async (data: CreateUserInput) => {
    const result = await createUser(data);

    if (result.success) {
      // Story 7.2a: AC 3 - Success toast with email confirmation
      toast.success(`User created. Invitation sent to ${data.email}`);
      form.reset();
      onUserCreated?.(result.data);
      handleOpenChange(false);
    } else {
      // Set error on email field for duplicate email
      if (result.error.includes('Email')) {
        form.setError('email', { message: result.error });
      } else {
        form.setError('root', { message: result.error });
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
    if (!newOpen) {
      form.reset();
      setFetchError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="sm:w-auto sm:px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-1">Add User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <p className="text-destructive text-sm">{fetchError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
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
                onValueChange={(value) => form.setValue('role', value as UserRole)}
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
                onValueChange={(value) => form.setValue('departmentId', value)}
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

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
