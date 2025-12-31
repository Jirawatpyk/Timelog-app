# Story 4.4: Time Entry Form - Date Selection & Submission

Status: ready-for-dev

## Story

As a **staff member**,
I want **to select an entry date and submit my time entry**,
So that **my work hours are recorded for the correct day**.

## Acceptance Criteria

1. **AC1: Date Field Default**
   - Given I am filling out the time entry form
   - When I view the date field
   - Then it defaults to today's date
   - And the date is displayed in Thai format

2. **AC2: Date Picker**
   - Given I want to change the date
   - When I tap the date field
   - Then a date picker opens
   - And I can select a different date
   - And the picker closes after selection

3. **AC3: Thai Date Format Display**
   - Given I select a date
   - When the date is displayed
   - Then it shows in Thai format: "31 ธ.ค. 2567"
   - And uses Buddhist calendar year (พ.ศ.)

4. **AC4: Future Date Warning**
   - Given I select a date more than 1 day in the future
   - When the date is confirmed
   - Then I see a subtle warning (not blocking)
   - And the date is still allowed

5. **AC5: Form Submission Success**
   - Given all required fields are filled (Client, Project, Job, Service, Duration, Date)
   - When I tap "บันทึก" (Save) button
   - Then the entry is created via Server Action
   - And I see success animation (checkmark with confetti)
   - And the form resets for next entry
   - And the entry appears in my dashboard

6. **AC6: Form Submission Loading**
   - Given I tap the submit button
   - When the request is in progress
   - Then the button shows a loading spinner
   - And form fields are disabled during submission
   - And duplicate submissions are prevented

7. **AC7: Form Submission Error**
   - Given Server Action fails
   - When error response is received
   - Then I see toast: "ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง"
   - And form data is preserved
   - And I can retry immediately

8. **AC8: Recent Combinations Update**
   - Given I submit a new entry successfully
   - When submission completes
   - Then user_recent_combinations is updated
   - And this combination appears in recent list

## Tasks / Subtasks

- [ ] **Task 1: Create Date Picker Component** (AC: 1, 2, 3)
  - [ ] 1.1 Create `components/entry/DatePicker.tsx`
  - [ ] 1.2 Integrate with shadcn/ui Calendar
  - [ ] 1.3 Default to today's date
  - [ ] 1.4 Format display as Thai date

- [ ] **Task 2: Implement Thai Date Formatting** (AC: 3)
  - [ ] 2.1 Create `lib/thai-date.ts` utility
  - [ ] 2.2 Convert to Buddhist year (+ 543)
  - [ ] 2.3 Use Thai month names
  - [ ] 2.4 Format: "DD MMM YYYY" (e.g., "31 ธ.ค. 2567")

- [ ] **Task 3: Add Future Date Warning** (AC: 4)
  - [ ] 3.1 Detect future dates > 1 day
  - [ ] 3.2 Show subtle warning message
  - [ ] 3.3 Allow selection without blocking

- [ ] **Task 4: Create Submit Button Component** (AC: 6)
  - [ ] 4.1 Create `components/entry/SubmitButton.tsx`
  - [ ] 4.2 Show loading spinner during submission
  - [ ] 4.3 Disable during loading
  - [ ] 4.4 Prevent double submission

- [ ] **Task 5: Implement Form Submission** (AC: 5, 7)
  - [ ] 5.1 Create `createTimeEntry` Server Action
  - [ ] 5.2 Convert duration hours to minutes
  - [ ] 5.3 Handle success response
  - [ ] 5.4 Handle error response
  - [ ] 5.5 Show toast notifications

- [ ] **Task 6: Create Success Animation** (AC: 5)
  - [ ] 6.1 Create `components/entry/SuccessAnimation.tsx`
  - [ ] 6.2 Use framer-motion for animation
  - [ ] 6.3 Show checkmark with confetti
  - [ ] 6.4 Auto-hide after ~800ms

- [ ] **Task 7: Implement Form Reset** (AC: 5)
  - [ ] 7.1 Reset form after success animation
  - [ ] 7.2 Clear draft from sessionStorage
  - [ ] 7.3 Keep default date as today

