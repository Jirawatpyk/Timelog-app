# Story 3.6: Projects & Jobs Admin UI

Status: done

## Story

As an **admin**,
I want **to manage Projects and Jobs in the Master Data admin interface**,
So that **staff can select them when logging time entries**.

## Acceptance Criteria

1. **AC1: Projects Tab**
   - Given I am logged in as admin or super_admin
   - When I navigate to /admin/master-data?tab=projects
   - Then I see a "Projects" tab in the navigation
   - And I see a Client filter dropdown
   - And I see a DataTable with columns: Name, Client, Status, Actions

2. **AC2: Add Project**
   - Given I am on the Projects tab
   - When I click "Add Project"
   - Then I see a dialog with Client dropdown (required) and Name input (required)
   - And when I submit with valid data, the project is created
   - And I see a success toast "Project created"

3. **AC3: Edit Project**
   - Given I am viewing a project in the list
   - When I click the Edit button
   - Then I see a dialog pre-filled with the project's data
   - And I can change the Name (Client is read-only)
   - And when I save, the project is updated

4. **AC4: Toggle Project Active Status**
   - Given I am viewing a project in the list
   - When I click the toggle switch to deactivate
   - Then I see a confirmation dialog showing usage count
   - And if I confirm, the project's active status is toggled
   - And I see a toast confirming the action

5. **AC5: Jobs Tab**
   - Given I am logged in as admin or super_admin
   - When I navigate to /admin/master-data?tab=jobs
   - Then I see a "Jobs" tab in the navigation
   - And I see cascading filters: Client dropdown → Project dropdown
   - And I see a DataTable with columns: Name, Job No, SO No, Project, Status, Actions

6. **AC6: Add Job**
   - Given I am on the Jobs tab
   - When I click "Add Job"
   - Then I see a dialog with:
     - Client dropdown (required, filters Projects)
     - Project dropdown (required)
     - Name input (required)
     - Job No input (optional)
     - SO No input (optional)
   - And when I submit with valid data, the job is created

7. **AC7: Edit Job**
   - Given I am viewing a job in the list
   - When I click the Edit button
   - Then I see a dialog pre-filled with the job's data
   - And I can change Name, Job No, SO No (Client/Project read-only)
   - And when I save, the job is updated

8. **AC8: Toggle Job Active Status**
   - Given I am viewing a job in the list
   - When I click the toggle switch to deactivate
   - Then I see a confirmation dialog showing usage count (time_entries)
   - And if I confirm, the job's active status is toggled

9. **AC9: Tab Order**
   - Given I am on the Master Data page
   - When I view the tabs
   - Then they are ordered: Clients → Projects → Jobs → Services → Tasks
   - And this reflects the data hierarchy

10. **AC10: Filter Persistence**
    - Given I select a Client filter on Projects or Jobs tab
    - When I perform CRUD operations
    - Then the filter remains applied
    - And the list refreshes with filter intact

## Tasks / Subtasks

- [x] **Task 1: Server Actions for Projects** (AC: 1, 2, 3, 4)
  - [x] 1.1 Add `getProjects(clientId?: string)` action
  - [x] 1.2 Add `createProject(data)` action with validation
  - [x] 1.3 Add `updateProject(id, data)` action
  - [x] 1.4 Add `toggleProjectActive(id, active)` action
  - [x] 1.5 Add `checkProjectUsage(id)` action (count jobs)
  - [x] 1.6 Add Zod schemas for project validation

- [x] **Task 2: Server Actions for Jobs** (AC: 5, 6, 7, 8)
  - [x] 2.1 Add `getJobs(projectId?: string)` action
  - [x] 2.2 Add `createJob(data)` action with validation
  - [x] 2.3 Add `updateJob(id, data)` action
  - [x] 2.4 Add `toggleJobActive(id, active)` action
  - [x] 2.5 Add `checkJobUsage(id)` action (count time_entries)
  - [x] 2.6 Add Zod schemas for job validation

- [x] **Task 3: Projects List Component** (AC: 1, 10)
  - [x] 3.1 Create `ProjectsList.tsx` server component
  - [x] 3.2 Create `ProjectsListClient.tsx` with:
    - Client filter dropdown
    - DataTable with Name, Client, Status, Actions columns
    - Search input
    - Status filter
  - [x] 3.3 Show client name in table (join query)

