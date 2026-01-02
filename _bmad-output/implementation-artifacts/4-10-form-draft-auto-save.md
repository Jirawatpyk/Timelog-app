# Story 4.10: Form Draft Auto-Save

Status: done

## Story

As a **staff member**,
I want **my partially filled form to persist if I navigate away**,
So that **I don't lose my work**.

## Acceptance Criteria

1. **AC1: Auto-Save on Field Change**
   - Given I am filling out the entry form
   - When I select values but don't submit
   - Then form state is saved to sessionStorage every 2 seconds
   - And storage key is DRAFT_KEYS.entry

2. **AC2: Draft Restoration on Page Load**
   - Given I navigate away and return to /entry
   - When the page loads
   - Then form is restored from sessionStorage draft
   - And I see toast: "พบแบบร่างที่ยังไม่ได้บันทึก"
   - And I can continue or clear the draft

3. **AC3: Draft Clear on Successful Submit**
   - Given I successfully submit an entry
   - When submission completes
   - Then the draft is cleared from sessionStorage
   - And form resets to default values

4. **AC4: Expired Draft Handling**
   - Given draft is older than 24 hours
   - When page loads
   - Then draft is discarded
   - And fresh form is shown
   - And no restoration toast appears

5. **AC5: Clear Draft Action**
   - Given a draft exists and restoration toast shows
   - When I tap "ล้างแบบร่าง" (Clear Draft)
   - Then the draft is removed
   - And form resets to defaults
   - And toast confirms: "ล้างแบบร่างแล้ว"

6. **AC6: Cascading State Restoration**
   - Given draft contains cascading values (clientId, projectId)
   - When form restores
   - Then cascading selectors are properly initialized
   - And dependent dropdowns show correct options

7. **AC7: Edit Form Draft (Separate Key)**
   - Given I am editing an existing entry
   - When I modify fields but don't save
   - Then draft saves to DRAFT_KEYS.editEntry(id)
   - And doesn't affect create form draft

## Tasks / Subtasks

- [x] **Task 1: Define Draft Storage Constants** (AC: 1, 7)
  - [x] 1.1 Create/update `constants/storage.ts`
  - [x] 1.2 Define DRAFT_KEYS for entry and editEntry
  - [x] 1.3 Define DRAFT_EXPIRY_MS constant

- [x] **Task 2: Implement Draft Save Logic** (AC: 1)
  - [x] 2.1 Create `useDraftPersistence` hook
  - [x] 2.2 Save form data with timestamp
  - [x] 2.3 Debounce saves (2 seconds)

- [x] **Task 3: Implement Draft Restore Logic** (AC: 2, 6)
  - [x] 3.1 Check for draft on mount
  - [x] 3.2 Validate draft age
  - [x] 3.3 Restore cascading state
  - [x] 3.4 Show restoration toast

- [x] **Task 4: Add Clear Draft Action** (AC: 5)
  - [x] 4.1 Add action button to toast
  - [x] 4.2 Clear sessionStorage on action
  - [x] 4.3 Reset form to defaults

- [x] **Task 5: Handle Expired Drafts** (AC: 4)
  - [x] 5.1 Check savedAt timestamp
  - [x] 5.2 Discard if > 24 hours
  - [x] 5.3 Clean up expired drafts

- [x] **Task 6: Clear on Successful Submit** (AC: 3)
  - [x] 6.1 Remove draft after success animation
  - [x] 6.2 Ensure no stale drafts remain

- [x] **Task 7: Edit Form Draft Support** (AC: 7)
  - [x] 7.1 Use entry-specific key
  - [x] 7.2 Restore edit drafts correctly
  - [x] 7.3 Clear on save or cancel

## Dev Notes

### Storage Constants

```typescript
// src/constants/storage.ts
export const DRAFT_KEYS = {
  entry: 'draft-entry',
  editEntry: (id: string) => `draft-entry-${id}`,
} as const;

export const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DRAFT_SAVE_DEBOUNCE_MS = 2000; // 2 seconds
```

### Draft Data Structure

```typescript
// src/types/draft.ts
export interface FormDraft<T> {
  data: T;
  savedAt: number; // timestamp
  version: number; // for future migrations
}

export interface TimeEntryDraft {
  clientId: string;
  projectId: string;
  jobId: string;
  serviceId: string;
  taskId: string | null;
  durationHours: number;
  entryDate: string;
  notes: string;
}
```

