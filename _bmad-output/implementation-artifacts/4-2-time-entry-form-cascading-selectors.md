# Story 4.2: Time Entry Form - Cascading Selectors

Status: ready-for-dev

## Story

As a **staff member**,
I want **to select Client → Project → Job in a cascading manner**,
So that **I can accurately categorize my time entry**.

## Acceptance Criteria

1. **AC1: Initial Form State**
   - Given I am on the /entry page
   - When the page loads
   - Then I see the Client dropdown enabled with active clients
   - And Project and Job dropdowns are disabled (grayed out)
   - And a placeholder text shows "Select client first"

2. **AC2: Client Selection Enables Project**
   - Given I have not selected a client
   - When I select a Client from the dropdown
   - Then the Project dropdown becomes enabled
   - And it shows only active projects for that client
   - And the Job dropdown remains disabled

3. **AC3: Project Selection Enables Job**
   - Given I have selected a Client
   - When I select a Project from the dropdown
   - Then the Job dropdown becomes enabled
   - And it shows only active jobs for that project
   - And Jobs display as: "{job_no} - {name}" or just "{name}" if no job_no

4. **AC4: Client Change Clears Dependents**
   - Given I have selected Client, Project, and Job
   - When I select a different Client
   - Then Project and Job selections are cleared
   - And Project dropdown shows the new client's projects
   - And Job dropdown becomes disabled again

5. **AC5: Project Change Clears Job**
   - Given I have selected Client, Project, and Job
   - When I select a different Project
   - Then Job selection is cleared
   - And Job dropdown shows the new project's jobs

6. **AC6: Empty State Handling**
   - Given a Client has no projects
   - When I select that Client
   - Then Project dropdown shows "No projects available"
   - Given a Project has no jobs
   - When I select that Project
   - Then Job dropdown shows "No jobs available"

7. **AC7: Loading States**
   - Given I select a Client
   - When projects are being fetched
   - Then the Project dropdown shows a loading indicator
   - And the same applies to Job dropdown when fetching jobs

## Tasks / Subtasks

- [ ] **Task 1: Create Entry Page Layout** (AC: 1)
  - [ ] 1.1 Create `app/(app)/entry/page.tsx`
  - [ ] 1.2 Set up basic form structure
  - [ ] 1.3 Add page title and container styling

- [ ] **Task 2: Create TimeEntryForm Component** (AC: 1, 7)
  - [ ] 2.1 Create `app/(app)/entry/components/TimeEntryForm.tsx`
  - [ ] 2.2 Set up React Hook Form with Zod validation
  - [ ] 2.3 Add form state management for cascading

- [ ] **Task 3: Implement Client Selector** (AC: 1, 2)
  - [ ] 3.1 Create `components/entry/ClientSelector.tsx`
  - [ ] 3.2 Fetch active clients on mount
  - [ ] 3.3 Implement selection handling
  - [ ] 3.4 Add loading state

- [ ] **Task 4: Implement Project Selector** (AC: 2, 3, 5, 6, 7)
  - [ ] 4.1 Create `components/entry/ProjectSelector.tsx`
  - [ ] 4.2 Fetch projects when client changes
  - [ ] 4.3 Handle empty state
  - [ ] 4.4 Disable when no client selected

- [ ] **Task 5: Implement Job Selector** (AC: 3, 4, 5, 6, 7)
  - [ ] 5.1 Create `components/entry/JobSelector.tsx`
  - [ ] 5.2 Fetch jobs when project changes
  - [ ] 5.3 Format display as "{job_no} - {name}"
  - [ ] 5.4 Handle empty state

- [ ] **Task 6: Implement Cascading Logic** (AC: 4, 5)
  - [ ] 6.1 Clear project when client changes
  - [ ] 6.2 Clear job when project changes
  - [ ] 6.3 Update form values correctly

- [ ] **Task 7: Create Server Actions for Data Fetching** (AC: 2, 3)
  - [ ] 7.1 Create `actions/entry.ts` with getActiveClients
  - [ ] 7.2 Add getProjectsByClient action
  - [ ] 7.3 Add getJobsByProject action

- [ ] **Task 8: Add TanStack Query Integration** (AC: 7)
  - [ ] 8.1 Set up QueryClient provider for entry page
  - [ ] 8.2 Create query hooks for clients, projects, jobs
  - [ ] 8.3 Implement caching strategy

## Dev Notes

### Form State Architecture