- [ ] **Task 8: Update Recent Combinations** (AC: 8)
  - [ ] 8.1 Create `upsertRecentCombination` Server Action
  - [ ] 8.2 Call after successful entry creation
  - [ ] 8.3 Invalidate recent combinations query

- [ ] **Task 9: Complete TimeEntryForm Integration** (AC: all)
  - [ ] 9.1 Add DatePicker to form
  - [ ] 9.2 Add Submit button
  - [ ] 9.3 Wire up submission logic
  - [ ] 9.4 Test full flow

## Dev Notes

### Thai Date Formatting Utility

```typescript
// src/lib/thai-date.ts

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
] as const;

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
] as const;

const THAI_WEEKDAYS_SHORT = [
  'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
] as const;

/**
 * Convert Gregorian year to Buddhist year (พ.ศ.)
 * @param gregorianYear - e.g., 2024
 * @returns Buddhist year - e.g., 2567
 */
export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + 543;
}

/**
 * Format date to Thai format
 * @param date - Date object or ISO string
 * @param format - 'short' | 'long' | 'full'
 * @returns Formatted Thai date string
 *
 * Examples:
 * - short: "31 ธ.ค. 2567"
 * - long: "31 ธันวาคม 2567"
 * - full: "อ. 31 ธ.ค. 2567"
 */
export function formatThaiDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate();
  const month = d.getMonth();
  const buddhistYear = toBuddhistYear(d.getFullYear());
  const weekday = d.getDay();

  switch (format) {
    case 'short':
      return `${day} ${THAI_MONTHS_SHORT[month]} ${buddhistYear}`;
    case 'long':
      return `${day} ${THAI_MONTHS_FULL[month]} ${buddhistYear}`;
    case 'full':
      return `${THAI_WEEKDAYS_SHORT[weekday]} ${day} ${THAI_MONTHS_SHORT[month]} ${buddhistYear}`;
    default:
      return `${day} ${THAI_MONTHS_SHORT[month]} ${buddhistYear}`;
  }
}

/**
 * Check if date is more than N days in the future
 */
export function isFutureDate(date: Date | string, daysAhead: number = 1): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureLimit = new Date(today);
  futureLimit.setDate(futureLimit.getDate() + daysAhead);

  return d > futureLimit;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Parse ISO date string to Date object (handles timezone correctly)
 */
export function parseISODate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
```

### Date Picker Component

```typescript
// src/components/entry/DatePicker.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { formatThaiDate, isFutureDate, parseISODate } from '@/lib/thai-date';

interface DatePickerProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (date: string) => void;
  error?: string;
}

export function DatePicker({ value, onChange, error }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // Parse the ISO string to Date for Calendar component
  const selectedDate = value ? parseISODate(value) : new Date();

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Convert to ISO format for storage
      const isoDate = format(date, 'yyyy-MM-dd');
      onChange(isoDate);
      setOpen(false);
    }
  };

  const showFutureWarning = isFutureDate(value, 1);

  return (
    <div className="space-y-2">
      <Label htmlFor="entry-date">วันที่ *</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="entry-date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal min-h-[44px]',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatThaiDate(value) : 'เลือกวันที่'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Future date warning */}
      {showFutureWarning && (
        <p className="text-sm text-amber-600 dark:text-amber-500">
          ⚠️ วันที่เลือกเป็นวันในอนาคต
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

### Submit Button Component

```typescript
// src/components/entry/SubmitButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  isLoading: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SubmitButton({
  isLoading,
  isSuccess,
  disabled,
  onClick,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={isLoading || disabled}
      onClick={onClick}
      className={cn(
        'w-full min-h-[48px] text-lg font-medium',
        'touch-manipulation',
        isSuccess && 'bg-green-600 hover:bg-green-600'
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          กำลังบันทึก...
        </>
      ) : isSuccess ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          บันทึกแล้ว!
        </>
      ) : (
        'บันทึก'
      )}
    </Button>
  );
}
```

### Success Animation Component

```typescript
// src/components/entry/SuccessAnimation.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            // Auto-hide after 800ms
            setTimeout(() => {
              onComplete?.();
            }, 500);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800"
          >
            {/* Animated checkmark circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Check className="h-10 w-10 text-white stroke-[3]" />
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-medium text-green-600 dark:text-green-400"
            >
              บันทึกแล้ว! 🎯
            </motion.p>
          </motion.div>

          {/* Confetti particles */}
          <Confetti />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple confetti component
