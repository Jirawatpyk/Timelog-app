# Story 4.7: Recent Combinations Quick Entry

Status: ready-for-dev

## Story

As a **staff member**,
I want **to quickly create entries using my recent combinations**,
So that **I can log repetitive work in seconds**.

## Acceptance Criteria

1. **AC1: Recent Combinations Display**
   - Given I am on the /entry page
   - When the page loads
   - Then I see "รายการล่าสุด" section above the form
   - And it shows up to 5 recent combinations

2. **AC2: Combination Content**
   - Given I view a recent combination
   - When looking at the display
   - Then I see: Client › Project › Job › Service
   - And Task is shown if present
   - And the combination is tappable

3. **AC3: Quick Fill on Tap**
   - Given I tap a recent combination
   - When the tap registers
   - Then the form is populated with that combination's values
   - And cascading selectors are properly set
   - And only Duration and Date need to be entered
   - And focus moves to Duration field

4. **AC4: Combination Update on Save**
   - Given I save an entry with a new combination
   - When the save succeeds
   - Then user_recent_combinations table is updated
   - And this combination appears at the top of recent list
   - And if more than 5 combinations, oldest is removed

5. **AC5: Empty State**
   - Given I have no recent entries
   - When I view the recent section
   - Then I see: "ยังไม่มีรายการล่าสุด"
   - And a subtle hint to create first entry

6. **AC6: Loading State**
   - Given recent combinations are loading
   - When the page renders
   - Then I see skeleton placeholders
   - And the form remains usable

7. **AC7: Combination Deduplication**
   - Given I use the same combination multiple times
   - When viewing recent list
   - Then the combination appears only once
   - And last_used_at is updated to most recent

## Tasks / Subtasks

- [ ] **Task 1: Create Recent Combinations Component** (AC: 1, 2)
  - [ ] 1.1 Create `components/entry/RecentCombinations.tsx`
  - [ ] 1.2 Display up to 5 combinations
  - [ ] 1.3 Format as "Client › Project › Job › Service (Task)"
  - [ ] 1.4 Style as tappable cards

- [ ] **Task 2: Create Recent Combinations Query** (AC: 1, 6)
  - [ ] 2.1 Create `getRecentCombinations` Server Action
  - [ ] 2.2 Create `useRecentCombinations` hook
  - [ ] 2.3 Handle loading and error states

- [ ] **Task 3: Implement Quick Fill Logic** (AC: 3)
  - [ ] 3.1 Pass combination data to form
  - [ ] 3.2 Set all selector values correctly
  - [ ] 3.3 Initialize cascading state (clientId, projectId)
  - [ ] 3.4 Focus duration field after fill

- [ ] **Task 4: Update Combinations on Save** (AC: 4, 7)
  - [ ] 4.1 Call upsertRecentCombination on entry save
  - [ ] 4.2 Implement deduplication logic
  - [ ] 4.3 Limit to 5 combinations per user
  - [ ] 4.4 Invalidate query after update

- [ ] **Task 5: Add Empty State** (AC: 5)
  - [ ] 5.1 Create empty state component/message
  - [ ] 5.2 Show hint for first-time users

- [ ] **Task 6: Add Loading Skeleton** (AC: 6)
  - [ ] 6.1 Create skeleton for combination cards
  - [ ] 6.2 Match final layout to prevent shift

- [ ] **Task 7: Integrate with Entry Page** (AC: all)
  - [ ] 7.1 Add RecentCombinations above form
  - [ ] 7.2 Wire up form population
  - [ ] 7.3 Test full flow

## Dev Notes

### Recent Combination Type

```typescript
// src/types/domain.ts (additions)

export interface RecentCombination {
  id: string;
  userId: string;
  clientId: string;
  projectId: string;
  jobId: string;
  serviceId: string;
  taskId: string | null;
  lastUsedAt: string;
  // Joined data for display
  client: { id: string; name: string };
  project: { id: string; name: string };
  job: { id: string; name: string; jobNo: string | null };
  service: { id: string; name: string };
  task: { id: string; name: string } | null;
}
```