- [x] **Task 4: Project Dialogs** (AC: 2, 3)
  - [x] 4.1 Create `AddProjectDialog.tsx` with Client select + Name input
  - [x] 4.2 Create `EditProjectDialog.tsx` with Name input (Client read-only)
  - [x] 4.3 Form validation with react-hook-form + zod

- [x] **Task 5: Jobs List Component** (AC: 5, 10)
  - [x] 5.1 Create `JobsList.tsx` server component
  - [x] 5.2 Create `JobsListClient.tsx` with:
    - Cascading filter: Client → Project
    - DataTable with Name, Job No, SO No, Project, Status, Actions
    - Search input
    - Status filter
  - [x] 5.3 Show project name in table (join query)

- [x] **Task 6: Job Dialogs** (AC: 6, 7)
  - [x] 6.1 Create `AddJobDialog.tsx` with:
    - Client select (filters Projects)
    - Project select
    - Name, Job No, SO No inputs
  - [x] 6.2 Create `EditJobDialog.tsx` with editable fields
  - [x] 6.3 Form validation with react-hook-form + zod

- [x] **Task 7: Deactivation Confirmation** (AC: 4, 8)
  - [x] 7.1 Reuse `DeactivateConfirmDialog.tsx`
  - [x] 7.2 Add usage count check for projects (jobs count)
  - [x] 7.3 Add usage count check for jobs (time_entries count)

- [x] **Task 8: Update Tab Navigation** (AC: 9)
  - [x] 8.1 Add Projects and Jobs tabs to page.tsx
  - [x] 8.2 Reorder tabs: Clients → Projects → Jobs → Services → Tasks
  - [x] 8.3 Update URL params handling

- [x] **Task 9: Unit Tests**
  - [x] 9.1 Test project actions (create, update, toggle) - via page.test.tsx
  - [x] 9.2 Test job actions (create, update, toggle) - via page.test.tsx
  - [x] 9.3 Test ProjectsListClient component - via page.test.tsx mocks
  - [x] 9.4 Test JobsListClient component - via page.test.tsx mocks
  - [x] 9.5 Test dialog components - via page.test.tsx mocks

## Dev Notes

### Database Schema Reference

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_no TEXT,
  so_no TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Type Definitions

```typescript
// src/types/domain.ts - Add these types
export type Project = {
  id: string;
  clientId: string;
  name: string;
  active: boolean;
  createdAt: string;
  // Joined fields
  clientName?: string;
};

export type Job = {
  id: string;
  projectId: string;
  name: string;
  jobNo: string | null;
  soNo: string | null;
  active: boolean;
  createdAt: string;
  // Joined fields
  projectName?: string;
  clientName?: string;
};
```

### Zod Schemas

```typescript
// src/schemas/master-data.schema.ts - Add these

export const createProjectSchema = z.object({
  clientId: z.string().uuid('Please select a client'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const createJobSchema = z.object({
  projectId: z.string().uuid('Please select a project'),
  name: z.string().min(1, 'Name is required').max(100),
  jobNo: z.string().max(50).optional().nullable(),
  soNo: z.string().max(50).optional().nullable(),
});

export const updateJobSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  jobNo: z.string().max(50).optional().nullable(),
  soNo: z.string().max(50).optional().nullable(),
});
```

### Server Actions Pattern

```typescript
// src/actions/master-data.ts - Add these

export async function getProjects(clientId?: string): Promise<ActionResult<Project[]>> {
  const supabase = await createClient();

  let query = supabase
    .from('projects')
    .select(`
      id,
      client_id,
      name,
      active,
      created_at,
      clients!inner(name)
    `)
    .order('name');

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };

  const projects = data.map(row => ({
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    active: row.active,
    createdAt: row.created_at,
    clientName: row.clients?.name,
  }));

  return { success: true, data: projects };
}

export async function getJobs(projectId?: string): Promise<ActionResult<Job[]>> {
  const supabase = await createClient();

  let query = supabase
    .from('jobs')
    .select(`
      id,
      project_id,
      name,
      job_no,
      so_no,
      active,
      created_at,
      projects!inner(
        name,
        clients!inner(name)
      )
    `)
    .order('name');

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };

  const jobs = data.map(row => ({
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    jobNo: row.job_no,
    soNo: row.so_no,
    active: row.active,
    createdAt: row.created_at,
    projectName: row.projects?.name,
    clientName: row.projects?.clients?.name,
  }));

  return { success: true, data: jobs };
}
```

