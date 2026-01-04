/**
 * Edit Department Dialog Component
 * Story 3.7: Department Management (AC: 5, 4)
 *
 * Modal dialog for editing existing departments with form validation.
 * Restricted to super_admin users only.
 */

'use client';

import { useState, useEffect } from 'react';
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
import { updateDepartment } from '@/actions/master-data';
import { departmentSchema, type DepartmentInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Department } from '@/types/domain';
import { Pencil } from 'lucide-react';

interface EditDepartmentDialogProps {
  department: Department;
  onDepartmentUpdated?: (department: Department) => void;
}

export function EditDepartmentDialog({ department, onDepartmentUpdated }: EditDepartmentDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: department.name },
  });

  // Reset form when dialog opens or department changes
  useEffect(() => {
    if (open) {
      form.reset({ name: department.name });
    }
  }, [open, department.name, form]);

  const onSubmit = async (data: DepartmentInput) => {
    const result = await updateDepartment(department.id, data);

    if (result.success) {
      toast.success('Department updated');
      onDepartmentUpdated?.(result.data);
      setOpen(false);
    } else {
      form.setError('name', { message: result.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Department Name</Label>
            <Input
              id="edit-name"
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
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