function Confetti() {
  const particles = Array.from({ length: 20 });
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 1,
            x: '50vw',
            y: '50vh',
            scale: 0,
          }}
          animate={{
            opacity: 0,
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: Math.random() * 0.5 + 0.5,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 0.8,
            delay: Math.random() * 0.2,
            ease: 'easeOut',
          }}
          className="absolute h-3 w-3 rounded-full"
          style={{ backgroundColor: colors[i % colors.length] }}
        />
      ))}
    </div>
  );
}
```

### Create Time Entry Server Action

```typescript
// src/actions/entry.ts (additions)

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { hoursToMinutes } from '@/lib/duration';
import type { ActionResult } from '@/types/actions';
import type { TimeEntry } from '@/types/domain';

interface CreateTimeEntryInput {
  jobId: string;
  serviceId: string;
  taskId: string | null;
  durationHours: number;
  entryDate: string;
  notes?: string;
}

export async function createTimeEntry(
  input: CreateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'ไม่ได้เข้าสู่ระบบ' };
  }

  // Get user's department for snapshot
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('department_id')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile?.department_id) {
    return { success: false, error: 'ไม่พบข้อมูลผู้ใช้' };
  }

  // Convert hours to minutes for storage
  const durationMinutes = hoursToMinutes(input.durationHours);

  // Create time entry
  const { data: entry, error: insertError } = await supabase
    .from('time_entries')
    .insert({
      user_id: user.id,
      job_id: input.jobId,
      service_id: input.serviceId,
      task_id: input.taskId,
      duration_minutes: durationMinutes,
      entry_date: input.entryDate,
      notes: input.notes ?? null,
      department_id: userProfile.department_id, // Snapshot at creation
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to create time entry:', insertError);
    return { success: false, error: 'ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง' };
  }

  // Revalidate dashboard to show new entry
  revalidatePath('/dashboard');
  revalidatePath('/entry');

  return { success: true, data: entry };
}

interface RecentCombinationInput {
  clientId: string;
  projectId: string;
  jobId: string;
  serviceId: string;
  taskId: string | null;
}

export async function upsertRecentCombination(
  input: RecentCombinationInput
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if this exact combination exists
  const { data: existing } = await supabase
    .from('user_recent_combinations')
    .select('id')
    .eq('user_id', user.id)
    .eq('client_id', input.clientId)
    .eq('project_id', input.projectId)
    .eq('job_id', input.jobId)
    .eq('service_id', input.serviceId)
    .is('task_id', input.taskId)
    .single();

  if (existing) {
    // Update last_used_at
    await supabase
      .from('user_recent_combinations')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    // Insert new combination
    await supabase
      .from('user_recent_combinations')
      .insert({
        user_id: user.id,
        client_id: input.clientId,
        project_id: input.projectId,
        job_id: input.jobId,
        service_id: input.serviceId,
        task_id: input.taskId,
        last_used_at: new Date().toISOString(),
      });

    // Keep only last 5 combinations
    const { data: allRecent } = await supabase
      .from('user_recent_combinations')
      .select('id')
      .eq('user_id', user.id)
      .order('last_used_at', { ascending: false });

    if (allRecent && allRecent.length > 5) {
      const toDelete = allRecent.slice(5).map((r) => r.id);
      await supabase
        .from('user_recent_combinations')
        .delete()
        .in('id', toDelete);
    }
  }

  return { success: true, data: undefined };
}
```

### Updated Time Entry Schema

```typescript
// src/schemas/time-entry.schema.ts (complete)
import { z } from 'zod';

const durationHoursSchema = z
  .number()
  .min(0.25, 'กรุณาใส่เวลาอย่างน้อย 0.25 ชั่วโมง')
  .max(24, 'กรุณาใส่เวลาไม่เกิน 24 ชั่วโมง')
  .refine(
    (val) => val % 0.25 === 0,
    'กรุณาใส่เวลาเป็นช่วง 15 นาที (0.25 ชั่วโมง)'
  );

const entryDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'กรุณาเลือกวันที่');

