/**
 * Edit Task Dialog Component
 * Story 3.3: Task Management (AC: 4, 3)
 *
 * Modal dialog for editing existing tasks with form validation.
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
import { updateTask } from '@/actions/master-data';
import { taskSchema, type TaskInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Task } from '@/types/domain';
import { Pencil } from 'lucide-react';

interface EditTaskDialogProps {
  task: Task;
  onTaskUpdated?: (task: Task) => void;
}

export function EditTaskDialog({ task, onTaskUpdated }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: { name: task.name },
  });

  // Reset form when dialog opens or task changes
  useEffect(() => {
    if (open) {
      form.reset({ name: task.name });
    }
  }, [open, task.name, form]);

  const onSubmit = async (data: TaskInput) => {
    const result = await updateTask(task.id, data);

    if (result.success) {
      toast.success('Task updated');
      onTaskUpdated?.(result.data);
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
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Task Name</Label>
            <Input
              id="edit-name"
              placeholder="Task name"
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
