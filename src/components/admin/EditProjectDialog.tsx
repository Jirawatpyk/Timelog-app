/**
 * Edit Project Dialog Component
 * Story 3.6: Projects & Jobs Admin UI (AC: 3)
 *
 * Modal dialog for editing existing projects.
 * Client is read-only, only name can be changed.
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
import { updateProject } from '@/actions/master-data';
import { updateProjectSchema, type UpdateProjectInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { ProjectWithClient } from '@/types/domain';
import { Pencil } from 'lucide-react';

interface EditProjectDialogProps {
  project: ProjectWithClient;
  onProjectUpdated?: (project: ProjectWithClient) => void;
}

export function EditProjectDialog({ project, onProjectUpdated }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: { name: project.name },
  });

  // Reset form when dialog opens or project changes
  useEffect(() => {
    if (open) {
      form.reset({ name: project.name });
    }
  }, [open, project.name, form]);

  const onSubmit = async (data: UpdateProjectInput) => {
    const result = await updateProject(project.id, data);

    if (result.success) {
      toast.success('Project updated');
      const updatedProject: ProjectWithClient = {
        ...result.data,
        clientName: project.clientName,
      };
      onProjectUpdated?.(updatedProject);
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
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Client (read-only) */}
          <div className="space-y-2">
            <Label>Client</Label>
            <Input value={project.clientName} disabled className="bg-muted" />
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name *</Label>
            <Input
              id="edit-name"
              placeholder="Project name"
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