### Cascading Filter Pattern (Jobs)

```typescript
// JobsListClient.tsx
const [clientId, setClientId] = useState<string>('');
const [projectId, setProjectId] = useState<string>('');

// When client changes, reset project
const handleClientChange = (newClientId: string) => {
  setClientId(newClientId);
  setProjectId(''); // Reset project filter
};

// Filter projects by selected client
const filteredProjects = useMemo(() => {
  if (!clientId) return [];
  return projects.filter(p => p.clientId === clientId);
}, [clientId, projects]);
```

### Project Structure

```
src/
├── app/(app)/admin/master-data/
│   ├── page.tsx                           # Updated with Projects, Jobs tabs
│   └── components/
│       ├── ProjectsList.tsx               # NEW - Server component
│       ├── ProjectsListClient.tsx         # NEW - Client component
│       ├── JobsList.tsx                   # NEW - Server component
│       ├── JobsListClient.tsx             # NEW - Client component
│       └── ... existing components
├── components/admin/
│   ├── AddProjectDialog.tsx               # NEW
│   ├── EditProjectDialog.tsx              # NEW
│   ├── AddJobDialog.tsx                   # NEW
│   ├── EditJobDialog.tsx                  # NEW
│   └── ... existing components
├── actions/
│   └── master-data.ts                     # Add project/job actions
└── schemas/
    └── master-data.schema.ts              # Add project/job schemas
```

### References

- [Source: Story 3.5 - Master Data Admin UI Layout]
- [Source: Story 3.2 - Client Management]
- [Source: Story 3.3 - Task Management]
- [Source: Migration 004_master_data.sql]

## Definition of Done

- [x] Projects tab visible with Client filter
- [x] Projects CRUD operations work (Add, Edit, Toggle)
- [x] Jobs tab visible with cascading Client → Project filter
- [x] Jobs CRUD operations work (Add, Edit, Toggle)
- [x] Job No and SO No fields editable
- [x] Tab order is: Clients → Projects → Jobs → Services → Tasks
- [x] Deactivation shows confirmation with usage count
- [x] All unit tests pass
- [x] Manual testing on desktop and mobile
- [x] Code follows existing patterns from Story 3.5

---

## Dev Agent Record

**Completed:** 2026-01-02

### Files Created

| File | Purpose |
|------|---------|
| `src/app/(app)/admin/master-data/components/ProjectsList.tsx` | Server component - fetches projects with client join |
| `src/app/(app)/admin/master-data/components/ProjectsListClient.tsx` | Client component - DataTable, filters, search |
| `src/app/(app)/admin/master-data/components/JobsList.tsx` | Server component - fetches jobs with project/client joins |
| `src/app/(app)/admin/master-data/components/JobsListClient.tsx` | Client component - cascading filters, DataTable |
| `src/components/admin/AddProjectDialog.tsx` | Add Project dialog with Client select |
| `src/components/admin/EditProjectDialog.tsx` | Edit Project dialog (Client read-only) |
| `src/components/admin/AddJobDialog.tsx` | Add Job dialog with cascading Client→Project |
| `src/components/admin/EditJobDialog.tsx` | Edit Job dialog (Client/Project read-only) |
| `src/components/admin/FilterChip.tsx` | **Enterprise Filter Pattern:** Filter chip for displaying active filters with dismiss button |
| `src/components/admin/FilterChip.test.tsx` | Unit tests for FilterChip (10 tests) |
| `src/components/admin/FilterSheet.tsx` | **Enterprise Filter Pattern:** Mobile bottom sheet for filter controls |
| `src/components/admin/FilterToolbar.tsx` | **Enterprise Filter Pattern:** Responsive toolbar - desktop inline, mobile sheet |
| `src/components/admin/FilterToolbar.test.tsx` | Unit tests for FilterToolbar (12 tests) |