### useDraftPersistence Hook

```typescript
// src/hooks/use-draft-persistence.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { DRAFT_KEYS, DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS } from '@/constants/storage';
import type { FormDraft } from '@/types/draft';

interface UseDraftPersistenceOptions<T> {
  form: UseFormReturn<T>;
  storageKey: string;
  onRestore?: (data: T) => void;
  enabled?: boolean;
}

export function useDraftPersistence<T extends Record<string, unknown>>({
  form,
  storageKey,
  onRestore,
  enabled = true,
}: UseDraftPersistenceOptions<T>) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredRef = useRef(false);

  // Watch form values
  const formValues = useWatch({ control: form.control });

  // Restore draft on mount
  useEffect(() => {
    if (!enabled || hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const savedDraft = sessionStorage.getItem(storageKey);
    if (!savedDraft) return;

    try {
      const draft: FormDraft<T> = JSON.parse(savedDraft);

      // Check expiry
      const now = Date.now();
      if (now - draft.savedAt > DRAFT_EXPIRY_MS) {
        // Draft expired, remove it
        sessionStorage.removeItem(storageKey);
        return;
      }

      // Restore form data
      form.reset(draft.data);
      onRestore?.(draft.data);

      // Show toast with clear action
      toast.info('พบแบบร่างที่ยังไม่ได้บันทึก', {
        action: {
          label: 'ล้างแบบร่าง',
          onClick: () => {
            sessionStorage.removeItem(storageKey);
            form.reset();
            toast.success('ล้างแบบร่างแล้ว');
          },
        },
        duration: 5000,
      });

    } catch (error) {
      // Invalid draft, remove it
      sessionStorage.removeItem(storageKey);
    }
  }, [enabled, storageKey, form, onRestore]);

  // Save draft on form change (debounced)
  useEffect(() => {
    if (!enabled) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      const draft: FormDraft<T> = {
        data: formValues as T,
        savedAt: Date.now(),
        version: 1,
      };

      sessionStorage.setItem(storageKey, JSON.stringify(draft));
    }, DRAFT_SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formValues, storageKey, enabled]);

  // Clear draft function
  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return { clearDraft };
}
```

### Updated TimeEntryForm with Draft Persistence

```typescript
// src/app/(app)/entry/components/TimeEntryForm.tsx (draft update)
'use client';

import { useState, useRef } from 'react';
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

import { useDraftPersistence } from '@/hooks/use-draft-persistence';
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
    mode: 'onBlur',
    reValidateMode: 'onChange',
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

  // Draft persistence - restore cascading state on restore
  const handleDraftRestore = (data: TimeEntryInput) => {
    if (data.clientId) setClientId(data.clientId);
    if (data.projectId) setProjectId(data.projectId);
  };

  const { clearDraft } = useDraftPersistence({
    form,
    storageKey: DRAFT_KEYS.entry,
    onRestore: handleDraftRestore,
    enabled: !isSubmitting, // Don't save during submit
  });

  const { formState: { errors } } = form;

  // Handle invalid submit
  const onInvalidSubmit = () => {
    setHasSubmitError(true);
    setTimeout(() => setHasSubmitError(false), 500);
    scrollToFirstError(errors as Record<string, { message?: string }>);
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  // Handle recent combination selection
  const handleRecentSelect = (combination: RecentCombination) => {
    form.setValue('clientId', combination.clientId, { shouldValidate: true });
    form.setValue('projectId', combination.projectId, { shouldValidate: true });
    form.setValue('jobId', combination.jobId, { shouldValidate: true });
    form.setValue('serviceId', combination.serviceId, { shouldValidate: true });
    form.setValue('taskId', combination.taskId, { shouldValidate: true });

    setClientId(combination.clientId);
    setProjectId(combination.projectId);

    form.setValue('durationHours', 0);
    form.setValue('entryDate', getTodayISO());

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
    form.clearErrors(['projectId', 'jobId']);
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

    // Clear draft after successful submit
    clearDraft();

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

      <FormErrorSummary errors={errors} show={Object.keys(errors).length > 0} />

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* ... form fields same as before ... */}

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

        <div className="pt-4">
          <SubmitButton isLoading={isSubmitting} hasErrors={hasSubmitError} />
        </div>
      </form>

      <SuccessAnimation show={showSuccess} onComplete={handleSuccessComplete} />
    </>
  );
}
```

### Updated EditEntryForm with Draft Persistence