### Recent Combinations Server Action

```typescript
// src/actions/entry.ts (additions)

export async function getRecentCombinations(): Promise<ActionResult<RecentCombination[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('user_recent_combinations')
    .select(`
      id,
      user_id,
      client_id,
      project_id,
      job_id,
      service_id,
      task_id,
      last_used_at,
      client:clients (id, name),
      project:projects (id, name),
      job:jobs (id, name, job_no),
      service:services (id, name),
      task:tasks (id, name)
    `)
    .eq('user_id', user.id)
    .order('last_used_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Failed to fetch recent combinations:', error);
    return { success: false, error: error.message };
  }

  // Transform to camelCase
  const transformed: RecentCombination[] = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    clientId: row.client_id,
    projectId: row.project_id,
    jobId: row.job_id,
    serviceId: row.service_id,
    taskId: row.task_id,
    lastUsedAt: row.last_used_at,
    client: row.client,
    project: row.project,
    job: {
      id: row.job.id,
      name: row.job.name,
      jobNo: row.job.job_no,
    },
    service: row.service,
    task: row.task,
  }));

  return { success: true, data: transformed };
}
```

### Recent Combinations Query Hook

```typescript
// src/hooks/use-entry-data.ts (additions)

export function useRecentCombinations() {
  return useQuery({
    queryKey: ['recentCombinations'],
    queryFn: async () => {
      const result = await getRecentCombinations();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30_000, // 30 seconds
  });
}
```

### Recent Combinations Component

```typescript
// src/components/entry/RecentCombinations.tsx
'use client';

import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecentCombinations } from '@/hooks/use-entry-data';
import { cn } from '@/lib/utils';
import type { RecentCombination } from '@/types/domain';

interface RecentCombinationsProps {
  onSelect: (combination: RecentCombination) => void;
}

export function RecentCombinations({ onSelect }: RecentCombinationsProps) {
  const { data: combinations, isLoading, error } = useRecentCombinations();

  if (isLoading) {
    return <RecentCombinationsSkeleton />;
  }

  if (error) {
    return null; // Silently fail - not critical
  }

  if (!combinations || combinations.length === 0) {
    return <EmptyRecentCombinations />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>รายการล่าสุด</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {combinations.map((combo) => (
          <CombinationCard
            key={combo.id}
            combination={combo}
            onClick={() => onSelect(combo)}
          />
        ))}
      </div>
    </div>
  );
}

interface CombinationCardProps {
  combination: RecentCombination;
  onClick: () => void;
}

function CombinationCard({ combination, onClick }: CombinationCardProps) {
  const { client, project, job, service, task } = combination;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-shrink-0 w-[280px] p-3 rounded-lg border bg-card',
        'text-left transition-colors',
        'hover:bg-accent hover:border-accent-foreground/20',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'touch-manipulation'
      )}
    >
      <div className="space-y-1">
        {/* Client › Project */}
        <p className="text-sm font-medium truncate">
          {client.name} › {project.name}
        </p>

        {/* Job */}
        <p className="text-sm text-muted-foreground truncate">
          {job.jobNo ? `${job.jobNo} - ` : ''}{job.name}
        </p>

        {/* Service (Task) */}
        <p className="text-xs text-muted-foreground truncate">
          {service.name}
          {task && ` • ${task.name}`}
        </p>
      </div>
    </button>
  );
}

function RecentCombinationsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="flex-shrink-0 w-[280px] h-[76px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function EmptyRecentCombinations() {
  return (
    <div className="py-4 text-center text-sm text-muted-foreground">
      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>ยังไม่มีรายการล่าสุด</p>
      <p className="text-xs mt-1">บันทึก entry แรกเพื่อเริ่มต้น</p>
    </div>
  );
}
```

### Updated TimeEntryForm with Recent Combinations

