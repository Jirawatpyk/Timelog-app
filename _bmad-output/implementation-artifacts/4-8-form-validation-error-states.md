# Story 4.8: Form Validation & Error States

Status: ready-for-dev

## Story

As a **staff member**,
I want **clear validation feedback on the entry form**,
So that **I can correct errors before submission**.

## Acceptance Criteria

1. **AC1: Required Field Validation - Client**
   - Given I try to submit without selecting Client
   - When I tap "บันทึก"
   - Then Client field shows error: "กรุณาเลือก Client"
   - And the field is highlighted with destructive border

2. **AC2: Required Field Validation - All Fields**
   - Given I try to submit with missing required fields
   - When validation runs
   - Then each missing field shows appropriate error:
     - Client: "กรุณาเลือก Client"
     - Project: "กรุณาเลือก Project"
     - Job: "กรุณาเลือก Job"
     - Service: "กรุณาเลือก Service"
     - Duration: "กรุณาใส่ระยะเวลา"

3. **AC3: Duration Validation**
   - Given I enter an invalid duration
   - When field loses focus or I submit
   - Then I see appropriate error:
     - 0 or empty: "กรุณาใส่ระยะเวลา"
     - > 24: "ระยะเวลาต้องไม่เกิน 24 ชั่วโมง"
     - Not 0.25 increment: "กรุณาใส่เวลาเป็นช่วง 15 นาที"

4. **AC4: Scroll to First Error**
   - Given there are validation errors
   - When I tap submit
   - Then the form scrolls to the first error field
   - And that field receives focus

5. **AC5: Submit Button Shake**
   - Given validation fails
   - When I tap submit
   - Then the submit button shakes briefly (400ms)
   - And provides visual feedback that action was rejected

6. **AC6: Real-time Validation**
   - Given I have triggered an error
   - When I correct the field
   - Then the error clears immediately
   - And the field returns to normal state

7. **AC7: Form Disabled During Submit**
   - Given I tap submit with valid data
   - When the request is in progress
   - Then all form fields are disabled
   - And no duplicate submissions are possible

8. **AC8: Error Toast for Server Errors**
   - Given server returns an error
   - When response is received
   - Then I see toast with error message
   - And form data is preserved
   - And form is re-enabled

## Tasks / Subtasks

- [ ] **Task 1: Complete Zod Schema with Thai Messages** (AC: 1, 2, 3)
  - [ ] 1.1 Finalize time-entry.schema.ts
  - [ ] 1.2 Add all Thai error messages
  - [ ] 1.3 Add duration validation rules

- [ ] **Task 2: Implement Field-Level Error Display** (AC: 1, 2)
  - [ ] 2.1 Update all selector components to show errors
  - [ ] 2.2 Add destructive border styling
  - [ ] 2.3 Add error message below field

- [ ] **Task 3: Implement Scroll to Error** (AC: 4)
  - [ ] 3.1 Create scrollToFirstError utility
  - [ ] 3.2 Add ref to each form field
  - [ ] 3.3 Focus first error field

- [ ] **Task 4: Add Submit Button Shake Animation** (AC: 5)
  - [ ] 4.1 Create shake animation with framer-motion
  - [ ] 4.2 Trigger on validation failure
  - [ ] 4.3 Duration: 400ms

- [ ] **Task 5: Implement Real-time Validation** (AC: 6)
  - [ ] 5.1 Configure react-hook-form mode
  - [ ] 5.2 Clear errors on field change
  - [ ] 5.3 Validate on blur

- [ ] **Task 6: Handle Form Disabled State** (AC: 7)
  - [ ] 6.1 Disable all inputs during submission
  - [ ] 6.2 Show loading state on button
  - [ ] 6.3 Prevent double submission

- [ ] **Task 7: Server Error Handling** (AC: 8)
  - [ ] 7.1 Display error toast
  - [ ] 7.2 Preserve form data
  - [ ] 7.3 Re-enable form on error

## Dev Notes

### Complete Time Entry Schema

