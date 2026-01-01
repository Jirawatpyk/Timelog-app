'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ClientSelector,
  ProjectSelector,
  JobSelector,
  ServiceSelector,
  TaskSelector,
  DurationInput,
} from '@/components/entry';
import {
  cascadingSelectorsSchema,
  durationHoursSchema,
} from '@/schemas/time-entry.schema';

/**
 * Partial form schema for Stories 4.2 + 4.3
 * Story 4.4 will add entryDate and notes
 */
const partialFormSchema = cascadingSelectorsSchema.extend({
  serviceId: z.string().uuid('กรุณาเลือก Service'),
  taskId: z.string().uuid().nullable().optional(),
  durationHours: durationHoursSchema,
});

type PartialFormInput = z.infer<typeof partialFormSchema>;

/**
 * Time Entry Form Component
 * Story 4.2: Cascading Client → Project → Job selectors
 * Story 4.3: Service, Task, and Duration fields
 *
 * Note: Date and Submit will be added in Story 4.4
 */
export function TimeEntryForm() {
  // Local state for cascading dependency tracking
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Form state with React Hook Form + Zod validation
  const form = useForm<PartialFormInput>({
    resolver: zodResolver(partialFormSchema),
    defaultValues: {
      clientId: '',
      projectId: '',
      jobId: '',
      serviceId: '',
      taskId: null,
      durationHours: 0,
    },
  });

  /**
   * Handle client change - clears project and job (AC4)
   */
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    setProjectId(null);
    form.setValue('clientId', newClientId, { shouldValidate: true });
    form.setValue('projectId', '', { shouldValidate: false });
    form.setValue('jobId', '', { shouldValidate: false });
  };

  /**
   * Handle project change - clears job (AC5)
   */
  const handleProjectChange = (newProjectId: string) => {
    setProjectId(newProjectId);
    form.setValue('projectId', newProjectId, { shouldValidate: true });
    form.setValue('jobId', '', { shouldValidate: false });
  };

  /**
   * Handle job selection
   */
  const handleJobChange = (jobId: string) => {
    form.setValue('jobId', jobId, { shouldValidate: true });
  };

  return (
    <form className="space-y-6" data-testid="time-entry-form">
      {/* Cascading Selectors - Story 4.2 */}
      <div className="space-y-4">
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
      </div>

      {/* Divider */}
      <div className="border-t pt-6" />

      {/* Service & Task - Story 4.3 */}
      <div className="space-y-4">
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
      </div>

      {/* Duration - Story 4.3 */}
      <DurationInput
        value={form.watch('durationHours')}
        onChange={(val) => form.setValue('durationHours', val, { shouldValidate: true })}
        error={form.formState.errors.durationHours?.message}
      />

      {/* Placeholder for Date and Submit - Story 4.4 */}
      <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
        <p>Date selection and submission will be added in Story 4.4</p>
      </div>
    </form>
  );
}