export const timeEntrySchema = z.object({
  // Cascading selectors (Story 4.2)
  clientId: z.string().uuid('กรุณาเลือก Client'),
  projectId: z.string().uuid('กรุณาเลือก Project'),
  jobId: z.string().uuid('กรุณาเลือก Job'),

  // Service & Task (Story 4.3)
  serviceId: z.string().uuid('กรุณาเลือก Service'),
  taskId: z.string().uuid().nullable().optional(),

  // Duration (Story 4.3)
  durationHours: durationHoursSchema,

  // Date (Story 4.4)
  entryDate: entryDateSchema,

  // Notes (optional)
  notes: z.string().max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร').optional(),
});

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
```

### Complete TimeEntryForm

```typescript
// src/app/(app)/entry/components/TimeEntryForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ClientSelector } from '@/components/entry/ClientSelector';
import { ProjectSelector } from '@/components/entry/ProjectSelector';
import { JobSelector } from '@/components/entry/JobSelector';
import { ServiceSelector } from '@/components/entry/ServiceSelector';
import { TaskSelector } from '@/components/entry/TaskSelector';
import { DurationInput } from '@/components/entry/DurationInput';
import { DatePicker } from '@/components/entry/DatePicker';
import { SubmitButton } from '@/components/entry/SubmitButton';
import { SuccessAnimation } from '@/components/entry/SuccessAnimation';

import { timeEntrySchema, type TimeEntryInput } from '@/schemas/time-entry.schema';
import { createTimeEntry, upsertRecentCombination } from '@/actions/entry';
import { getTodayISO } from '@/lib/thai-date';
import { DRAFT_KEYS } from '@/constants/storage';