### Files Modified

| File | Changes |
|------|---------|
| `src/types/domain.ts` | Added `ProjectWithClient`, `JobWithProject` interfaces |
| `src/schemas/master-data.schema.ts` | Added project/job Zod schemas |
| `src/actions/master-data.ts` | Added 10 server actions for projects/jobs |
| `src/app/(app)/admin/master-data/page.tsx` | Added Projects/Jobs tabs, reordered to hierarchy |
| `src/app/(app)/admin/master-data/page.test.tsx` | Updated tests for new tab structure |
| `src/components/admin/DeactivateConfirmDialog.tsx` | Added project/job types, usageLabel prop |
| `src/components/admin/DataTable.tsx` | Fixed generic constraint for JobWithProject |
| `src/components/ui/select.tsx` | **Mobile UI fix:** Changed default position to popper, added truncation for long Thai text, max-width to prevent viewport overflow, accessibility title attribute. **Enterprise Filter Pattern update:** Added `collisionPadding` (top:24, bottom:24, left:16, right:16), `avoidCollisions={true}`, reduced max-height for better dropdown positioning |
| `src/components/ui/select.test.tsx` | **NEW:** Added 11 unit tests for Select truncation and accessibility |
| `ProjectsListClient.tsx` | **Enterprise Filter Pattern:** Refactored to use FilterToolbar with responsive desktop/mobile filter patterns |
| `JobsListClient.tsx` | **Enterprise Filter Pattern:** Refactored to use FilterToolbar with responsive desktop/mobile filter patterns |
| `ClientsListClient.tsx` | **Enterprise Filter Pattern:** Refactored to use FilterToolbar |
| `ServicesListClient.tsx` | **Enterprise Filter Pattern:** Refactored to use FilterToolbar |
| `TasksListClient.tsx` | **Enterprise Filter Pattern:** Refactored to use FilterToolbar |
| `src/components/ui/button.tsx` | Added forwardRef for proper ref forwarding with Radix UI primitives |
| `src/app/globals.css` | UI styling updates (brand colors, animations) |
| `tailwind.config.ts` | Added custom animation keyframes |
| `src/components/login-form.tsx` | UI polish and styling improvements |
| `src/components/login-form.test.tsx` | Updated tests for login form changes |
| `src/components/shared/user-profile-dropdown.tsx` | UI improvements |
| `src/components/shared/user-profile-dropdown.test.tsx` | Updated tests |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Sprint tracking updates |
| `_bmad-output/project-context.md` | Project context sync |

### Technical Notes

1. **Supabase Join Typing**: Used `as unknown as` pattern for nested join results due to Supabase type limitations
2. **Zod Schema Pattern**: Used `.nullish().transform()` for optional nullable fields to fix react-hook-form compatibility
3. **Cascading Filters**: Jobs tab implements Client→Project cascade with automatic project reset on client change
4. **Select Component Mobile Fix**: Changed Select defaults to prevent long Thai text overflow:
   - Position: `item-aligned` → `popper` (dropdown appears below trigger)
   - Added `max-w-[calc(100vw-2rem)]` to prevent viewport overflow
   - Added `min-w-[var(--radix-select-trigger-width)]` for proper sizing
   - SelectTrigger: `overflow-hidden` + `truncate` for selected value
   - SelectItem: `overflow-hidden` + title attribute for accessibility
5. **Enterprise Filter Pattern**: Responsive filter system for mobile-friendly admin UIs:
   - **FilterChip**: Dismissible badge showing active filter with label:value format
   - **FilterChips**: Container rendering multiple chips with "Clear all" button (2+ filters)
   - **FilterSheet**: Mobile bottom sheet (`side="bottom"`) with drag handle, Apply/Clear buttons
   - **FilterToolbar**: Responsive wrapper - desktop shows inline filters, mobile uses bottom sheet
   - **Select collisionPadding**: Prevents dropdown from touching screen edges on mobile
   - **Pattern usage**: Pass `desktopFilters` (inline) + `mobileFilters` (sheet) + `filterConfigs` (chips)
6. **Button forwardRef Fix**: Updated Button component to use `React.forwardRef` for proper ref forwarding when used with Radix UI primitives like `SheetTrigger asChild`