```typescript
// src/app/(app)/entry/components/TimeEntryForm.tsx (updated)
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

import { timeEntrySchema, type TimeEntryInput } from '@/schemas/time-entry.schema';
import { createTimeEntry, upsertRecentCombination } from '@/actions/entry';
import { getTodayISO } from '@/lib/thai-date';
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

  // Handle recent combination selection
  const handleRecentSelect = (combination: RecentCombination) => {
    // Set all form values
    form.setValue('clientId', combination.clientId);
    form.setValue('projectId', combination.projectId);
    form.setValue('jobId', combination.jobId);
    form.setValue('serviceId', combination.serviceId);
    form.setValue('taskId', combination.taskId);

    // Update cascading state
    setClientId(combination.clientId);
    setProjectId(combination.projectId);

    // Clear duration and keep today's date (user needs to fill these)
    form.setValue('durationHours', 0);
    form.setValue('entryDate', getTodayISO());

    // Focus duration input for quick entry
    setTimeout(() => {
      durationInputRef.current?.focus();
    }, 100);

    // Toast feedback
    toast.info('กรอกแล้ว! ใส่ระยะเวลาได้เลย');
  };

  // ... rest of the form logic from Story 4.4

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

    // Invalidate queries to refresh recent combinations
    queryClient.invalidateQueries({ queryKey: ['recentCombinations'] });
  };

  return (
    <>
      {/* Recent Combinations - Quick Entry */}
      <div className="mb-6">
        <RecentCombinations onSelect={handleRecentSelect} />
      </div>

      {/* Divider */}
      <div className="border-t mb-6" />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Cascading Selectors */}
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

        <div className="border-t" />

        {/* Service & Task */}
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

        <div className="border-t" />

        {/* Duration & Date */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="sr-only">ระยะเวลาและวันที่</legend>

          <DurationInput
            ref={durationInputRef}
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

      {/* Success Animation */}
      <SuccessAnimation show={showSuccess} onComplete={handleSuccessComplete} />
    </>
  );
}
```

### Updated DurationInput with forwardRef

```typescript
// src/components/entry/DurationInput.tsx (updated)
'use client';

import { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DURATION_PRESETS } from '@/lib/duration';
import { cn } from '@/lib/utils';

interface DurationInputProps {
  value: number;
  onChange: (hours: number) => void;
  error?: string;
}

export const DurationInput = forwardRef<HTMLInputElement, DurationInputProps>(
  function DurationInput({ value, onChange, error }, ref) {
    const [inputValue, setInputValue] = useState(value ? String(value) : '');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);

      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        onChange(numVal);
      }
    };

    const handlePresetClick = (preset: number) => {
      setInputValue(String(preset));
      onChange(preset);
    };

    const handleBlur = () => {
      const numVal = parseFloat(inputValue);
      if (!isNaN(numVal)) {
        const rounded = Math.round(numVal * 4) / 4;
        setInputValue(String(rounded));
        onChange(rounded);
      }
    };

    return (
      <div className="space-y-3">
        <Label htmlFor="duration">Duration (hours) *</Label>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={value === preset ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className="min-w-[60px]"
            >
              {preset}h
            </Button>
          ))}
        </div>

        {/* Custom input */}
        <div className="relative">
          <Input
            ref={ref}
            id="duration"
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter hours"
            className={cn('pr-12', error && 'border-destructive')}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            ชม.
          </span>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-muted-foreground">
          ใส่เป็นชั่วโมง (เช่น 1.5 = 1 ชม. 30 นาที)
        </p>
      </div>
    );
  }
);
```

### Upsert Recent Combination (Updated)

```typescript
// src/actions/entry.ts (confirm from Story 4.4)

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

  // Build query for exact match (including null task)
  let query = supabase
    .from('user_recent_combinations')
    .select('id')
    .eq('user_id', user.id)
    .eq('client_id', input.clientId)
    .eq('project_id', input.projectId)
    .eq('job_id', input.jobId)
    .eq('service_id', input.serviceId);

  if (input.taskId) {
    query = query.eq('task_id', input.taskId);
  } else {
    query = query.is('task_id', null);
  }

  const { data: existing } = await query.single();

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

    // Keep only last 5 combinations (delete oldest if more)
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

### Horizontal Scroll CSS

```css
/* Add to globals.css or component */

