/**
 * Edit Job Dialog Component
 * Story 3.6: Projects & Jobs Admin UI (AC: 7)
 *
 * Modal dialog for editing existing jobs.
 * Client/Project are read-only, only name, job_no, so_no can be changed.
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
import { updateJob } from '@/actions/master-data';
import { updateJobSchema, type UpdateJobInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { JobWithProject } from '@/types/domain';
import { Pencil } from 'lucide-react';

interface EditJobDialogProps {
  job: JobWithProject;
  onJobUpdated?: (job: JobWithProject) => void;
}

export function EditJobDialog({ job, onJobUpdated }: EditJobDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateJobSchema),
    defaultValues: {
      name: job.name,
      jobNo: job.job_no || '',
      soNo: job.so_no || '',
    },
  });

  // Reset form when dialog opens or job changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: job.name,
        jobNo: job.job_no || '',
        soNo: job.so_no || '',
      });
    }
  }, [open, job.name, job.job_no, job.so_no, form]);

  const onSubmit = async (data: UpdateJobInput) => {
    const result = await updateJob(job.id, data);

    if (result.success) {
      toast.success('Job updated');
      const updatedJob: JobWithProject = {
        ...result.data,
        projectName: job.projectName,
        clientName: job.clientName,
        clientId: job.clientId,
      };
      onJobUpdated?.(updatedJob);
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
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Client (read-only) */}
          <div className="space-y-2">
            <Label>Client</Label>
            <Input value={job.clientName} disabled className="bg-muted" />
          </div>

          {/* Project (read-only) */}
          <div className="space-y-2">
            <Label>Project</Label>
            <Input value={job.projectName} disabled className="bg-muted" />
          </div>

          {/* Job Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Job Name *</Label>
            <Input
              id="edit-name"
              placeholder="Job name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Job No */}
          <div className="space-y-2">
            <Label htmlFor="edit-jobNo">Job No</Label>
            <Input
              id="edit-jobNo"
              placeholder="e.g., JOB-001"
              {...form.register('jobNo')}
            />
            {form.formState.errors.jobNo && (
              <p className="text-destructive text-sm">
                {form.formState.errors.jobNo.message}
              </p>
            )}
          </div>

          {/* SO No */}
          <div className="space-y-2">
            <Label htmlFor="edit-soNo">SO No</Label>
            <Input
              id="edit-soNo"
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
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