```typescript
// src/schemas/time-entry.schema.ts
import { z } from 'zod';

// Duration validation: 0.25 to 24 hours, in 0.25 increments
const durationHoursSchema = z
  .number({
    required_error: 'กรุณาใส่ระยะเวลา',
    invalid_type_error: 'กรุณาใส่ตัวเลข',
  })
  .min(0.25, 'กรุณาใส่เวลาอย่างน้อย 15 นาที (0.25 ชม.)')
  .max(24, 'ระยะเวลาต้องไม่เกิน 24 ชั่วโมง')
  .refine(
    (val) => val % 0.25 === 0,
    'กรุณาใส่เวลาเป็นช่วง 15 นาที (0.25, 0.5, 0.75...)'
  );

const entryDateSchema = z
  .string({
    required_error: 'กรุณาเลือกวันที่',
  })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง');

export const timeEntrySchema = z.object({
  // Cascading selectors
  clientId: z
    .string({
      required_error: 'กรุณาเลือก Client',
    })
    .uuid('กรุณาเลือก Client'),

  projectId: z
    .string({
      required_error: 'กรุณาเลือก Project',
    })
    .uuid('กรุณาเลือก Project'),

  jobId: z
    .string({
      required_error: 'กรุณาเลือก Job',
    })
    .uuid('กรุณาเลือก Job'),

  // Service & Task
  serviceId: z
    .string({
      required_error: 'กรุณาเลือก Service',
    })
    .uuid('กรุณาเลือก Service'),

  taskId: z.string().uuid().nullable().optional(),

  // Duration & Date
  durationHours: durationHoursSchema,
  entryDate: entryDateSchema,

  // Notes (optional)
  notes: z
    .string()
    .max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
});

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;

// Validation helper for pre-submit check
export function validateTimeEntry(data: unknown) {
  return timeEntrySchema.safeParse(data);
}
```

### Scroll to First Error Utility

```typescript
// src/lib/form-utils.ts

/**
 * Scroll to and focus the first form field with an error
 * @param errors - React Hook Form errors object
 * @param fieldOrder - Array of field names in display order
 */
export function scrollToFirstError(
  errors: Record<string, { message?: string }>,
  fieldOrder: string[] = [
    'clientId',
    'projectId',
    'jobId',
    'serviceId',
    'taskId',
    'durationHours',
    'entryDate',
  ]
): void {
  // Find first field with error in display order
  const firstErrorField = fieldOrder.find((field) => errors[field]);

  if (!firstErrorField) return;

  // Find the element
  const element = document.getElementById(firstErrorField);
  if (!element) return;

  // Scroll into view
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });

  // Focus after scroll completes
  setTimeout(() => {
    element.focus();
  }, 300);
}

/**
 * Get field refs map for form fields
 */
export function createFieldRefs() {
  return {
    clientId: null as HTMLButtonElement | null,
    projectId: null as HTMLButtonElement | null,
    jobId: null as HTMLButtonElement | null,
    serviceId: null as HTMLButtonElement | null,
    taskId: null as HTMLButtonElement | null,
    durationHours: null as HTMLInputElement | null,
    entryDate: null as HTMLButtonElement | null,
  };
}
```

### Submit Button with Shake Animation

```typescript
// src/components/entry/SubmitButton.tsx (updated)
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  isLoading: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  hasErrors?: boolean;
  onClick?: () => void;
}

export function SubmitButton({
  isLoading,
  isSuccess,
  disabled,
  hasErrors,
  onClick,
}: SubmitButtonProps) {
  const [shouldShake, setShouldShake] = useState(false);

  // Trigger shake when hasErrors changes to true
  useEffect(() => {
    if (hasErrors) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [hasErrors]);

  return (
    <motion.div
      animate={shouldShake ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      } : {}}
    >
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
    </motion.div>
  );
}
```

### Updated Selector Components with Error States

