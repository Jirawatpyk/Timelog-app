'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ClientSelector,
  ProjectSelector,
  JobSelector,
  ServiceSelector,
  TaskSelector,
  DurationInput,
  DatePicker,
  SubmitButton,
  SuccessAnimation,
  RecentCombinations,
  FormErrorSummary,
} from '@/components/entry';
import {
  timeEntryFormSchema,
  type TimeEntryFormInput,
} from '@/schemas/time-entry.schema';
import { createTimeEntry, upsertRecentCombination } from '@/actions/entry';
import { getTodayISO } from '@/lib/thai-date';
import { DRAFT_KEYS } from '@/constants/storage';
import { scrollToFirstError, triggerErrorHaptic, triggerSuccessHaptic } from '@/lib/form-utils';
import { useDraftPersistence } from '@/hooks/use-draft-persistence';
import type { RecentCombination } from '@/types/domain';

/**
 * Time Entry Form Component
 * Story 4.2: Cascading Client → Project → Job selectors
 * Story 4.3: Service, Task, and Duration fields
 * Story 4.4: Date selection, submission, and success animation
 * Story 4.7: Recent combinations quick entry
 * Story 4.8: Form validation & error states
 */
export function TimeEntryForm() {
  const queryClient = useQueryClient();
  const durationInputRef = useRef<HTMLInputElement>(null);

  // Local state for cascading dependency tracking
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  // Form state with React Hook Form + Zod validation
  // Story 4.8 - AC6: Real-time validation configuration
  const form = useForm<TimeEntryFormInput>({
    resolver: zodResolver(timeEntryFormSchema),
    mode: 'onBlur', // Validate on blur (AC6)
    reValidateMode: 'onChange', // Re-validate on change after first error (AC6)
    defaultValues: {
      clientId: '',
      projectId: '',
      jobId: '',
      serviceId: '',
      taskId: null,
      durationHours: 0,
      entryDate: getTodayISO(),
      notes: '',
    },
  });

  const { formState: { errors } } = form;

  // Draft persistence - Story 4.10
  // AC1: Auto-save on field change (debounced 2 seconds)
  // AC2: Restore draft on page load with toast
  // AC3: Clear on successful submit
  // AC4: Discard expired drafts (>24h)
  // AC5: Clear draft action in toast
  // AC6: Restore cascading state
  const handleDraftRestore = (data: TimeEntryFormInput) => {
    if (data.clientId) setClientId(data.clientId);
    if (data.projectId) setProjectId(data.projectId);
  };

  const { clearDraft } = useDraftPersistence({
    form,
    storageKey: DRAFT_KEYS.entry,
    onRestore: handleDraftRestore,
    enabled: !isSubmitting, // Don't save during submit
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

  /**
   * Handle recent combination selection
   * Story 4.7 - AC3: Quick fill on tap
   */
  const handleRecentSelect = (combination: RecentCombination) => {
    // Set all form values
    form.setValue('clientId', combination.clientId, { shouldValidate: true });
    form.setValue('projectId', combination.projectId, { shouldValidate: true });
    form.setValue('jobId', combination.jobId, { shouldValidate: true });
    form.setValue('serviceId', combination.serviceId, { shouldValidate: true });
    form.setValue('taskId', combination.taskId);

    // Update cascading state
    setClientId(combination.clientId);
    setProjectId(combination.projectId);

    // Reset duration to 0 and keep today's date (user needs to fill these)
    form.setValue('durationHours', 0, { shouldValidate: false });
    form.setValue('entryDate', getTodayISO(), { shouldValidate: true });

    // Focus duration input for quick entry
    setTimeout(() => {
      durationInputRef.current?.focus();
    }, 100);

    // Toast feedback
    toast.info('Filled! Enter duration to continue');
  };

  /**
   * Handle form validation errors
   * Story 4.8 - AC4, AC5: Scroll to first error and shake animation
   */
  const onInvalid = () => {
    setHasSubmitError(true);
    scrollToFirstError(errors);
    triggerErrorHaptic();

    // Reset error state after animation
    setTimeout(() => setHasSubmitError(false), 500);
  };

  /**
   * Form submission handler
   * Story 4.4 - AC5, AC6, AC7
   * Story 4.8 - AC8: Server error handling
   */
  const onSubmit = async (data: TimeEntryFormInput) => {
    setIsSubmitting(true);
    setHasSubmitError(false);

    try {
      // Create time entry
      const result = await createTimeEntry({
        jobId: data.jobId,
        serviceId: data.serviceId,
        taskId: data.taskId ?? null,
        durationHours: data.durationHours,
        entryDate: data.entryDate,
        notes: data.notes,
      });

      if (!result.success) {
        // Story 4.8 - AC8: Show server error with retry option
        toast.error(result.error, {
          action: {
            label: 'Retry',
            onClick: () => form.handleSubmit(onSubmit, onInvalid)(),
          },
        });
        setIsSubmitting(false);
        return;
      }

      // Update recent combinations (fire and forget - AC8)
      upsertRecentCombination({
        clientId: data.clientId,
        projectId: data.projectId,
        jobId: data.jobId,
        serviceId: data.serviceId,
        taskId: data.taskId ?? null,
      });

      // Show success animation (AC5)
      setShowSuccess(true);

      // Trigger haptic feedback on mobile
      triggerSuccessHaptic();

    } catch {
      // AC7/AC8: Error handling with retry option
      toast.error('Failed to save. Please try again.', {
        action: {
          label: 'Retry',
          onClick: () => form.handleSubmit(onSubmit, onInvalid)(),
        },
      });
      setIsSubmitting(false);
    }
  };

  /**
   * Success animation complete handler
   * Story 4.4 - AC5: Form reset after success
   */
  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setIsSubmitting(false);

    // Story 4.10 AC3: Clear draft and reset form
    clearDraft();
    form.reset({
      clientId: '',
      projectId: '',
      jobId: '',
      serviceId: '',
      taskId: null,
      durationHours: 0,
      entryDate: getTodayISO(), // Keep default date as today
      notes: '',
    });
    setClientId(null);
    setProjectId(null);

    // Invalidate queries to refresh recent combinations
    queryClient.invalidateQueries({ queryKey: ['recentCombinations'] });
  };

  return (
    <>
      {/* Recent Combinations - Quick Entry (Story 4.7) */}
      <div className="mb-6">
        <RecentCombinations onSelect={handleRecentSelect} />
      </div>

      {/* Divider */}
      <div className="border-t mb-6" />

      {/* Form Error Summary - Story 4.8 */}
      <FormErrorSummary
        errors={errors}
        show={Object.keys(errors).length > 0 && hasSubmitError}
      />

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-6"
        data-testid="time-entry-form"
      >
        {/* Section 1: Location (Client → Project → Job) - Story 4.2 */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="sr-only">Select Client, Project, Job</legend>

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

        {/* Divider */}
        <div className="border-t" />

        {/* Section 2: Service & Task - Story 4.3 */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="sr-only">Select Service and Task</legend>

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

        {/* Divider */}
        <div className="border-t" />

        {/* Section 3: Duration & Date - Story 4.3 & 4.4 */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="sr-only">Duration and Date</legend>

          <DurationInput
            ref={durationInputRef}
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

        {/* Submit Button - Story 4.4 AC6, Story 4.8 AC5 */}
        <div className="pt-4">
          <SubmitButton
            isLoading={isSubmitting}
            disabled={!form.formState.isValid}
            hasErrors={hasSubmitError}
          />
        </div>
      </form>

      {/* Success Animation Overlay - Story 4.4 AC5 */}
      <SuccessAnimation show={showSuccess} onComplete={handleSuccessComplete} />
    </>
  );
}
