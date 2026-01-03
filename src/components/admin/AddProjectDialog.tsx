/**
 * Add Project Dialog Component
 * Story 3.6: Projects & Jobs Admin UI (AC: 2)
 *
 * Modal dialog for creating new projects with client selection.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createProject } from '@/actions/master-data';
import { createProjectSchema, type CreateProjectInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Client, ProjectWithClient } from '@/types/domain';

interface AddProjectDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onProjectCreated?: (project: ProjectWithClient) => void;
  clients: Client[];
}

export function AddProjectDialog({
  open: controlledOpen,
  onOpenChange,
  onProjectCreated,
  clients,
}: AddProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { clientId: '', name: '' },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    const result = await createProject(data);

    if (result.success) {
      toast.success('Project created');
      form.reset();

      // Find client name for the created project
      const client = clients.find((c) => c.id === data.clientId);
      const projectWithClient: ProjectWithClient = {
        ...result.data,
        clientName: client?.name || '',
      };

      onProjectCreated?.(projectWithClient);
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
          <span className="hidden sm:inline sm:ml-1">Add Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Client *</Label>
            <Select
              value={form.watch('clientId')}
              onValueChange={(value) => form.setValue('clientId', value)}
            >
              <SelectTrigger id="clientId" className="w-full [&>span]:truncate">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.clientId && (
              <p className="text-destructive text-sm">
                {form.formState.errors.clientId.message}
              </p>
            )}
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
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
            {form.formState.isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