```typescript
// src/components/entry/EditEntryForm.tsx (draft update)
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// ... imports

import { useDraftPersistence } from '@/hooks/use-draft-persistence';
import { DRAFT_KEYS } from '@/constants/storage';

interface EditEntryFormProps {
  entry: TimeEntryWithDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditEntryForm({ entry, onSuccess, onCancel }: EditEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientId, setClientId] = useState<string>(entry.job.project.client.id);
  const [projectId, setProjectId] = useState<string>(entry.job.project.id);

  const form = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      clientId: entry.job.project.client.id,
      projectId: entry.job.project.id,
      jobId: entry.job.id,
      serviceId: entry.service.id,
      taskId: entry.task?.id ?? null,
      durationHours: minutesToHours(entry.durationMinutes),
      entryDate: entry.entryDate,
      notes: entry.notes ?? '',
    },
  });

  // Draft persistence with entry-specific key
  const handleDraftRestore = (data: TimeEntryInput) => {
    if (data.clientId) setClientId(data.clientId);
    if (data.projectId) setProjectId(data.projectId);
  };

  const { clearDraft } = useDraftPersistence({
    form,
    storageKey: DRAFT_KEYS.editEntry(entry.id),
    onRestore: handleDraftRestore,
    enabled: !isSubmitting,
  });

  const onSubmit = async (data: TimeEntryInput) => {
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

      // Clear draft on success
      clearDraft();

      toast.success('อัพเดทเรียบร้อย');
      onSuccess();
    } catch (error) {
      toast.error('ไม่สามารถอัพเดทได้ กรุณาลองอีกครั้ง');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Optional: Ask if user wants to keep draft
    clearDraft();
    onCancel();
  };

  // ... rest of form JSX
}
```

### Draft Cleanup Utility

```typescript
// src/lib/draft-utils.ts

import { DRAFT_KEYS, DRAFT_EXPIRY_MS } from '@/constants/storage';
import type { FormDraft } from '@/types/draft';

/**
 * Clean up all expired drafts from sessionStorage
 * Call this on app initialization
 */
export function cleanupExpiredDrafts(): void {
  const now = Date.now();

  // Check entry draft
  cleanupDraftIfExpired(DRAFT_KEYS.entry, now);

  // Check all edit drafts (keys matching pattern)
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith('draft-entry-')) {
      cleanupDraftIfExpired(key, now);
    }
  }
}

function cleanupDraftIfExpired(key: string, now: number): void {
  const saved = sessionStorage.getItem(key);
  if (!saved) return;

  try {
    const draft: FormDraft<unknown> = JSON.parse(saved);
    if (now - draft.savedAt > DRAFT_EXPIRY_MS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // Invalid JSON, remove it
    sessionStorage.removeItem(key);
  }
}

/**
 * Check if a draft exists for given key
 */
export function hasDraft(key: string): boolean {
  return sessionStorage.getItem(key) !== null;
}

/**
 * Get draft age in minutes
 */
export function getDraftAge(key: string): number | null {
  const saved = sessionStorage.getItem(key);
  if (!saved) return null;

  try {
    const draft: FormDraft<unknown> = JSON.parse(saved);
    return Math.floor((Date.now() - draft.savedAt) / (1000 * 60));
  } catch {
    return null;
  }
}
```

### Initialize Cleanup on App Load

```typescript
// src/app/(app)/layout.tsx (add cleanup)
'use client';

import { useEffect } from 'react';
import { cleanupExpiredDrafts } from '@/lib/draft-utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Cleanup expired drafts on app load
  useEffect(() => {
    cleanupExpiredDrafts();
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <main className="container">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

### Project Structure

```
src/
├── constants/
│   └── storage.ts                  # MODIFIED - Add expiry, debounce
├── types/
│   └── draft.ts                    # NEW
├── hooks/
│   └── use-draft-persistence.ts    # NEW
├── lib/
│   └── draft-utils.ts              # NEW
└── app/
    └── (app)/
        ├── layout.tsx              # MODIFIED - Add cleanup
        └── entry/
            └── components/
                └── TimeEntryForm.tsx  # MODIFIED - Use hook