```typescript
// src/components/entry/ClientSelector.tsx (updated error handling)
'use client';

import { forwardRef } from 'react';
import { useClients } from '@/hooks/use-entry-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
  disabled?: boolean;
  error?: string;
}

export const ClientSelector = forwardRef<HTMLButtonElement, ClientSelectorProps>(
  function ClientSelector({ value, onChange, disabled, error }, ref) {
    const { data: clients, isLoading } = useClients();

    if (isLoading) {
      return (
        <div className="space-y-2">
          <Label>Client *</Label>
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor="clientId" className={error ? 'text-destructive' : ''}>
          Client *
        </Label>
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger
            ref={ref}
            id="clientId"
            className={cn(
              'min-h-[44px]',
              error && 'border-destructive ring-destructive focus:ring-destructive'
            )}
          >
            <SelectValue placeholder="เลือก Client" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
```

### Form Error Boundary Component

```typescript
// src/components/entry/FormErrorSummary.tsx
'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { FieldErrors } from 'react-hook-form';

interface FormErrorSummaryProps {
  errors: FieldErrors;
  show?: boolean;
}

export function FormErrorSummary({ errors, show = true }: FormErrorSummaryProps) {
  const errorCount = Object.keys(errors).length;

  if (!show || errorCount === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>กรุณาแก้ไขข้อผิดพลาด</AlertTitle>
      <AlertDescription>
        มี {errorCount} ช่องที่ต้องแก้ไข
      </AlertDescription>
    </Alert>
  );
}
```

### Updated TimeEntryForm with Validation