/* Hide scrollbar but allow scroll */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
}
```

### Project Structure

```
src/
├── components/
│   └── entry/
│       ├── RecentCombinations.tsx  # NEW
│       └── DurationInput.tsx       # MODIFIED - Add forwardRef
├── hooks/
│   └── use-entry-data.ts           # MODIFIED - Add useRecentCombinations
├── actions/
│   └── entry.ts                    # MODIFIED - Add getRecentCombinations
├── types/
│   └── domain.ts                   # MODIFIED - Add RecentCombination type
└── app/
    └── (app)/
        └── entry/
            └── components/
                └── TimeEntryForm.tsx  # MODIFIED - Add recent combo handling
```

### UX Flow: Quick Entry

```
Page Load
    ↓
Show Recent Combinations (horizontal scroll)
    ↓ User taps a combination
Form auto-fills: Client, Project, Job, Service, Task
    ↓
Focus jumps to Duration field
    ↓ User enters duration + taps preset
User taps "บันทึก"
    ↓
Entry saved, Recent list updated
```

### Quick Entry Time Target: <10 seconds

| Step | Action | Time |
|------|--------|------|
| 1 | See recent combinations | 0s (instant) |
| 2 | Tap combination | 1s |
| 3 | Tap duration preset | 2s |
| 4 | Tap Submit | 1s |
| 5 | Wait for save | 2s |
| **Total** | | **~6 seconds** |

### Card Dimensions

- Width: 280px (fixed for consistency)
- Height: ~76px (auto based on content)
- Gap: 8px between cards
- Overflow: horizontal scroll

### Testing Considerations

```typescript
// test/e2e/entry/recent-combinations.test.ts
import { test, expect } from '@playwright/test';

test.describe('Recent Combinations', () => {
  test('shows up to 5 recent combinations', async ({ page }) => {
    // Create 6 different entries
    // Navigate to /entry
    // Verify only 5 combinations shown
    // Verify oldest is not visible
  });

  test('fills form on combination tap', async ({ page }) => {
    // Create an entry
    // Navigate to /entry
    // Tap recent combination
    // Verify all selectors filled
    // Verify duration field focused
  });

  test('shows empty state for new users', async ({ page }) => {
    // Login as new user (no entries)
    // Navigate to /entry
    // Verify empty state message
  });

  test('deduplicates same combination', async ({ page }) => {
    // Create entry with combination A
    // Create another entry with same combination A
    // Verify combination A appears only once
    // Verify it's at the top (most recent)
  });
});
```

### Accessibility

- Combination cards are focusable buttons
- Horizontal scroll is keyboard navigable (arrow keys)
- Screen reader announces card content
- Focus indicator visible on cards
- Touch targets exceed 44x44px

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Recent Combinations]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.7]
- [Source: _bmad-output/project-context.md#TanStack Query Entry Only]
- [Source: _bmad-output/implementation-artifacts/4-4-time-entry-form-date-selection-submission.md]
- [Source: _bmad-output/implementation-artifacts/1-3-database-schema-time-entry-supporting-tables.md#user_recent_combinations]

## Definition of Done

- [ ] Recent combinations section visible on /entry
- [ ] Up to 5 combinations displayed
- [ ] Horizontal scroll works on mobile
- [ ] Tapping fills form correctly
- [ ] Cascading selectors initialized properly
- [ ] Focus moves to duration field after fill
- [ ] Toast confirms form filled
- [ ] Combination updated on entry save
- [ ] Deduplication works correctly
- [ ] Limit of 5 enforced
- [ ] Empty state shows for new users
- [ ] Loading skeleton displays during fetch
- [ ] Query invalidates after save

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
