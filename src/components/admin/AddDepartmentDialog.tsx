/**
 * Add Department Dialog Component
 * Story 3.7: Department Management (AC: 3, 4)
 *
 * Modal dialog for creating new departments with form validation.
 * Restricted to super_admin users only.
 */

'use client';

import { useState } from 'react';
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
import { Plus } from 'lucide-react';
import { createDepartment } from '@/actions/master-data';
import { departmentSchema, type DepartmentInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Department } from '@/types/domain';

interface AddDepartmentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDepartmentCreated?: (department: Department) => void;
}

export function AddDepartmentDialog({
  open: controlledOpen,
  onOpenChange,
  onDepartmentCreated,
}: AddDepartmentDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const form = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: DepartmentInput) => {
    const result = await createDepartment(data);

    if (result.success) {
      toast.success('Department created');
      form.reset();
      onDepartmentCreated?.(result.data);
      handleOpenChange(false);
    } else {
      form.setError('name', { message: result.error });
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="sm:w-auto sm:px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-1">Add Department</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              placeholder="Department name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Department'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