export function TimeEntryForm() {
  const queryClient = useQueryClient();

  // Local state for cascading
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
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

  // Draft persistence
  useEffect(() => {
    // Restore draft on mount
    const savedDraft = sessionStorage.getItem(DRAFT_KEYS.entry);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Check if draft is less than 24 hours old
        if (parsed.savedAt && Date.now() - parsed.savedAt < 24 * 60 * 60 * 1000) {
          form.reset(parsed.data);
          setClientId(parsed.data.clientId || null);
          setProjectId(parsed.data.projectId || null);
          toast.info('พบแบบร่างที่ยังไม่ได้บันทึก');
        } else {
          sessionStorage.removeItem(DRAFT_KEYS.entry);
        }
      } catch {
        sessionStorage.removeItem(DRAFT_KEYS.entry);
      }
    }
  }, [form]);

  useEffect(() => {
    // Save draft on form changes
    const subscription = form.watch((data) => {
      sessionStorage.setItem(
        DRAFT_KEYS.entry,
        JSON.stringify({ data, savedAt: Date.now() })
      );
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Cascading handlers
  const handleClientChange = (id: string) => {
    setClientId(id);
    setProjectId(null);
    form.setValue('clientId', id);
    form.setValue('projectId', '');
    form.setValue('jobId', '');
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    form.setValue('projectId', id);
    form.setValue('jobId', '');
  };

  const handleJobChange = (id: string) => {
    form.setValue('jobId', id);
  };

  // Form submission
  const onSubmit = async (data: TimeEntryInput) => {
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

      // Update recent combinations (fire and forget)
      upsertRecentCombination({
        clientId: data.clientId,
        projectId: data.projectId,
        jobId: data.jobId,
        serviceId: data.serviceId,
        taskId: data.taskId ?? null,
      });

      // Show success animation
      setShowSuccess(true);

      // Trigger haptic feedback on iOS
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

    } catch (error) {
      toast.error('ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง');
      setIsSubmitting(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setIsSubmitting(false);

    // Reset form
    form.reset({
      clientId: '',
      projectId: '',
      jobId: '',
      serviceId: '',
      taskId: null,
      durationHours: 0,
      entryDate: getTodayISO(),
      notes: '',
    });
    setClientId(null);
    setProjectId(null);

    // Clear draft
    sessionStorage.removeItem(DRAFT_KEYS.entry);

    // Invalidate queries to refresh recent combinations
    queryClient.invalidateQueries({ queryKey: ['recentCombinations'] });
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section: Location (Client → Project → Job) */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="sr-only">เลือก Client, Project, Job</legend>

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

        {/* Section: Service & Task */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="sr-only">เลือก Service และ Task</legend>

          <ServiceSelector
            value={form.watch('serviceId')}
            onChange={(val) => form.setValue('serviceId', val)}
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

        {/* Section: Duration & Date */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="sr-only">ระยะเวลาและวันที่</legend>

          <DurationInput
            value={form.watch('durationHours')}
            onChange={(val) => form.setValue('durationHours', val)}
            error={form.formState.errors.durationHours?.message}
          />

          <DatePicker
            value={form.watch('entryDate')}
            onChange={(val) => form.setValue('entryDate', val)}
            error={form.formState.errors.entryDate?.message}
          />
        </fieldset>

        {/* Submit Button */}
        <div className="pt-4">
          <SubmitButton isLoading={isSubmitting} />
        </div>
      </form>

      {/* Success Animation Overlay */}
      <SuccessAnimation show={showSuccess} onComplete={handleSuccessComplete} />
    </>
  );
}
```

### Constants for Storage Keys

```typescript
// src/constants/storage.ts
export const DRAFT_KEYS = {
  entry: 'draft-entry',
  editEntry: (id: string) => `draft-entry-${id}`,
} as const;
```

### Project Structure

```
src/
├── components/
│   └── entry/
│       ├── ClientSelector.tsx      # From Story 4.2
│       ├── ProjectSelector.tsx     # From Story 4.2
│       ├── JobSelector.tsx         # From Story 4.2
│       ├── ServiceSelector.tsx     # From Story 4.3
│       ├── TaskSelector.tsx        # From Story 4.3
│       ├── DurationInput.tsx       # From Story 4.3
│       ├── DatePicker.tsx          # NEW
│       ├── SubmitButton.tsx        # NEW
│       └── SuccessAnimation.tsx    # NEW
├── lib/
│   ├── duration.ts                 # From Story 4.3
│   └── thai-date.ts                # NEW
├── constants/
│   └── storage.ts                  # NEW (or update existing)
├── actions/
│   └── entry.ts                    # MODIFIED - Add createTimeEntry, upsertRecentCombination
├── schemas/
│   └── time-entry.schema.ts        # MODIFIED - Add entryDate
└── app/
    └── (app)/
        └── entry/
            └── components/
                └── TimeEntryForm.tsx  # MODIFIED - Complete form
```

### Thai Date Format Examples

| Date | Format | Output |
|------|--------|--------|
| 2024-12-31 | short | 31 ธ.ค. 2567 |
| 2024-12-31 | long | 31 ธันวาคม 2567 |
| 2024-12-31 | full | อ. 31 ธ.ค. 2567 |
| 2025-01-01 | short | 1 ม.ค. 2568 |

### Accessibility Considerations

- Date picker is keyboard navigable
- Submit button has clear loading state
- Error messages are associated with inputs
- Success animation respects `prefers-reduced-motion`

### Mobile UX Considerations

- Date picker opens as popover (mobile-friendly)
- Submit button is 48px tall (exceeds 44px minimum)
- Success animation is full-screen but non-blocking
- Haptic feedback on iOS devices

### Error Handling Flow

```
User taps Submit
    ↓
Validate form (Zod)
    ↓ (fail)
Show field errors → User fixes → Retry
    ↓ (pass)
Call createTimeEntry Server Action
    ↓ (fail)
Show toast error → Form data preserved → User can retry
    ↓ (pass)
Show success animation → Reset form → Update recent
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Time Entry]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.4]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Thai Language]
- [Source: _bmad-output/implementation-artifacts/4-3-time-entry-form-service-task-duration.md]

## Definition of Done

- [ ] Date picker shows with today as default
- [ ] Thai date format displays correctly (DD MMM YYYY พ.ศ.)
- [ ] Future date warning appears for dates > 1 day ahead
- [ ] Submit button shows loading state
- [ ] Form fields are disabled during submission
- [ ] createTimeEntry Server Action works
- [ ] Success animation displays on save
- [ ] Form resets after successful submission
- [ ] Draft is cleared from sessionStorage
- [ ] Recent combinations are updated
- [ ] Error toast displays on failure
- [ ] Form data is preserved on error
- [ ] Haptic feedback works on iOS

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