```typescript
// src/app/(app)/entry/components/TimeEntryForm.tsx (validation update)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { RecentCombinations } from '@/components/entry/RecentCombinations';
import { ClientSelector } from '@/components/entry/ClientSelector';
import { ProjectSelector } from '@/components/entry/ProjectSelector';
import { JobSelector } from '@/components/entry/JobSelector';
import { ServiceSelector } from '@/components/entry/ServiceSelector';
import { TaskSelector } from '@/components/entry/TaskSelector';
import { DurationInput } from '@/components/entry/DurationInput';
import { DatePicker } from '@/components/entry/DatePicker';
import { SubmitButton } from '@/components/entry/SubmitButton';
import { SuccessAnimation } from '@/components/entry/SuccessAnimation';
import { FormErrorSummary } from '@/components/entry/FormErrorSummary';

import { timeEntrySchema, type TimeEntryInput } from '@/schemas/time-entry.schema';
import { createTimeEntry, upsertRecentCombination } from '@/actions/entry';
import { getTodayISO } from '@/lib/thai-date';
import { scrollToFirstError } from '@/lib/form-utils';
import { DRAFT_KEYS } from '@/constants/storage';
import type { RecentCombination } from '@/types/domain';

export function TimeEntryForm() {
  const queryClient = useQueryClient();
  const durationInputRef = useRef<HTMLInputElement>(null);

  // Local state for cascading
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  const form = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
    mode: 'onBlur', // Validate on blur
    reValidateMode: 'onChange', // Re-validate on change after first error
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

  const { formState: { errors, isValid } } = form;

  // Handle invalid submit (for shake animation)
  const onInvalidSubmit = () => {
    setHasSubmitError(true);
    // Reset after animation
    setTimeout(() => setHasSubmitError(false), 500);

    // Scroll to first error
    scrollToFirstError(errors as Record<string, { message?: string }>);

    // Haptic feedback for error
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  // Handle recent combination selection
  const handleRecentSelect = (combination: RecentCombination) => {
    // Set all form values
    form.setValue('clientId', combination.clientId, { shouldValidate: true });
    form.setValue('projectId', combination.projectId, { shouldValidate: true });
    form.setValue('jobId', combination.jobId, { shouldValidate: true });
    form.setValue('serviceId', combination.serviceId, { shouldValidate: true });
    form.setValue('taskId', combination.taskId, { shouldValidate: true });

    // Update cascading state
    setClientId(combination.clientId);
    setProjectId(combination.projectId);

    // Clear duration (user needs to fill)
    form.setValue('durationHours', 0);
    form.setValue('entryDate', getTodayISO());

    // Focus duration input
    setTimeout(() => {
      durationInputRef.current?.focus();
    }, 100);

    toast.info('กรอกแล้ว! ใส่ระยะเวลาได้เลย');
  };

  // Cascading handlers
  const handleClientChange = (id: string) => {
    setClientId(id);
    setProjectId(null);
    form.setValue('clientId', id, { shouldValidate: true });
    form.setValue('projectId', '', { shouldValidate: false });
    form.setValue('jobId', '', { shouldValidate: false });
    form.clearErrors(['projectId', 'jobId']); // Clear cascading errors
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    form.setValue('projectId', id, { shouldValidate: true });
    form.setValue('jobId', '', { shouldValidate: false });
    form.clearErrors('jobId');
  };

  const handleJobChange = (id: string) => {
    form.setValue('jobId', id, { shouldValidate: true });
  };

  // Form submission
  const onSubmit = async (data: TimeEntryInput) => {
    setIsSubmitting(true);

    try {
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

      // Update recent combinations
      upsertRecentCombination({
        clientId: data.clientId,
        projectId: data.projectId,
        jobId: data.jobId,
        serviceId: data.serviceId,
        taskId: data.taskId ?? null,
      });

      // Show success
      setShowSuccess(true);

      // Haptic feedback
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

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['recentCombinations'] });
  };

  return (
    <>
      {/* Recent Combinations */}
      <div className="mb-6">
        <RecentCombinations onSelect={handleRecentSelect} />
      </div>

      <div className="border-t mb-6" />

      {/* Error Summary (optional - shows at top) */}
      <FormErrorSummary errors={errors} show={Object.keys(errors).length > 0} />

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
        className="space-y-6"
        noValidate // Use custom validation
      >
        {/* Cascading Selectors */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <ClientSelector
            value={form.watch('clientId')}
            onChange={handleClientChange}
            error={errors.clientId?.message}
          />

          <ProjectSelector
            clientId={clientId}
            value={form.watch('projectId')}
            onChange={handleProjectChange}
            disabled={!clientId}
            error={errors.projectId?.message}
          />

          <JobSelector
            projectId={projectId}
            value={form.watch('jobId')}
            onChange={handleJobChange}
            disabled={!projectId}
            error={errors.jobId?.message}
          />
        </fieldset>

        <div className="border-t" />

        {/* Service & Task */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <ServiceSelector
            value={form.watch('serviceId')}
            onChange={(val) => form.setValue('serviceId', val, { shouldValidate: true })}
            error={errors.serviceId?.message}
          />

          <TaskSelector
            value={form.watch('taskId') ?? null}
            onChange={(val) => form.setValue('taskId', val)}
            error={errors.taskId?.message}
          />
        </fieldset>

        <div className="border-t" />

        {/* Duration & Date */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <DurationInput
            ref={durationInputRef}
            value={form.watch('durationHours')}
            onChange={(val) => form.setValue('durationHours', val, { shouldValidate: true })}
            error={errors.durationHours?.message}
          />

          <DatePicker
            value={form.watch('entryDate')}
            onChange={(val) => form.setValue('entryDate', val, { shouldValidate: true })}
            error={errors.entryDate?.message}
          />
        </fieldset>

        {/* Submit Button */}
        <div className="pt-4">
          <SubmitButton
            isLoading={isSubmitting}
            hasErrors={hasSubmitError}
          />
        </div>
      </form>

      {/* Success Animation */}
      <SuccessAnimation show={showSuccess} onComplete={handleSuccessComplete} />
    </>
  );
}
```

### CSS for Error States

```css
/* Add to globals.css if not using Tailwind classes */

/* Error shake animation fallback */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

/* Error field highlight */
.field-error {
  border-color: hsl(var(--destructive));
  box-shadow: 0 0 0 1px hsl(var(--destructive));
}
```

### Project Structure

```
src/
├── components/
│   └── entry/
│       ├── SubmitButton.tsx        # MODIFIED - Add shake animation
│       ├── ClientSelector.tsx      # MODIFIED - Add error display
│       ├── ProjectSelector.tsx     # MODIFIED - Add error display
│       ├── JobSelector.tsx         # MODIFIED - Add error display
│       ├── ServiceSelector.tsx     # MODIFIED - Add error display
│       ├── TaskSelector.tsx        # MODIFIED - Add error display
│       ├── DurationInput.tsx       # MODIFIED - Add error display
│       ├── DatePicker.tsx          # MODIFIED - Add error display
│       └── FormErrorSummary.tsx    # NEW
├── lib/
│   └── form-utils.ts               # NEW - scrollToFirstError
├── schemas/
│   └── time-entry.schema.ts        # MODIFIED - Complete Thai messages
└── app/
    └── (app)/
        └── entry/
            └── components/
                └── TimeEntryForm.tsx  # MODIFIED - Add validation handling
```

