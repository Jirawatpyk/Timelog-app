# Story 4.3: Time Entry Form - Service, Task & Duration

Status: ready-for-dev

## Story

As a **staff member**,
I want **to select Service, optional Task, and enter duration**,
So that **I can complete my time entry with all required information**.

## Acceptance Criteria

1. **AC1: Service Selector**
   - Given I have selected Client → Project → Job
   - When I continue filling the form
   - Then I see Service dropdown (required) with active services
   - And services are sorted alphabetically

2. **AC2: Task Selector (Optional)**
   - Given I am filling the form
   - When I view the Task field
   - Then I see Task dropdown with active tasks
   - And it's clearly marked as optional
   - And I can leave it empty

3. **AC3: Duration Input Field**
   - Given I am filling the form
   - When I view the Duration section
   - Then I see an input field for hours
   - And it accepts decimal values (e.g., 1.5)

4. **AC4: Duration Preset Buttons**
   - Given I tap the Duration field
   - When the input is focused
   - Then I see preset buttons: 0.5h, 1h, 2h, 4h, 8h
   - And tapping a preset fills the duration field

5. **AC5: Custom Duration Entry**
   - Given I want to enter a custom duration
   - When I type in the duration field
   - Then I can enter values in 0.25 hour increments
   - And the field accepts values from 0.25 to 24 hours

6. **AC6: Duration Validation**
   - Given I enter an invalid duration
   - When validation runs
   - Then I see error: "กรุณาใส่เวลาที่ถูกต้อง (0.25-24 ชั่วโมง)"
   - And values like 0, negative, or >24 are rejected

7. **AC7: Duration Storage Format**
   - Given I enter duration as decimal hours (e.g., 1.5)
   - When the entry is saved
   - Then the duration is stored as minutes (90)
   - And display shows "1.5 ชม." or "1 ชม. 30 นาที"

## Tasks / Subtasks

- [ ] **Task 1: Create Service Selector** (AC: 1)
  - [ ] 1.1 Create `components/entry/ServiceSelector.tsx`
  - [ ] 1.2 Add query hook for active services
  - [ ] 1.3 Integrate with form state
  - [ ] 1.4 Add loading and error states

- [ ] **Task 2: Create Task Selector** (AC: 2)
  - [ ] 2.1 Create `components/entry/TaskSelector.tsx`
  - [ ] 2.2 Add query hook for active tasks
  - [ ] 2.3 Mark as optional in UI
  - [ ] 2.4 Handle null/empty selection

- [ ] **Task 3: Create Duration Input Component** (AC: 3, 5)
  - [ ] 3.1 Create `components/entry/DurationInput.tsx`
  - [ ] 3.2 Accept decimal input
  - [ ] 3.3 Add increment/decrement buttons (optional)
  - [ ] 3.4 Format display as hours

- [ ] **Task 4: Add Duration Preset Buttons** (AC: 4)
  - [ ] 4.1 Create preset button row component
  - [ ] 4.2 Handle preset selection
  - [ ] 4.3 Highlight selected preset
  - [ ] 4.4 Style for mobile touch targets

- [ ] **Task 5: Implement Duration Validation** (AC: 6)
  - [ ] 5.1 Add Zod schema for duration
  - [ ] 5.2 Validate 0.25 increments
  - [ ] 5.3 Validate min 0.25, max 24
  - [ ] 5.4 Show Thai error messages

- [ ] **Task 6: Implement Duration Conversion** (AC: 7)
  - [ ] 6.1 Create hoursToMinutes utility
  - [ ] 6.2 Create minutesToHours utility
  - [ ] 6.3 Create formatDuration utility for display
  - [ ] 6.4 Use in form submission

- [ ] **Task 7: Integrate with TimeEntryForm** (AC: all)
  - [ ] 7.1 Add Service, Task, Duration to form
  - [ ] 7.2 Update form schema
  - [ ] 7.3 Test all interactions

## Dev Notes

### Updated Time Entry Schema

