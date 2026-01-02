'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  ClientSelector,
  ProjectSelector,
  JobSelector,
  ServiceSelector,
  TaskSelector,
  DurationInput,
  DatePicker,
} from '@/components/entry';
import { Button } from '@/components/ui/button';
import {
  timeEntryFormSchema,
  type TimeEntryFormInput,
} from '@/schemas/time-entry.schema';
import { updateTimeEntry } from '@/actions/entry';
import { minutesToHours } from '@/lib/duration';
import { DRAFT_KEYS } from '@/constants/storage';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EditEntryFormProps {
  entry: TimeEntryWithDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Edit Entry Form Component
 * Story 4.5 - AC2: Pre-populate fields with existing entry data
 * Story 4.5 - AC3: Update submission
 */
export function EditEntryForm({ entry, onSuccess, onCancel }: EditEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize cascading state from entry data
  const [clientId, setClientId] = useState<string | null>(
    entry.job.project.client.id
  );
  const [projectId, setProjectId] = useState<string | null>(
    entry.job.project.id
  );

  // Form with pre-populated values
  const form = useForm<TimeEntryFormInput>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      clientId: entry.job.project.client.id,
      projectId: entry.job.project.id,
      jobId: entry.job.id,
      serviceId: entry.service.id,
      taskId: entry.task?.id ?? null,
      durationHours: minutesToHours(entry.duration_minutes),
      entryDate: entry.entry_date,
      notes: entry.notes ?? '',
    },
  });

  // Draft key for this specific entry
  const draftKey = DRAFT_KEYS.editEntry(entry.id);

  // Restore draft on mount (Story 4.5 - AC7)
  useEffect(() => {
    const savedDraft = sessionStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Check if draft is less than 1 hour old
        const DRAFT_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
        if (parsed.savedAt && Date.now() - parsed.savedAt < DRAFT_EXPIRY_MS) {
          form.reset(parsed.data);
          setClientId(parsed.data.clientId || null);
          setProjectId(parsed.data.projectId || null);
          toast.info('Draft restored (auto-saves for 1 hour)');
        } else {
          sessionStorage.removeItem(draftKey);
        }
      } catch {
        sessionStorage.removeItem(draftKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Save draft on change (Story 4.5 - AC7)
  useEffect(() => {
    const subscription = form.watch((data) => {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({ data, savedAt: Date.now() })
      );
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey]);

  // Cascading handlers
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    setProjectId(null);
    form.setValue('clientId', newClientId, { shouldValidate: true });
    form.setValue('projectId', '', { shouldValidate: false });
    form.setValue('jobId', '', { shouldValidate: false });
  };

  const handleProjectChange = (newProjectId: string) => {
    setProjectId(newProjectId);
    form.setValue('projectId', newProjectId, { shouldValidate: true });
    form.setValue('jobId', '', { shouldValidate: false });
  };

  const handleJobChange = (jobId: string) => {
    form.setValue('jobId', jobId, { shouldValidate: true });
  };

  // Form submission
  const onSubmit = async (data: TimeEntryFormInput) => {
    setIsSubmitting(true);

    try {
      const result = await updateTimeEntry(entry.id, {
        jobId: data.jobId,
        serviceId: data.serviceId,
        taskId: data.taskId ?? null,
        durationHours: data.durationHours,
        entryDate: data.entryDate,
        notes: data.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      // Clear draft on success (Story 4.5 - AC7)
      sessionStorage.removeItem(draftKey);

      // Show success toast (Story 4.5 - AC3)
      toast.success('Entry updated successfully');

      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      onSuccess();
    } catch {
      toast.error('Failed to update. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      data-testid="edit-entry-form"
    >
      {/* Section 1: Location (Client → Project → Job) */}
      <fieldset disabled={isSubmitting} className="space-y-4">
        <legend className="sr-only">Edit Client, Project, Job</legend>

        <ClientSelector
          value={form.watch('clientId')}
          onChange={handleClientChange}
          error={form.formState.errors.clientId?.message}
        />

        <ProjectSelector
          clientId={clientId}
          value={form.watch('projectId')}
          onChange={handleProjectChange}
          disabled={!clientId}
          error={form.formState.errors.projectId?.message}
        />

        <JobSelector
          projectId={projectId}
          value={form.watch('jobId')}
          onChange={handleJobChange}
          disabled={!projectId}
          error={form.formState.errors.jobId?.message}
        />
      </fieldset>

      <div className="border-t" />

      {/* Section 2: Service & Task */}
      <fieldset disabled={isSubmitting} className="space-y-4">
        <legend className="sr-only">Edit Service and Task</legend>

        <ServiceSelector
          value={form.watch('serviceId')}
          onChange={(val) => form.setValue('serviceId', val, { shouldValidate: true })}
          error={form.formState.errors.serviceId?.message}
        />

        <TaskSelector
          value={form.watch('taskId') ?? null}
          onChange={(val) => form.setValue('taskId', val)}
          error={form.formState.errors.taskId?.message}
        />
      </fieldset>

      <div className="border-t" />

      {/* Section 3: Duration & Date */}
      <fieldset disabled={isSubmitting} className="space-y-4">
        <legend className="sr-only">Edit Duration and Date</legend>

        <DurationInput
          value={form.watch('durationHours')}
          onChange={(val) => form.setValue('durationHours', val, { shouldValidate: true })}
          error={form.formState.errors.durationHours?.message}
        />

        <DatePicker
          value={form.watch('entryDate')}
          onChange={(val) => form.setValue('entryDate', val, { shouldValidate: true })}
          error={form.formState.errors.entryDate?.message}
        />
      </fieldset>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-h-[48px]"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 min-h-[48px]"
          disabled={isSubmitting || !form.formState.isValid}
        >
          {isSubmitting ? (
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
  );
}