This story uses **TanStack Query** per project-context.md - Entry page is the ONLY page that uses it.

```typescript
// Form state structure
interface TimeEntryFormState {
  clientId: string | null;
  projectId: string | null;
  jobId: string | null;
  // ... other fields added in Story 4.3 and 4.4
}
```

### Time Entry Schema (Partial - Cascading Fields Only)

```typescript
// src/schemas/time-entry.schema.ts
import { z } from 'zod';

export const cascadingSelectorsSchema = z.object({
  clientId: z.string().uuid('Please select a client'),
  projectId: z.string().uuid('Please select a project'),
  jobId: z.string().uuid('Please select a job'),
});

// Full schema will be completed in Story 4.3 and 4.4
export const timeEntrySchema = cascadingSelectorsSchema.extend({
  serviceId: z.string().uuid('Please select a service'),
  taskId: z.string().uuid().nullable().optional(),
  durationMinutes: z.number().int().min(1).max(1440),
  entryDate: z.string(),
  notes: z.string().max(500).optional(),
});

export type CascadingSelectorsInput = z.infer<typeof cascadingSelectorsSchema>;
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
```

### Server Actions for Data Fetching

```typescript
// src/actions/entry.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import type { Client, Project, Job } from '@/types/domain';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getActiveClients(): Promise<ActionResult<Client[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getProjectsByClient(
  clientId: string
): Promise<ActionResult<Project[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .eq('active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getJobsByProject(
  projectId: string
): Promise<ActionResult<Job[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .eq('active', true)
    .order('job_no', { nullsFirst: false })
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}
```

### TanStack Query Setup

```typescript
// src/app/(app)/entry/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function EntryQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Query Hooks

```typescript
// src/hooks/use-entry-data.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getActiveClients,
  getProjectsByClient,
  getJobsByProject,
} from '@/actions/entry';