```typescript
// src/schemas/time-entry.schema.ts
import { z } from 'zod';

// Duration validation: 0.25 to 24 hours, in 0.25 increments
const durationHoursSchema = z
  .number()
  .min(0.25, 'กรุณาใส่เวลาอย่างน้อย 0.25 ชั่วโมง')
  .max(24, 'กรุณาใส่เวลาไม่เกิน 24 ชั่วโมง')
  .refine(
    (val) => val % 0.25 === 0,
    'กรุณาใส่เวลาเป็นช่วง 15 นาที (0.25 ชั่วโมง)'
  );

export const timeEntrySchema = z.object({
  // Cascading selectors (from Story 4.2)
  clientId: z.string().uuid('กรุณาเลือก Client'),
  projectId: z.string().uuid('กรุณาเลือก Project'),
  jobId: z.string().uuid('กรุณาเลือก Job'),

  // Service & Task (this story)
  serviceId: z.string().uuid('กรุณาเลือก Service'),
  taskId: z.string().uuid().nullable().optional(),

  // Duration (this story)
  durationHours: durationHoursSchema,

  // Date & Notes (Story 4.4)
  entryDate: z.string(),
  notes: z.string().max(500).optional(),
});

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;

// Form values use hours, API uses minutes
export interface TimeEntryFormValues extends Omit<TimeEntryInput, 'durationHours'> {
  durationHours: number; // For form input
}

export interface TimeEntryApiPayload extends Omit<TimeEntryInput, 'durationHours'> {
  duration_minutes: number; // For database
}
```

### Duration Utility Functions

```typescript
// src/lib/duration.ts

/**
 * Convert hours (decimal) to minutes
 * @param hours - e.g., 1.5
 * @returns minutes - e.g., 90
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

/**
 * Convert minutes to hours (decimal)
 * @param minutes - e.g., 90
 * @returns hours - e.g., 1.5
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

/**
 * Format duration for display
 * @param minutes - duration in minutes
 * @param format - 'short' | 'long'
 * @returns formatted string
 */
export function formatDuration(
  minutes: number,
  format: 'short' | 'long' = 'short'
): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (format === 'short') {
    // "1.5 ชม."
    return `${minutesToHours(minutes)} ชม.`;
  }

  // "1 ชม. 30 นาที"
  if (hours === 0) {
    return `${mins} นาที`;
  }
  if (mins === 0) {
    return `${hours} ชม.`;
  }
  return `${hours} ชม. ${mins} นาที`;
}

/**
 * Validate duration is in 0.25 hour increments
 */
export function isValidDurationIncrement(hours: number): boolean {
  return hours % 0.25 === 0;
}

/**
 * Duration presets in hours
 */
export const DURATION_PRESETS = [0.5, 1, 2, 4, 8] as const;
```

### Service Selector Component

```typescript
// src/components/entry/ServiceSelector.tsx
'use client';

import { useServices } from '@/hooks/use-entry-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceSelectorProps {
  value: string;
  onChange: (serviceId: string) => void;
  error?: string;
}

export function ServiceSelector({ value, onChange, error }: ServiceSelectorProps) {
  const { data: services, isLoading } = useServices();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Service</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="service">Service *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="service" className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder="Select a service" />
        </SelectTrigger>
        <SelectContent>
          {services?.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

### Task Selector Component

```typescript
// src/components/entry/TaskSelector.tsx
'use client';

import { useTasks } from '@/hooks/use-entry-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TaskSelectorProps {
  value: string | null;
  onChange: (taskId: string | null) => void;
  error?: string;
}

