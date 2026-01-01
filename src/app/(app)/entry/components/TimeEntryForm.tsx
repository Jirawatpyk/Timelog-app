'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientSelector, ProjectSelector, JobSelector } from '@/components/entry';
import { cascadingSelectorsSchema, type CascadingSelectorsInput } from '@/schemas/time-entry.schema';

/**
 * Time Entry Form Component
 * Story 4.2: Cascading Client → Project → Job selectors
 *
 * Note: Service, Task, Duration, Date fields will be added in Stories 4.3 and 4.4
 */
export function TimeEntryForm() {
  // Local state for cascading dependency tracking
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Form state with React Hook Form + Zod validation
  const form = useForm<CascadingSelectorsInput>({
    resolver: zodResolver(cascadingSelectorsSchema),
    defaultValues: {
      clientId: '',
      projectId: '',
      jobId: '',
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

      {/* Placeholder for Service, Task, Duration fields - Story 4.3 */}
      <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
        <p>Service, Task, and Duration fields will be added in Story 4.3</p>
      </div>

      {/* Placeholder for Date and Submit - Story 4.4 */}
      <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
        <p>Date selection and submission will be added in Story 4.4</p>
      </div>
    </form>
  );
}