export function useClients() {
  return useQuery({
    queryKey: ['clients', 'active'],
    queryFn: async () => {
      const result = await getActiveClients();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useProjects(clientId: string | null) {
  return useQuery({
    queryKey: ['projects', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await getProjectsByClient(clientId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!clientId,
  });
}

export function useJobs(projectId: string | null) {
  return useQuery({
    queryKey: ['jobs', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const result = await getJobsByProject(projectId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!projectId,
  });
}
```

### Entry Page Structure

```typescript
// src/app/(app)/entry/page.tsx
import { EntryQueryProvider } from './providers';
import { TimeEntryForm } from './components/TimeEntryForm';

export default function EntryPage() {
  return (
    <EntryQueryProvider>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Log Time</h1>
        <TimeEntryForm />
      </div>
    </EntryQueryProvider>
  );
}
```

### TimeEntryForm Component

```typescript
// src/app/(app)/entry/components/TimeEntryForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientSelector } from '@/components/entry/ClientSelector';
import { ProjectSelector } from '@/components/entry/ProjectSelector';
import { JobSelector } from '@/components/entry/JobSelector';
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
      durationMinutes: 0,
      entryDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    setProjectId(null);
    form.setValue('clientId', newClientId);
    form.setValue('projectId', '');
    form.setValue('jobId', '');
  };

  const handleProjectChange = (newProjectId: string) => {
    setProjectId(newProjectId);
    form.setValue('projectId', newProjectId);
    form.setValue('jobId', '');
  };

  const handleJobChange = (jobId: string) => {
    form.setValue('jobId', jobId);
  };

  return (
    <form className="space-y-6">
      {/* Cascading Selectors */}
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

      {/* Service, Task, Duration, Date - Added in Stories 4.3 and 4.4 */}
      {/* Submit button - Added in Story 4.4 */}
    </form>
  );
}
```

### Client Selector Component

```typescript
// src/components/entry/ClientSelector.tsx
'use client';

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

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
  error?: string;
}

export function ClientSelector({ value, onChange, error }: ClientSelectorProps) {
  const { data: clients, isLoading, isError } = useClients();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Client</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="client">Client *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="client" className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients?.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
          {(!clients || clients.length === 0) && (
            <SelectItem value="" disabled>
              No clients available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

### Project Selector Component

```typescript
// src/components/entry/ProjectSelector.tsx
'use client';

import { useProjects } from '@/hooks/use-entry-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectSelectorProps {
  clientId: string | null;
  value: string;
  onChange: (projectId: string) => void;
  disabled?: boolean;
  error?: string;
}

export function ProjectSelector({
  clientId,
  value,
  onChange,
  disabled,
  error,
}: ProjectSelectorProps) {
  const { data: projects, isLoading, isFetching } = useProjects(clientId);

  const showLoading = isLoading || isFetching;

  if (showLoading && clientId) {
    return (
      <div className="space-y-2">
        <Label>Project</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="project">Project *</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id="project"
          className={error ? 'border-destructive' : ''}
        >
          <SelectValue
            placeholder={disabled ? 'Select client first' : 'Select a project'}
          />
        </SelectTrigger>
        <SelectContent>
          {projects?.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
          {projects?.length === 0 && (
            <SelectItem value="" disabled>
              No projects available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

### Job Selector Component

```typescript
// src/components/entry/JobSelector.tsx
'use client';

import { useJobs } from '@/hooks/use-entry-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { Job } from '@/types/domain';

interface JobSelectorProps {
  projectId: string | null;
  value: string;
  onChange: (jobId: string) => void;
  disabled?: boolean;
  error?: string;
}

function formatJobDisplay(job: Job): string {
  if (job.job_no) {
    return `${job.job_no} - ${job.name}`;
  }
  return job.name;
}

export function JobSelector({
  projectId,
  value,
  onChange,
  disabled,
  error,
}: JobSelectorProps) {
  const { data: jobs, isLoading, isFetching } = useJobs(projectId);

  const showLoading = isLoading || isFetching;

  if (showLoading && projectId) {
    return (
      <div className="space-y-2">
        <Label>Job</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="job">Job *</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id="job"
          className={error ? 'border-destructive' : ''}
        >
          <SelectValue
            placeholder={disabled ? 'Select project first' : 'Select a job'}
          />
        </SelectTrigger>
        <SelectContent>
          {jobs?.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              {formatJobDisplay(job)}
            </SelectItem>
          ))}
          {jobs?.length === 0 && (
            <SelectItem value="" disabled>
              No jobs available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

### Entry Layout with Query Provider

```typescript
// src/app/(app)/entry/layout.tsx
import { EntryQueryProvider } from './providers';

export default function EntryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EntryQueryProvider>{children}</EntryQueryProvider>;
}
```

### Project Structure

```
src/
├── app/
│   └── (app)/
│       └── entry/
│           ├── layout.tsx              # NEW - QueryProvider
│           ├── page.tsx                # NEW - Entry page
│           ├── providers.tsx           # NEW - TanStack Query provider
│           └── components/
│               └── TimeEntryForm.tsx   # NEW - Main form component
├── components/
│   └── entry/
│       ├── ClientSelector.tsx          # NEW
│       ├── ProjectSelector.tsx         # NEW
│       └── JobSelector.tsx             # NEW
├── hooks/
│   └── use-entry-data.ts               # NEW - Query hooks
├── actions/
│   └── entry.ts                        # NEW - Data fetching actions
└── schemas/
    └── time-entry.schema.ts            # NEW (partial)
```

### Dependencies

Ensure TanStack Query is installed:
```bash
npm install @tanstack/react-query
```

### Query Caching Strategy

- **Clients**: Cached for 1 minute, rarely changes
- **Projects**: Cached per client, refetched when client changes
- **Jobs**: Cached per project, refetched when project changes
- **Invalidation**: After creating new entries (Story 4.4)

### Accessibility

- All selects have proper labels
- Error messages are associated with inputs
- Disabled states are clearly communicated
- Keyboard navigation works

### Mobile Considerations

- Selects use native mobile select UI (via shadcn Select)
- Touch-friendly sizing
- Clear disabled state indicators

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#State Management]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2]
- [Source: _bmad-output/project-context.md#TanStack Query Usage]
- [Source: _bmad-output/implementation-artifacts/1-2-database-schema-core-tables.md]
- [Source: _bmad-output/implementation-artifacts/3-4-soft-delete-protection.md]

## Definition of Done

- [ ] Entry page created at /entry
- [ ] Client dropdown shows active clients
- [ ] Project dropdown enabled after client selection
- [ ] Job dropdown enabled after project selection
- [ ] Changing client clears project and job
- [ ] Changing project clears job
- [ ] Empty states display correctly
- [ ] Loading states show during data fetch
- [ ] TanStack Query properly configured
- [ ] All selectors have proper validation errors
- [ ] Form integrates with React Hook Form

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
