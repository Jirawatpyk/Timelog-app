/**
 * Add Job Dialog Component
 * Story 3.6: Projects & Jobs Admin UI (AC: 6)
 *
 * Modal dialog for creating new jobs with cascading client/project selection.
 */

'use client';

import { useState, useMemo } from 'react';
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
import { createJob } from '@/actions/master-data';
import { createJobSchema, type CreateJobInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Client, ProjectWithClient, JobWithProject } from '@/types/domain';

interface AddJobDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onJobCreated?: (job: JobWithProject) => void;
  clients: Client[];
  projects: ProjectWithClient[];
}

export function AddJobDialog({
  open: controlledOpen,
  onOpenChange,
  onJobCreated,
  clients,
  projects,
}: AddJobDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const form = useForm({
    resolver: zodResolver(createJobSchema),
    defaultValues: { projectId: '', name: '', jobNo: '', soNo: '' },
  });

  // Filter projects by selected client
  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return projects.filter((p) => p.client_id === selectedClientId);
  }, [projects, selectedClientId]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    form.setValue('projectId', ''); // Reset project when client changes
  };

  const onSubmit = async (data: CreateJobInput) => {
    const result = await createJob(data);

    if (result.success) {
      toast.success('Job created');
      form.reset();
      setSelectedClientId('');

      // Find project and client names for the created job
      const project = projects.find((p) => p.id === data.projectId);
      const client = clients.find((c) => c.id === selectedClientId);

      const jobWithProject: JobWithProject = {
        ...result.data,
        projectName: project?.name || '',
        clientName: client?.name || '',
        clientId: selectedClientId,
      };

      onJobCreated?.(jobWithProject);
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
      setSelectedClientId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="sm:w-auto sm:px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-1">Add Job</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Client Selection (filters projects) */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Client *</Label>
            <Select value={selectedClientId} onValueChange={handleClientChange}>
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
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Project *</Label>
            <Select
              value={form.watch('projectId')}
              onValueChange={(value) => form.setValue('projectId', value)}
              disabled={!selectedClientId}
            >
              <SelectTrigger id="projectId" className="w-full [&>span]:truncate">
                <SelectValue
                  placeholder={
                    selectedClientId ? 'Select a project' : 'Select a client first'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.projectId && (
              <p className="text-destructive text-sm">
                {form.formState.errors.projectId.message}
              </p>
            )}
          </div>

          {/* Job Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Job Name *</Label>
            <Input id="name" placeholder="Job name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Job No (optional) */}
          <div className="space-y-2">
            <Label htmlFor="jobNo">Job No</Label>
            <Input
              id="jobNo"
              placeholder="e.g., JOB-001"
              {...form.register('jobNo')}
            />
            {form.formState.errors.jobNo && (
              <p className="text-destructive text-sm">
                {form.formState.errors.jobNo.message}
              </p>
            )}
          </div>

          {/* SO No (optional) */}
          <div className="space-y-2">
            <Label htmlFor="soNo">SO No</Label>
            <Input
              id="soNo"
              placeholder="e.g., SO-001"
              {...form.register('soNo')}
            />
            {form.formState.errors.soNo && (
              <p className="text-destructive text-sm">
                {form.formState.errors.soNo.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Job'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
