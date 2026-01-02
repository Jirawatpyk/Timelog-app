'use client';

import { useState, useEffect, useRef } from 'react';
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
} from '@/components/entry';
import {
  timeEntryFormSchema,
  type TimeEntryFormInput,
} from '@/schemas/time-entry.schema';
import { createTimeEntry, upsertRecentCombination } from '@/actions/entry';
import { getTodayISO } from '@/lib/thai-date';
import { DRAFT_KEYS } from '@/constants/storage';
import type { RecentCombination } from '@/types/domain';

/**
 * Time Entry Form Component
 * Story 4.2: Cascading Client → Project → Job selectors
 * Story 4.3: Service, Task, and Duration fields
 * Story 4.4: Date selection, submission, and success animation
 * Story 4.7: Recent combinations quick entry
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

  // Form state with React Hook Form + Zod validation
  const form = useForm<TimeEntryFormInput>({
    resolver: zodResolver(timeEntryFormSchema),
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

  // Draft persistence - restore on mount
  useEffect(() => {
    const savedDraft = sessionStorage.getItem(DRAFT_KEYS.entry);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Check if draft is less than 24 hours old
        if (parsed.savedAt && Date.now() - parsed.savedAt < 24 * 60 * 60 * 1000) {
          form.reset(parsed.data);
          setClientId(parsed.data.clientId || null);
          setProjectId(parsed.data.projectId || null);
          toast.info('Draft restored');
        } else {
          sessionStorage.removeItem(DRAFT_KEYS.entry);
        }
      } catch {
        sessionStorage.removeItem(DRAFT_KEYS.entry);
      }
    }
  }, [form]);

  // Draft persistence - save on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      sessionStorage.setItem(
        DRAFT_KEYS.entry,
        JSON.stringify({ data, savedAt: Date.now() })
      );
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
   * Form submission handler
   * Story 4.4 - AC5, AC6, AC7
   */
  const onSubmit = async (data: TimeEntryFormInput) => {
    setIsSubmitting(true);

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
        toast.error(result.error);
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
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

    } catch {
      // AC7: Error handling
      toast.error('Failed to save. Please try again.');
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

    // Reset form (Task 7)
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

    // Clear draft from sessionStorage
    sessionStorage.removeItem(DRAFT_KEYS.entry);

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

      <form
        onSubmit={form.handleSubmit(onSubmit)}
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

        {/* Submit Button - Story 4.4 AC6 */}
        <div className="pt-4">
          <SubmitButton
            isLoading={isSubmitting}
            disabled={!form.formState.isValid}
          />
        </div>
      </form>

      {/* Success Animation Overlay - Story 4.4 AC5 */}
      <SuccessAnimation show={showSuccess} onComplete={handleSuccessComplete} />
    </>
  );
}