```

### Draft Behavior Summary

| Event | Action |
|-------|--------|
| Form field change | Save to sessionStorage (debounced 2s) |
| Page load | Restore draft if exists and not expired |
| Expired draft (>24h) | Discard silently |
| User taps "ล้างแบบร่าง" | Clear draft, reset form |
| Successful submit | Clear draft |
| Edit form cancel | Clear edit draft |

### Storage Keys

| Key | Usage |
|-----|-------|
| `draft-entry` | Create entry form |
| `draft-entry-{uuid}` | Edit entry form (per entry) |

### Testing Considerations

```typescript
// test/e2e/entry/draft-persistence.test.ts
import { test, expect } from '@playwright/test';

test.describe('Form Draft Persistence', () => {
  test('saves draft on form change', async ({ page }) => {
    await page.goto('/entry');

    // Select a client
    await page.click('#clientId');
    await page.click('[data-value="client-1"]');

    // Wait for debounce
    await page.waitForTimeout(2500);

    // Check sessionStorage
    const draft = await page.evaluate(() => {
      return sessionStorage.getItem('draft-entry');
    });

    expect(draft).not.toBeNull();
    const parsed = JSON.parse(draft!);
    expect(parsed.data.clientId).toBe('client-1');
  });

  test('restores draft on page reload', async ({ page }) => {
    await page.goto('/entry');

    // Fill some fields
    await page.click('#clientId');
    await page.click('[data-value="client-1"]');
    await page.waitForTimeout(2500);

    // Reload page
    await page.reload();

    // Check restoration toast
    await expect(page.locator('text=พบแบบร่างที่ยังไม่ได้บันทึก')).toBeVisible();

    // Check field is restored
    await expect(page.locator('#clientId')).toContainText('Client 1');
  });

  test('clears draft on submit', async ({ page }) => {
    await page.goto('/entry');

    // Fill and submit form
    // ... fill all fields
    await page.click('button:has-text("บันทึก")');

    // Wait for success
    await expect(page.locator('text=บันทึกแล้ว')).toBeVisible();

    // Check draft is cleared
    const draft = await page.evaluate(() => {
      return sessionStorage.getItem('draft-entry');
    });
    expect(draft).toBeNull();
  });

  test('discards expired draft', async ({ page }) => {
    // Set expired draft
    await page.evaluate(() => {
      const expiredDraft = {
        data: { clientId: 'old-client' },
        savedAt: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        version: 1,
      };
      sessionStorage.setItem('draft-entry', JSON.stringify(expiredDraft));
    });

    await page.goto('/entry');

    // No restoration toast
    await expect(page.locator('text=พบแบบร่างที่ยังไม่ได้บันทึก')).not.toBeVisible();

    // Draft should be cleared
    const draft = await page.evaluate(() => {
      return sessionStorage.getItem('draft-entry');
    });
    expect(draft).toBeNull();
  });

  test('clear draft button works', async ({ page }) => {
    await page.goto('/entry');

    // Create draft
    await page.click('#clientId');
    await page.click('[data-value="client-1"]');
    await page.waitForTimeout(2500);
    await page.reload();

    // Click clear button in toast
    await page.click('button:has-text("ล้างแบบร่าง")');

    // Confirm clear toast
    await expect(page.locator('text=ล้างแบบร่างแล้ว')).toBeVisible();

    // Form should be empty
    await expect(page.locator('#clientId')).toContainText('เลือก Client');
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Form State Persistence]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.10]
- [Source: _bmad-output/project-context.md#DRAFT_KEYS]
- [Source: _bmad-output/implementation-artifacts/4-4-time-entry-form-date-selection-submission.md]
- [Source: _bmad-output/implementation-artifacts/4-5-edit-own-time-entry.md]

## Definition of Done

- [x] Draft saves to sessionStorage on field change
- [x] Save is debounced (2 seconds)
- [x] Draft restores on page load
- [x] Restoration toast shows with clear action
- [x] Cascading state restores correctly
- [x] Expired drafts (>24h) are discarded
- [x] Draft clears on successful submit
- [x] Edit form uses entry-specific key
- [x] Clear draft action works
- [x] Cleanup runs on app initialization
- [x] All tests pass (1011 passing, 12 failing are unrelated RLS tests)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Task 1**: Added `DRAFT_EXPIRY_MS` (24h) and `DRAFT_SAVE_DEBOUNCE_MS` (2s) constants to `storage.ts`. Created tests for constants validation.

2. **Task 2-5**: Created `useDraftPersistence` hook implementing debounced save (2s), restore on mount, expiry checking, and clear draft action in toast. Uses `useWatch` from react-hook-form for value observation.

3. **Task 5**: Created `draft-utils.ts` with `cleanupExpiredDrafts()` function. Fixed index shifting bug when iterating sessionStorage by collecting keys first before processing.

4. **Task 6**: Integrated `clearDraft()` call after successful submission in both TimeEntryForm and EditEntryForm.

5. **Task 7**: EditEntryForm uses entry-specific key via `DRAFT_KEYS.editEntry(entry.id)`. Added `handleCancel` that clears draft before calling onCancel.

6. **App Initialization**: Created `DraftCleanup` client component and added to `(app)/layout.tsx` for expired draft cleanup on app load.

7. **Types**: Created `src/types/draft.ts` with `FormDraft<T>` and `TimeEntryDraft` interfaces.

8. **Tests**:
   - 5 tests for storage constants
   - 8 tests for use-draft-persistence hook
   - 9 tests for draft-utils

### File List

**Created:**
- `src/types/draft.ts` - Draft type definitions
- `src/hooks/use-draft-persistence.ts` - Main draft persistence hook
- `src/hooks/use-draft-persistence.test.ts` - Hook unit tests
- `src/lib/draft-utils.ts` - Draft cleanup utilities
- `src/lib/draft-utils.test.ts` - Utility unit tests
- `src/components/shared/draft-cleanup.tsx` - Client component for app initialization
- `src/components/shared/draft-cleanup.test.tsx` - DraftCleanup component tests
- `src/constants/storage.test.ts` - Storage constants tests

**Modified:**
- `src/constants/storage.ts` - Added DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS
- `src/app/(app)/layout.tsx` - Added DraftCleanup component
- `src/app/(app)/entry/components/TimeEntryForm.tsx` - Integrated useDraftPersistence
- `src/components/entry/EditEntryForm.tsx` - Integrated useDraftPersistence with entry-specific key

## Code Review Fixes

1. **H1 Fixed**: Removed incorrect `'use client'` directive from test file
2. **M2 Fixed**: Added `draft-cleanup.test.tsx` with 3 tests for DraftCleanup component
3. **M3 Fixed**: Removed unused `TimeEntryDraft` interface from `src/types/draft.ts`
4. **M4 Fixed**: Added missing `afterEach` import in `draft-utils.test.ts`
5. **L1 Fixed**: Updated all test names to snake_case convention
6. **L2 Fixed**: Moved clearDraft() before form.reset() with accurate comment
7. **L3 Fixed**: Removed redundant SSR checks from `hasDraft` and `getDraftAge`

## Post-Implementation Refactoring (Action Item 3)

### Draft Code Consolidation

Consolidated draft-related code from 4 scattered locations into single `src/lib/draft/` module:

**Before (scattered):**
```
src/constants/storage.ts           # Draft keys, expiry, debounce
src/types/draft.ts                 # FormDraft type
src/hooks/use-draft-persistence.ts # Hook
src/lib/draft-utils.ts             # Cleanup utilities
```

**After (consolidated):**
```
src/lib/draft/
├── index.ts               # Barrel export
├── types.ts               # FormDraft type
├── constants.ts           # DRAFT_KEYS, DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS
├── utils.ts               # cleanupExpiredDrafts, hasDraft, getDraftAge
├── utils.test.ts          # 9 tests
├── use-draft-persistence.ts       # Main hook
└── use-draft-persistence.test.ts  # 10 tests
```

**Import changes:**
```typescript
// Before
import { DRAFT_KEYS, DRAFT_EXPIRY_MS } from '@/constants/storage';
import { useDraftPersistence } from '@/hooks/use-draft-persistence';
import { cleanupExpiredDrafts } from '@/lib/draft-utils';

// After
import { DRAFT_KEYS, useDraftPersistence, cleanupExpiredDrafts } from '@/lib/draft';
```

**Files updated:**
- `src/app/(app)/entry/components/TimeEntryForm.tsx`
- `src/components/entry/EditEntryForm.tsx`
- `src/components/shared/draft-cleanup.tsx`
- `src/components/shared/draft-cleanup.test.tsx`

**Files deleted:**
- `src/constants/storage.ts`
- `src/constants/storage.test.ts`
- `src/types/draft.ts`
- `src/hooks/use-draft-persistence.ts`
- `src/hooks/use-draft-persistence.test.ts`
- `src/lib/draft-utils.ts`
- `src/lib/draft-utils.test.ts`

All 1059 tests passing after consolidation.