export function TaskSelector({ value, onChange, error }: TaskSelectorProps) {
  const { data: tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Task (Optional)</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="task">
        Task <span className="text-muted-foreground">(Optional)</span>
      </Label>
      <div className="flex gap-2">
        <Select
          value={value ?? ''}
          onValueChange={(val) => onChange(val || null)}
        >
          <SelectTrigger
            id="task"
            className={`flex-1 ${error ? 'border-destructive' : ''}`}
          >
            <SelectValue placeholder="Select a task (optional)" />
          </SelectTrigger>
          <SelectContent>
            {tasks?.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            aria-label="Clear task"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

### Duration Input Component

```typescript
// src/components/entry/DurationInput.tsx
'use client';

import { useState } from 'react';
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

export function DurationInput({ value, onChange, error }: DurationInputProps) {
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
    // Round to nearest 0.25 on blur
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
          id="duration"
          type="number"
          step="0.25"
          min="0.25"
          max="24"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Enter hours"
          className={cn(
            'pr-12',
            error && 'border-destructive'
          )}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          ชม.
        </span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        ใส่เป็นชั่วโมง (เช่น 1.5 = 1 ชม. 30 นาที)
      </p>
    </div>
  );
}
```

### Query Hooks Update

```typescript
// src/hooks/use-entry-data.ts (additions)

export function useServices() {
  return useQuery({
    queryKey: ['services', 'active'],
    queryFn: async () => {
      const result = await getActiveServices();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks', 'active'],
    queryFn: async () => {
      const result = await getActiveTasks();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}
```

### Server Actions Update

```typescript
// src/actions/entry.ts (additions)

export async function getActiveServices(): Promise<ActionResult<Service[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getActiveTasks(): Promise<ActionResult<Task[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}
```

### Updated TimeEntryForm

```typescript
// src/app/(app)/entry/components/TimeEntryForm.tsx (updated)
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientSelector } from '@/components/entry/ClientSelector';
import { ProjectSelector } from '@/components/entry/ProjectSelector';
import { JobSelector } from '@/components/entry/JobSelector';
import { ServiceSelector } from '@/components/entry/ServiceSelector';
import { TaskSelector } from '@/components/entry/TaskSelector';
import { DurationInput } from '@/components/entry/DurationInput';
import { timeEntrySchema, type TimeEntryInput } from '@/schemas/time-entry.schema';

export function TimeEntryForm() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const form = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      clientId: '',
      projectId: '',
      jobId: '',
      serviceId: '',
      taskId: null,
      durationHours: 0,
      entryDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  // ... cascading handlers from Story 4.2

  return (
    <form className="space-y-6">
      {/* Cascading Selectors (Story 4.2) */}
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

      {/* Service & Task (This Story) */}
      <div className="space-y-4">
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
      </div>

      {/* Duration (This Story) */}
      <DurationInput
        value={form.watch('durationHours')}
        onChange={(val) => form.setValue('durationHours', val)}
        error={form.formState.errors.durationHours?.message}
      />

      {/* Date & Submit - Added in Story 4.4 */}
    </form>
  );
}
```

### Project Structure

```
src/
├── components/
│   └── entry/
│       ├── ClientSelector.tsx      # From Story 4.2
│       ├── ProjectSelector.tsx     # From Story 4.2
│       ├── JobSelector.tsx         # From Story 4.2
│       ├── ServiceSelector.tsx     # NEW
│       ├── TaskSelector.tsx        # NEW
│       └── DurationInput.tsx       # NEW
├── lib/
│   └── duration.ts                 # NEW - Duration utilities
├── hooks/
│   └── use-entry-data.ts           # MODIFIED - Add useServices, useTasks
├── actions/
│   └── entry.ts                    # MODIFIED - Add getActiveServices, getActiveTasks
└── schemas/
    └── time-entry.schema.ts        # MODIFIED - Add duration validation
```

### Mobile UX Considerations

- Preset buttons are primary touch targets (easy 1-tap)
- Custom input uses native number keyboard
- 44x44px minimum for all touch targets
- Increment buttons optional (rely on presets mostly)

### Duration Display Examples

| Input (hours) | Stored (minutes) | Display (short) | Display (long) |
|---------------|------------------|-----------------|----------------|
| 0.5 | 30 | 0.5 ชม. | 30 นาที |
| 1 | 60 | 1 ชม. | 1 ชม. |
| 1.5 | 90 | 1.5 ชม. | 1 ชม. 30 นาที |
| 2.25 | 135 | 2.25 ชม. | 2 ชม. 15 นาที |
| 8 | 480 | 8 ชม. | 8 ชม. |

### Validation Rules Summary

| Field | Required | Validation |
|-------|----------|------------|
| Service | Yes | Must select from list |
| Task | No | Can be null/empty |
| Duration | Yes | 0.25-24 hours, 0.25 increments |

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Time Entry]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3]
- [Source: _bmad-output/project-context.md#Thai Language UX Copy]
- [Source: _bmad-output/implementation-artifacts/4-2-time-entry-form-cascading-selectors.md]
- [Source: _bmad-output/implementation-artifacts/1-3-database-schema-time-entry-supporting-tables.md]

## Definition of Done

- [ ] Service selector shows active services
- [ ] Task selector is optional and clearable
- [ ] Duration preset buttons work (0.5, 1, 2, 4, 8)
- [ ] Custom duration input accepts decimals
- [ ] Duration validates 0.25-24 hours
- [ ] Duration validates 0.25 increments
- [ ] Thai error messages display correctly
- [ ] Duration utilities convert hours ↔ minutes
- [ ] Form integrates all new fields
- [ ] All new query hooks created and working

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