### Validation Error Messages Summary

| Field | Condition | Thai Message |
|-------|-----------|--------------|
| Client | Empty | กรุณาเลือก Client |
| Project | Empty | กรุณาเลือก Project |
| Job | Empty | กรุณาเลือก Job |
| Service | Empty | กรุณาเลือก Service |
| Duration | Empty/0 | กรุณาใส่ระยะเวลา |
| Duration | < 0.25 | กรุณาใส่เวลาอย่างน้อย 15 นาที |
| Duration | > 24 | ระยะเวลาต้องไม่เกิน 24 ชั่วโมง |
| Duration | Not 0.25 increment | กรุณาใส่เวลาเป็นช่วง 15 นาที |
| Date | Invalid format | รูปแบบวันที่ไม่ถูกต้อง |
| Notes | > 500 chars | หมายเหตุต้องไม่เกิน 500 ตัวอักษร |

### React Hook Form Configuration

| Option | Value | Reason |
|--------|-------|--------|
| mode | 'onBlur' | Validate when leaving field |
| reValidateMode | 'onChange' | Clear errors on fix |
| resolver | zodResolver | Use Zod for validation |

### Testing Considerations

```typescript
// test/e2e/entry/form-validation.test.ts
import { test, expect } from '@playwright/test';

test.describe('Form Validation', () => {
  test('shows error for missing required fields', async ({ page }) => {
    await page.goto('/entry');
    await page.click('button:has-text("บันทึก")');

    await expect(page.locator('text=กรุณาเลือก Client')).toBeVisible();
    await expect(page.locator('text=กรุณาเลือก Project')).toBeVisible();
  });

  test('submit button shakes on validation error', async ({ page }) => {
    await page.goto('/entry');
    const button = page.locator('button:has-text("บันทึก")');

    await button.click();

    // Check for animation (motion div parent)
    await expect(button.locator('..')).toHaveCSS('animation', /shake/);
  });

  test('scrolls to first error field', async ({ page }) => {
    await page.goto('/entry');
    await page.click('button:has-text("บันทึก")');

    // First error field should be focused
    await expect(page.locator('#clientId')).toBeFocused();
  });

  test('clears error when field is corrected', async ({ page }) => {
    await page.goto('/entry');
    await page.click('button:has-text("บันทึก")');

    // Select a client
    await page.click('#clientId');
    await page.click('[data-value="some-client-id"]');

    // Error should be cleared
    await expect(page.locator('text=กรุณาเลือก Client')).not.toBeVisible();
  });

  test('shows duration validation error', async ({ page }) => {
    await page.goto('/entry');

    // Enter invalid duration
    await page.fill('#duration', '25');
    await page.click('body'); // Blur

    await expect(page.locator('text=ระยะเวลาต้องไม่เกิน 24 ชั่วโมง')).toBeVisible();
  });
});
```

### Accessibility

- Error messages linked with aria-describedby
- role="alert" on error messages
- Focus management on validation failure
- Color + icon for error indication (not color alone)
- Clear error states when corrected

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Form Handling]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.8]
- [Source: _bmad-output/project-context.md#React Hook Form + Zod]
- [Source: _bmad-output/implementation-artifacts/4-4-time-entry-form-date-selection-submission.md]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Error Handling]

## Definition of Done

- [ ] All required fields show Thai error messages
- [ ] Error messages display below fields
- [ ] Fields have destructive border on error
- [ ] Duration validation works (0.25-24, increments)
- [ ] Form scrolls to first error on submit
- [ ] Submit button shakes on validation failure
- [ ] Errors clear when fields are corrected
- [ ] Form is disabled during submission
- [ ] Server errors show toast notification
- [ ] Form data preserved on error
- [ ] Haptic feedback on validation error
- [ ] FormErrorSummary component created

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
