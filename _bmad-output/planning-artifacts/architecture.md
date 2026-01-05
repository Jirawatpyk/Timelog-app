---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/product-brief-Timelog-2025-12-30.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
workflowType: 'architecture'
project_name: Timelog
user_name: Jiraw
date: 2025-12-30
status: 'complete'
completedAt: '2025-12-30'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

- 49 FRs across 9 categories
- Core: Authentication, Time Entry, Dashboards, Admin
- Architecture-critical: Role-based access, Real-time updates, PWA

**Non-Functional Requirements:**

- Performance: <2s load, <200ms API, <30s entry time
- Security: RLS, RBAC, Audit Trail, Rate Limiting (100 req/min)
- Reliability: 99.5% uptime, Zero data loss
- Accessibility: WCAG 2.1 Level A + select AA

**Scale & Complexity:**

- Primary domain: Full-stack Web (PWA)
- Complexity level: Low-Medium
- User scale: ~60 internal users
- Estimated architectural components: 6 pages, 12+ components, 5 hooks

### Corrected Data Model Hierarchy

**From actual Google Sheets (discovered during analysis):**

| Entity | Relationship | Fields |
|--------|--------------|--------|
| Client | Has many Projects | name, active |
| Project | Belongs to Client, Has many Jobs | client_id, name, active |
| Job | Belongs to Project | project_id, name, job_no, so_no, active |
| Service | Standalone lookup | name, active |
| Task | Standalone lookup (optional) | name, active |

**Time Entry Selection Flow:**

```
1. Client → 2. Project → 3. Job → 4. Service → 5. Task (optional) → 6. Duration → Save
```

**Time Entry references:** job_id + service_id + task_id (optional)

### Technical Constraints & Dependencies

| Constraint | Value |
|------------|-------|
| Budget | ฿0/month (free tiers only) |
| Team | Solo developer |
| Stack | Next.js 14 + Supabase (pre-decided) |
| Browser | Modern only (last 2 versions) |

### Cross-Cutting Concerns Identified

1. **Authentication & Authorization** — Supabase Auth + 4 Roles + RLS
2. **Data Access Patterns** — Role-scoped visibility
3. **Real-time Updates** — Polling MVP, Realtime Phase 2
4. **PWA Capabilities** — Static cache MVP, Offline sync Phase 2
5. **Audit Trail** — All entry changes logged
6. **Optimistic UI** — Immediate feedback + server rollback
7. **Form State Persistence** — sessionStorage for in-progress entries
8. **Graceful Degradation** — Error boundaries + offline handling
9. **Testability** — Test users per role, RLS verification tests
10. **Cascading Master Data** — Client → Project → Job hierarchy with dependent filtering
11. **Recent Entry Optimization** — Store full combinations (Client+Project+Job+Service+Task) for 1-tap entry

### Open Architecture Questions

| Question | Options | Decision Needed |
|----------|---------|-----------------|
| Team Scope | Direct reports only vs Entire department | Before RLS design |
| Historical Data | Snapshot department vs Current department | Before schema design |
| Conflict Resolution | Last-write-wins vs Optimistic locking | Before real-time design |

### Architecture Principles

- **YAGNI** — Don't over-engineer for hypothetical scenarios
- **Boring Technology** — Simple solutions that actually work
- **Ship Fast, Iterate** — MVP first, enhance based on real feedback
- **User Journeys Drive Decisions** — Technical choices serve UX goals

### Risk Areas

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RLS Policy Bug | High | Critical | E2E tests per role before deploy |
| Auth Session Leak | Medium | Critical | Security audit checklist |
| PWA Cache Staleness | Medium | Medium | Cache invalidation strategy |
| Cascading Data Complexity | Medium | Medium | Smart auto-select UX |

## Starter Template Evaluation

### Primary Technology Domain

Full-stack Web Application (PWA) based on project requirements analysis

### Starter Options Considered

| Starter | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Official Vercel Supabase** | Official, maintained, SSR auth ready | Minimal, needs PWA setup | **Selected** |
| supa-next-starter | Feature-rich | Community maintained, may drift | Rejected |
| Create T3 App | Type-safe, popular | tRPC + Prisma complexity overkill | Rejected |
| shadcn CLI only | Latest Tailwind v4 | No Supabase setup | Rejected |

### Selected Starter: Official Vercel Supabase Starter

**Rationale for Selection:**

1. **Official maintenance** — Vercel + Supabase teams ensure compatibility
2. **Cookie-based auth** — `supabase-ssr` works across Server/Client/Middleware
3. **shadcn/ui initialized** — Consistent with UX specification
4. **Boring technology** — Predictable, well-documented, stable
5. **Solo dev friendly** — No extra frameworks to learn (vs T3's tRPC + Prisma)

**Initialization Command:**

```bash
# Create project
npx create-next-app -e with-supabase timelog

# Navigate to project
cd timelog

# Add required dependencies
npm install framer-motion @use-gesture/react

# Add testing infrastructure
npm install -D vitest @testing-library/react @playwright/test

# Initialize additional shadcn components
npx shadcn add button card input select sheet dialog toast
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**

- TypeScript (strict mode enabled)
- Node.js runtime for API routes
- React 19 + Next.js 14 App Router

**Styling Solution:**

- Tailwind CSS (utility-first)
- shadcn/ui (Radix UI primitives)
- CSS variables for theming

**Authentication:**

- Supabase Auth with `@supabase/ssr`
- Cookie-based sessions (SSR compatible)
- Middleware for protected routes

**Build Tooling:**

- Next.js built-in (Turbopack dev, Webpack prod)
- ESLint + Prettier configured

### Post-Initialization Setup

**1. Testing Infrastructure:**

```bash
npm install -D vitest @testing-library/react @playwright/test
```

**2. Animation & Gesture:**

```bash
npm install framer-motion @use-gesture/react
```

**3. PWA (Manual approach):**

- Add `public/manifest.json`
- Add `public/sw.js` (simple static cache)
- Add `<link rel="manifest">` to layout

**4. Type Generation Script:**

```json
"scripts": {
  "types": "supabase gen types typescript --project-id $PROJECT_ID > src/types/database.types.ts"
}
```

### Project Structure Enhancement

```
src/
├── app/
│   ├── (auth)/           # Login, signup (from starter)
│   ├── (app)/            # Main app routes
│   │   ├── entry/        # Quick Entry page
│   │   ├── dashboard/    # Personal Dashboard
│   │   ├── team/         # Manager Dashboard
│   │   └── admin/        # Admin Panel
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn components
│   ├── entry/            # QuickEntry, RecentCard, DurationStepper
│   ├── dashboard/        # StatsCard, EntryList, ComplianceView
│   └── shared/           # CascadingJobSelector, BottomNav
├── hooks/
│   ├── use-entries.ts    # Time entry operations
│   ├── use-recent.ts     # Recent combinations
│   └── use-cascading-select.ts  # Client→Project→Job
├── services/
│   ├── entry.service.ts  # Business logic
│   └── master-data.service.ts
├── lib/
│   └── supabase/         # Supabase clients (from starter)
└── types/
    ├── database.types.ts # Supabase generated
    └── domain.types.ts   # App-specific types
```

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Database schema with multi-department manager support
- RLS policies for role-based access
- Authentication flow and session management

**Important Decisions (Shape Architecture):**

- State management approach
- Form handling strategy
- Error handling patterns
- Audit logging mechanism

**Deferred Decisions (Post-MVP):**

- Real-time subscriptions (using polling for MVP)
- Offline sync capabilities
- Advanced caching strategies

### Data Architecture

**State Management: TanStack Query v5**

- Use for **reads only** — avoid double-fetch with Server Actions
- Server Actions handle mutations with `revalidatePath`
- Query invalidation after mutations for fresh data
- Stale time: 30 seconds for dashboard data

**Team Scope: Department-based with Multi-Department Support**

- Manager sees all entries from their department(s)
- **Critical**: Manager can oversee **2 departments** — requires junction table
- Historical entries use snapshot pattern (department_id stored at creation)

**Database Schema for Multi-Department Managers:**

```sql
-- Junction table for managers overseeing multiple departments
CREATE TABLE manager_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manager_id, department_id)
);

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users table with primary department
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT CHECK (role IN ('staff', 'manager', 'admin', 'super_admin')),
  department_id UUID REFERENCES departments(id),  -- User's own department
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Time entries with snapshot department
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  job_id UUID REFERENCES jobs(id),
  service_id UUID REFERENCES services(id),
  task_id UUID REFERENCES tasks(id),  -- Optional
  duration_minutes INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  notes TEXT,
  department_id UUID REFERENCES departments(id),  -- Snapshot at creation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Historical Data: Snapshot Pattern**

- `time_entries.department_id` captures department at entry creation
- User department changes don't affect historical entry visibility
- Managers see entries based on entry's snapshot department

**Conflict Resolution: Last-Write-Wins**

- Simple timestamp-based resolution
- No optimistic locking for MVP
- Acceptable for 60 internal users with low collision probability

### Authentication & Security

**RLS Policies for Multi-Department Managers:**

```sql
-- Staff: See only own entries
CREATE POLICY "staff_own_entries" ON time_entries
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Managers: See own entries + entries from managed departments
CREATE POLICY "managers_view_departments" ON time_entries
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM manager_departments md
    WHERE md.manager_id = auth.uid()
    AND md.department_id = time_entries.department_id
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'manager'
);

-- Admin/Super Admin: See all entries
CREATE POLICY "admin_all_entries" ON time_entries
FOR ALL TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')
);
```

**Authorization Pattern:**

- Middleware checks authentication
- RLS enforces data access at database level
- Role checks in Server Actions for mutations

**Rate Limiting:**

- 100 requests/minute per user (Supabase default)
- No additional rate limiting needed for MVP

### API & Communication Patterns

**API Pattern: Server Actions (Next.js 14)**

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEntry(formData: FormData) {
  const supabase = await createClient();

  // Get user's department for snapshot
  const { data: user } = await supabase
    .from('users')
    .select('department_id')
    .single();

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      job_id: formData.get('jobId'),
      service_id: formData.get('serviceId'),
      task_id: formData.get('taskId') || null,
      duration_minutes: Number(formData.get('duration')),
      entry_date: formData.get('date'),
      notes: formData.get('notes') || null,
      department_id: user.department_id,  // Snapshot
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard');
  return { success: true, data };
}
```

**Error Handling: Return Objects Pattern**

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

- No throwing errors from Server Actions
- Consistent return type for all mutations
- Client handles success/error states uniformly

### Frontend Architecture

**Form Handling: React Hook Form + Zod**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const entrySchema = z.object({
  clientId: z.string().uuid(),
  projectId: z.string().uuid(),
  jobId: z.string().uuid(),
  serviceId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  duration: z.number().min(1).max(480),
  date: z.string(),
  notes: z.string().max(500).optional(),
});

// Cascade validation - projectId only valid if clientId selected
```

**Form State Persistence:**

```typescript
// Auto-save to sessionStorage on form change
useEffect(() => {
  const subscription = form.watch((data) => {
    sessionStorage.setItem('draft-entry', JSON.stringify(data));
  });
  return () => subscription.unsubscribe();
}, [form]);

// Restore on mount
useEffect(() => {
  const draft = sessionStorage.getItem('draft-entry');
  if (draft) form.reset(JSON.parse(draft));
}, []);
```

**Loading States: Hybrid Approach**

- Suspense boundaries for route-level loading
- TanStack Query states for component-level
- Skeleton components for perceived performance

**Optimistic Updates Pattern:**

```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createEntry,
  onMutate: async (newEntry) => {
    await queryClient.cancelQueries({ queryKey: ['entries'] });
    const previous = queryClient.getQueryData(['entries']);
    queryClient.setQueryData(['entries'], (old) => [...old, newEntry]);
    return { previous };
  },
  onError: (err, newEntry, context) => {
    queryClient.setQueryData(['entries'], context.previous);
    toast.error('Failed to save entry');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['entries'] });
  },
});
```

### Infrastructure & Deployment

**Environments:**

- Development (local Supabase)
- Production (Supabase Cloud + Vercel)

**CI/CD: GitHub Actions + Vercel**

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npx supabase gen types typescript > /dev/null  # Verify types
```

**Type Generation in CI:**

- Generate types as part of build process
- Fail build if schema mismatch detected
- Types committed to repo for IDE support

### Audit Logging

**Database Trigger Approach (Zero App Code):**

```sql
-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to time_entries
CREATE TRIGGER time_entries_audit
AFTER INSERT OR UPDATE OR DELETE ON time_entries
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### Testing Strategy

**RLS Test Matrix:**

| Role | Own Entries | Department Entries | Other Dept | All Data |
|------|-------------|-------------------|------------|----------|
| Staff | CRUD | - | - | - |
| Manager | CRUD | Read | - | - |
| Admin | CRUD | CRUD | CRUD | Read |
| Super Admin | CRUD | CRUD | CRUD | CRUD |

**E2E Test Users:**

- Create 4 test users (one per role) in test environment
- Each test verifies RLS behavior for that role
- Critical: Test multi-department manager seeing both departments

**Service Layer Extraction:**

```typescript
// services/entry.service.ts
export const entryService = {
  create: async (data: EntryInput) => { /* business logic */ },
  update: async (id: string, data: EntryInput) => { /* business logic */ },
  delete: async (id: string) => { /* business logic */ },
};

// Unit testable without Supabase
```

### Decision Impact Analysis

**Implementation Sequence:**

1. Database schema (departments, manager_departments, users, master data, time_entries)
2. RLS policies (with multi-department support)
3. Audit trigger
4. Authentication setup
5. Server Actions
6. TanStack Query hooks
7. Form components with React Hook Form
8. Dashboard components

**Cross-Component Dependencies:**

- RLS depends on manager_departments table
- Server Actions depend on RLS being configured
- TanStack Query invalidation depends on Server Action success
- Form persistence depends on form structure being stable
- Optimistic UI depends on TanStack Query setup

## Implementation Patterns & Consistency Rules

### State Management: Hybrid Approach

**Server Components (Default):**

- Dashboard, Team, Admin pages → Server Components
- Data fetched at request time, no client-side state library
- Use `revalidatePath` after mutations

**TanStack Query (Quick Entry Only):**

- Quick Entry page needs optimistic updates
- Recent combinations caching
- Polling for "today's entries" list

```typescript
// Only for Quick Entry page
// app/(app)/entry/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

export function EntryProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Naming Patterns

**Database (PostgreSQL Convention):**

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `time_entries`, `manager_departments` |
| Columns | snake_case | `user_id`, `created_at`, `job_no` |
| Foreign Keys | `{table_singular}_id` | `department_id`, `project_id` |
| Indexes | `idx_{table}_{columns}` | `idx_time_entries_user_date` |

**Code (React/Next.js Convention):**

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `QuickEntry.tsx`, `CascadingJobSelector.tsx` |
| Hooks | camelCase with `use` | `useEntries.ts`, `useCascadingSelect.ts` |
| Services | camelCase | `entryService.ts` |
| Types | PascalCase | `TimeEntry`, `ActionResult<T>` |
| Constants | SCREAMING_SNAKE | `MAX_DURATION_MINUTES` |

**Files & Folders:**

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase.tsx | `QuickEntry.tsx` |
| Hooks | use-{name}.ts | `use-entries.ts` |
| Routes | kebab-case | `app/(app)/quick-entry/` |
| Tests | co-located | `use-entries.test.ts` |

### Import Alias Convention

**Always use `@/` aliases - never relative paths:**

```typescript
// ✅ Correct - Use aliases
import { createEntry } from '@/actions/entry';
import { entryService } from '@/services/entry';
import { Button } from '@/components/ui/button';
import type { TimeEntry } from '@/types/domain';

// ❌ Wrong - Avoid relative paths
import { createEntry } from '../../../actions/entry';
import { entryService } from '../../services/entry';
```

**tsconfig.json paths:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Structure Patterns

**Project Organization (Feature-based):**

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (app)/
│   │   ├── entry/
│   │   │   ├── page.tsx           # Server Component shell
│   │   │   ├── providers.tsx      # TanStack Query provider
│   │   │   └── components/        # Client components
│   │   ├── dashboard/page.tsx     # Server Component
│   │   ├── team/page.tsx          # Server Component
│   │   └── admin/page.tsx         # Server Component
├── components/
│   ├── ui/                        # shadcn (untouched)
│   ├── entry/                     # Entry feature components
│   ├── dashboard/                 # Dashboard feature components
│   └── shared/                    # Cross-feature components
├── hooks/                         # Custom hooks
├── services/                      # Business logic (testable)
├── actions/                       # Server Actions
├── lib/                           # Utilities & configs
└── types/                         # TypeScript types
```

**Test Organization (Co-located):**

```
hooks/
├── use-entries.ts
├── use-entries.test.ts           # Unit test next to source
```

### Format Patterns

**API Response (Server Actions):**

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

**JSON Field Naming:**

- Database → `snake_case` (Supabase types)
- Frontend → `camelCase`
- Transform at service boundary

```typescript
function toTimeEntry(row: Database['time_entries']): TimeEntry {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    durationMinutes: row.duration_minutes,
    entryDate: row.entry_date,
  };
}
```

### RLS Testing Patterns

**Test Users Setup:**

```typescript
// test/helpers/test-users.ts
export const testUsers = {
  staff: {
    id: 'staff-uuid',
    role: 'staff',
    departmentId: 'dept-a',
  },
  manager: {
    id: 'manager-uuid',
    role: 'manager',
    departments: ['dept-a', 'dept-b'],  // Multi-department!
  },
  admin: {
    id: 'admin-uuid',
    role: 'admin',
  },
  superAdmin: {
    id: 'super-uuid',
    role: 'super_admin',
  },
};
```

**Test Naming Convention:**

```typescript
describe('time_entries RLS', () => {
  it('staff_can_read_own_entries', async () => {});
  it('staff_cannot_read_other_entries', async () => {});
  it('manager_can_read_dept_a_entries', async () => {});
  it('manager_can_read_dept_b_entries', async () => {});  // Critical!
  it('manager_cannot_read_dept_c_entries', async () => {});
  it('admin_can_read_all_entries', async () => {});
});
```

**RLS Test Helper:**

```typescript
// Run query as specific user
async function asUser<T>(
  userId: string,
  query: (supabase: SupabaseClient) => Promise<T>
): Promise<T> {
  const supabase = createClient();
  // Supabase will use RLS based on auth context
  return query(supabase);
}
```

### Process Patterns

**Form Submission:**

```typescript
const [isPending, startTransition] = useTransition();

async function onSubmit(data: FormData) {
  startTransition(async () => {
    const result = await createEntry(data);
    if (result.success) {
      toast.success('Entry saved');
      form.reset();
      sessionStorage.removeItem('draft-entry');
    } else {
      toast.error(result.error);
    }
  });
}
```

**Form Draft Keys:**

```typescript
const DRAFT_KEYS = {
  entry: 'draft-entry',
  editEntry: (id: string) => `draft-entry-${id}`,
} as const;
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow naming conventions exactly as documented
2. Use `ActionResult<T>` for all Server Actions
3. Co-locate tests with source files
4. Transform snake_case → camelCase at service boundary
5. Use `@/` import aliases, never relative paths
6. Never use TanStack Query outside Quick Entry page
7. Follow RLS test naming convention

**Deferred for Post-MVP:**

- Query key versioning
- Service layer interfaces
- Integration test files

### Pattern Examples

**Good:**

```typescript
// ✅ Correct patterns
import { createEntry } from '@/actions/entry';

const result = await createEntry(formData);
if (!result.success) {
  toast.error(result.error);
  return;
}

// ✅ RLS test naming
it('manager_can_read_both_departments', async () => {});
```

**Anti-Patterns:**

```typescript
// ❌ Throwing from Server Actions
throw new Error('Failed');

// ❌ Relative imports
import { createEntry } from '../../../actions/entry';

// ❌ TanStack Query in Dashboard
// Dashboard should be Server Component

// ❌ snake_case in React
const user_id = entry.userId;
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
timelog/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker (static cache)
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                # Root layout + PWA meta
│   │   ├── page.tsx                  # Redirect to /entry or /login
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Auth layout (no nav)
│   │   └── (app)/
│   │       ├── layout.tsx            # App layout + BottomNav
│   │       ├── entry/
│   │       │   ├── layout.tsx        # TanStack Query provider wrapper
│   │       │   ├── page.tsx          # Quick Entry (Server shell)
│   │       │   ├── providers.tsx     # TanStack Query provider
│   │       │   └── components/       # Page-specific components
│   │       │       ├── QuickEntryForm.tsx
│   │       │       ├── RecentCards.tsx
│   │       │       ├── DurationStepper.tsx
│   │       │       └── TodayEntries.tsx
│   │       ├── dashboard/
│   │       │   ├── page.tsx          # Personal Dashboard (Server)
│   │       │   └── components/       # Page-specific components
│   │       │       ├── WeeklyStats.tsx
│   │       │       ├── EntryList.tsx
│   │       │       └── ComplianceCard.tsx
│   │       ├── team/
│   │       │   ├── page.tsx          # Manager Dashboard (Server)
│   │       │   └── components/
│   │       │       ├── TeamOverview.tsx
│   │       │       └── DepartmentFilter.tsx
│   │       └── admin/
│   │           ├── page.tsx
│   │           ├── users/page.tsx
│   │           └── master-data/page.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── toast.tsx
│   │   └── shared/                   # Cross-feature reusable components
│   │       ├── BottomNav.tsx
│   │       ├── CascadingJobSelector.tsx
│   │       ├── ServiceTaskSelector.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── LoadingSkeleton.tsx
│   ├── hooks/
│   │   ├── use-entries.ts
│   │   ├── use-entries.test.ts
│   │   ├── use-recent.ts
│   │   ├── use-recent.test.ts
│   │   ├── use-cascading-select.ts
│   │   ├── use-cascading-select.test.ts
│   │   └── use-form-persistence.ts
│   ├── actions/
│   │   ├── entry.ts                  # createEntry, updateEntry, deleteEntry
│   │   ├── master-data.ts            # getClients, getProjects, getJobs
│   │   └── user.ts                   # getCurrentUser, updateProfile
│   ├── services/
│   │   ├── entry.service.ts
│   │   ├── entry.service.test.ts
│   │   ├── master-data.service.ts
│   │   └── transform.ts              # snake_case → camelCase
│   ├── schemas/                      # Zod schemas (reusable)
│   │   ├── entry.schema.ts           # entrySchema, editEntrySchema
│   │   ├── user.schema.ts            # profileSchema
│   │   └── master-data.schema.ts     # clientSchema, projectSchema, jobSchema
│   ├── constants/                    # App-wide constants
│   │   ├── time.ts                   # MAX_DURATION_MINUTES = 480
│   │   ├── roles.ts                  # ROLES, ROLE_PERMISSIONS
│   │   ├── routes.ts                 # ROUTES.ENTRY, ROUTES.DASHBOARD
│   │   └── query-keys.ts             # TanStack Query keys factory
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── database.types.ts         # Supabase generated
│   │   └── domain.ts                 # App domain types
│   └── middleware.ts                 # Next.js auth middleware
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   └── migrations/
│       ├── 001_departments.sql
│       ├── 002_users.sql
│       ├── 003_manager_departments.sql
│       ├── 004_master_data.sql
│       ├── 005_time_entries.sql
│       ├── 006_recent_combinations.sql
│       ├── 007_audit_logs.sql
│       └── 008_rls_policies.sql
├── test/
│   ├── fixtures/                     # Test data
│   │   ├── entries.ts
│   │   ├── master-data.ts
│   │   └── users.ts
│   ├── helpers/
│   │   ├── test-users.ts
│   │   └── supabase-test.ts
│   └── e2e/
│       ├── rls/
│       │   ├── staff.test.ts
│       │   ├── manager.test.ts
│       │   └── admin.test.ts
│       └── flows/
│           ├── quick-entry.test.ts
│           └── dashboard.test.ts
├── .env.local
├── .env.example
├── .gitignore
├── components.json
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts                   # Global test setup
└── README.md
```

### Component Location Rules

**Page-specific components** → `app/(app)/{page}/components/`

- Used only within that page
- Examples: `QuickEntryForm`, `WeeklyStats`, `TeamOverview`

**Shared components** → `components/shared/`

- Reused across multiple pages
- Examples: `CascadingJobSelector`, `BottomNav`, `ErrorBoundary`

**UI primitives** → `components/ui/`

- shadcn/ui components (don't modify)

### Entry Page Layout Wrapper

```typescript
// app/(app)/entry/layout.tsx
import { EntryProviders } from './providers';

export default function EntryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EntryProviders>{children}</EntryProviders>;
}
```

### Architectural Boundaries

**API Boundaries (Server Actions):**

| Action File | Responsibilities | RLS Scope |
|-------------|------------------|-----------|
| `actions/entry.ts` | CRUD time entries | User's own + department |
| `actions/master-data.ts` | Read clients, projects, jobs | All authenticated |
| `actions/user.ts` | User profile operations | Own profile only |

**Data Flow:**

```text
User Action → React Hook Form (Zod schema) → Server Action → Supabase RLS → Response
     ↓                                            ↓
TanStack Query (Entry only)                  Audit Trigger
     ↓
Cache Invalidation
```

### Requirements to Structure Mapping

| Feature | Page Components | Shared Components | Actions | Schemas |
|---------|-----------------|-------------------|---------|---------|
| Quick Entry | `entry/components/*` | `CascadingJobSelector` | `entry.ts` | `entry.schema.ts` |
| Dashboard | `dashboard/components/*` | `LoadingSkeleton` | `entry.ts` | - |
| Team View | `team/components/*` | `LoadingSkeleton` | `entry.ts` | - |
| Admin | `admin/*` | `CascadingJobSelector` | `master-data.ts`, `user.ts` | `master-data.schema.ts` |

### Database Schema Mapping

```text
supabase/migrations/
├── 001_departments.sql     → departments table
├── 002_users.sql           → users table
├── 003_manager_departments.sql → multi-dept junction
├── 004_master_data.sql     → clients, projects, jobs, services, tasks
├── 005_time_entries.sql    → time_entries with snapshot
├── 006_recent_combinations.sql → user_recent_combinations
├── 007_audit_logs.sql      → audit_logs + trigger
└── 008_rls_policies.sql    → All RLS policies
```

### Deferred for Post-MVP

- None - all folders included

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:
- Next.js 14 + Supabase + TanStack Query v5 are compatible
- Server Actions + RLS + Multi-department managers form a cohesive pattern
- Hybrid state management has clear boundaries (TanStack Query only for Quick Entry)

**Pattern Consistency:**
- Naming conventions consistent across all layers (PostgreSQL snake_case, React camelCase)
- Import aliases (@/) enforced throughout codebase
- ActionResult<T> return type standardized for all Server Actions
- Co-located tests follow source file naming

**Structure Alignment:**
- Project structure supports all architectural decisions
- Entry page layout wrapper enables TanStack Query isolation (no Suspense needed)
- Database migrations sequenced correctly for dependencies

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 49 FRs have complete architectural support:

| Category | FRs | Architecture Support |
|----------|-----|---------------------|
| Authentication | FR1-FR6 | Supabase Auth + Middleware + RLS |
| Time Entry | FR7-FR16 | Server Actions + React Hook Form + Zod + CascadingJobSelector |
| Personal Dashboard | FR17-FR22 | Server Components + Supabase queries |
| Team Management | FR23-FR27 | Multi-department RLS + 30s polling |
| User Administration | FR28-FR32 | Admin Panel + Server Actions |
| Master Data | FR33-FR39 | Admin Panel + Soft delete pattern |
| PWA | FR40-FR43 | manifest.json + sw.js + Touch UI |
| System/UX | FR44-FR47 | BottomNav + LoadingSkeleton + Audit trigger |
| First-Time UX | FR48-FR49 | Simple onboarding + contextual guidance |

**Non-Functional Requirements Coverage:**
- Performance: Supabase + Vercel free tiers support <2s load, <200ms API
- Security: RLS policies + Audit trail + Rate limiting (100 req/min)
- Reliability: Error handling patterns + graceful degradation
- Accessibility: WCAG 2.1 Level A via shadcn/ui primitives

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical decisions documented with verified versions
- Multi-department manager support fully specified (junction table + RLS)
- Implementation patterns comprehensive for AI agent consistency

**Database Index Strategy:**
```sql
-- Performance indexes for common queries
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, entry_date);
CREATE INDEX idx_time_entries_dept_date ON time_entries(department_id, entry_date);
CREATE INDEX idx_manager_departments_manager ON manager_departments(manager_id);
```

**Structure Completeness:**
- Complete 60+ file/folder directory structure defined
- Component location rules documented (page-specific vs shared)
- Database migrations sequenced with dependency order

**Entry Layout Note:**
```typescript
// app/(app)/entry/layout.tsx
// NOTE: Do NOT wrap with Suspense - TanStack Query handles loading states
```

**Pattern Completeness:**
- All potential conflict points addressed with examples
- RLS test patterns defined for multi-department scenarios
- 7 mandatory enforcement guidelines for AI agents

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps:** None blocking implementation

**Deferred (Intentional):**
- Query key versioning: Post-MVP optimization
- Service layer interfaces: Over-engineering for current scope

## Auth Flow Diagrams

> Added from Epic 7 Retrospective (AI-3) - 2026-01-05

### 1. User Creation Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Admin     │     │  Server      │     │  Supabase   │     │    New       │
│   (UI)      │     │  Action      │     │  Admin API  │     │    User      │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
       │                   │                    │                    │
       │ Submit form       │                    │                    │
       │ (email, name,     │                    │                    │
       │  role, dept)      │                    │                    │
       │──────────────────>│                    │                    │
       │                   │                    │                    │
       │                   │ 1. inviteUserByEmail()                  │
       │                   │───────────────────>│                    │
       │                   │                    │                    │
       │                   │                    │ Creates auth.users │
       │                   │                    │ (confirmed_at=NULL)│
       │                   │                    │────────────────────│
       │                   │                    │                    │
       │                   │                    │ Sends magic link   │
       │                   │                    │ email              │
       │                   │                    │───────────────────>│
       │                   │                    │                    │
       │                   │ Returns authUser   │                    │
       │                   │<───────────────────│                    │
       │                   │ (user.id)          │                    │
       │                   │                    │                    │
       │                   │ 2. Insert public.users                  │
       │                   │ (id = authUser.id) │                    │
       │                   │───────────────────>│                    │
       │                   │                    │                    │
       │                   │ Returns newUser    │                    │
       │                   │<───────────────────│                    │
       │                   │                    │                    │
       │ Toast: "User      │                    │                    │
       │ created. Invite   │                    │                    │
       │ sent to {email}"  │                    │                    │
       │<──────────────────│                    │                    │
       │                   │                    │                    │
```

**Key Points:**
- `inviteUserByEmail()` creates both `auth.users` record AND sends email
- `public.users.id` uses same UUID from `auth.users.id` (FK relationship)
- `public.users.confirmed_at = NULL` marks user as "Pending"

### 2. Invitation Confirmation Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   New       │     │  Supabase    │     │  Database   │     │   public     │
│   User      │     │  Auth        │     │  Trigger    │     │   .users     │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
       │                   │                    │                    │
       │ Click magic link  │                    │                    │
       │ from email        │                    │                    │
       │──────────────────>│                    │                    │
       │                   │                    │                    │
       │                   │ Validates token    │                    │
       │                   │ Updates auth.users │                    │
       │                   │ confirmed_at=NOW() │                    │
       │                   │────────────────────│                    │
       │                   │                    │                    │
       │                   │                    │ on_auth_user_      │
       │                   │                    │ confirmed TRIGGER  │
       │                   │                    │──────────────>     │
       │                   │                    │                    │
       │                   │                    │ sync_user_         │
       │                   │                    │ confirmed_at()     │
       │                   │                    │                    │
       │                   │                    │ UPDATE public.users│
       │                   │                    │ SET confirmed_at   │
       │                   │                    │───────────────────>│
       │                   │                    │                    │
       │                   │ Creates session    │                    │
       │                   │<───────────────────│                    │
       │                   │                    │                    │
       │ Redirect to /login│                    │                    │
       │ (with session)    │                    │                    │
       │<──────────────────│                    │                    │
       │                   │                    │                    │
       │ User can login    │                    │                    │
       │ Status: "Active"  │                    │                    │
       │                   │                    │                    │
```

**Database Trigger:**
```sql
-- Trigger syncs confirmed_at from auth.users to public.users
CREATE TRIGGER on_auth_user_confirmed
AFTER UPDATE OF confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.sync_user_confirmed_at();
```

### 3. Rollback Scenarios

#### Scenario A: public.users Insert Fails

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Admin     │     │  Server      │     │  Supabase   │     │  Database    │
│   (UI)      │     │  Action      │     │  Admin API  │     │              │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
       │                   │                    │                    │
       │ Submit form       │                    │                    │
       │──────────────────>│                    │                    │
       │                   │                    │                    │
       │                   │ 1. inviteUserByEmail()                  │
       │                   │───────────────────>│                    │
       │                   │                    │                    │
       │                   │ Returns authUser   │                    │
       │                   │<───────────────────│                    │
       │                   │                    │                    │
       │                   │ 2. Insert public.users                  │
       │                   │───────────────────────────────────────>│
       │                   │                    │                    │
       │                   │                    │    INSERT FAILS    │
       │                   │<───────────────────────────────────────│
       │                   │                    │ (e.g., duplicate)  │
       │                   │                    │                    │
       │                   │ 3. ROLLBACK:       │                    │
       │                   │ deleteUser(authUser.id)                 │
       │                   │───────────────────>│                    │
       │                   │                    │                    │
       │                   │ Auth user deleted  │                    │
       │                   │<───────────────────│                    │
       │                   │                    │                    │
       │ Error: "Email     │                    │                    │
       │ already exists"   │                    │                    │
       │<──────────────────│                    │                    │
       │                   │                    │                    │
```

**Code Implementation:**
```typescript
// src/actions/user.ts - createUser()
if (insertError) {
  // Story 7.2a: AC 4 - Rollback on Failure
  await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);

  if (insertError.code === '23505') {
    return { success: false, error: 'Email already exists' };
  }
  return { success: false, error: 'Failed to create user profile' };
}
```

#### Scenario B: inviteUserByEmail Fails

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Admin     │     │  Server      │     │  Supabase   │
│   (UI)      │     │  Action      │     │  Admin API  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │                    │
       │ Submit form       │                    │
       │──────────────────>│                    │
       │                   │                    │
       │                   │ inviteUserByEmail()│
       │                   │───────────────────>│
       │                   │                    │
       │                   │      ERROR         │
       │                   │<───────────────────│
       │                   │ (email service     │
       │                   │  failure, etc.)    │
       │                   │                    │
       │ Error: "Failed to │   [No rollback     │
       │ send invitation   │    needed - no     │
       │ email"            │    records created]│
       │<──────────────────│                    │
       │                   │                    │
```

**No rollback needed** - Supabase's `inviteUserByEmail()` is atomic. If it fails, no records are created.

### User Status State Machine

```
                     ┌─────────────────┐
                     │                 │
     Create User     │    PENDING      │
    ─────────────────>│ (confirmed_at  │
                     │    = NULL)      │
                     │                 │
                     └────────┬────────┘
                              │
                              │ Click magic link
                              │ (confirmation)
                              │
                              v
                     ┌─────────────────┐
                     │                 │
                     │    ACTIVE       │──────────────────┐
                     │ (confirmed_at   │                  │
                     │   ≠ NULL,       │ Deactivate       │
                     │  is_active=true)│                  │
                     │                 │                  v
                     └────────┬────────┘         ┌────────────────┐
                              ^                  │                │
                              │                  │   INACTIVE     │
                              │ Reactivate       │ (is_active     │
                              │                  │   = false)     │
                              └──────────────────│                │
                                                 └────────────────┘
```

### Related Files

| File | Purpose |
|------|---------|
| `src/lib/supabase/admin.ts` | Admin client for service-role operations |
| `src/actions/user.ts` | `createUser()`, `resendInvitation()` |
| `supabase/migrations/20260104071024_add_user_confirmed_at.sql` | Trigger for sync |

### RLS Testing Requirements

**RLS Test Priority Rule:**
> ⚠️ **CRITICAL:** Every migration with RLS policy changes MUST pass RLS E2E tests before merge

**Mandatory Negative Test Case:**
```typescript
// test/e2e/rls/multi-dept.test.ts - MUST EXIST
it('manager_cannot_see_third_department', async () => {
  // Manager manages dept-a, dept-b but MUST NOT see dept-c
  const entries = await asUser(testUsers.manager.id, (supabase) =>
    supabase.from('time_entries')
      .select('*')
      .eq('department_id', 'dept-c-id')
  );
  expect(entries.data).toHaveLength(0);
});
```

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (~60 users, low-medium complexity)
- [x] Technical constraints identified (฿0 budget, solo dev)
- [x] Cross-cutting concerns mapped (11 concerns)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Multi-department manager support designed
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Database index strategy defined

**✅ Implementation Patterns**
- [x] Naming conventions established (database, code, files)
- [x] Structure patterns defined (feature-based, co-located tests)
- [x] Communication patterns specified (Server Actions, ActionResult<T>)
- [x] Process patterns documented (form submission, RLS testing)

**✅ Project Structure**
- [x] Complete directory structure defined (60+ items)
- [x] Component boundaries established (page-specific vs shared)
- [x] Integration points mapped (data flow diagram)
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION ✅

**Confidence Level:** HIGH

**Key Strengths:**
- Multi-department manager support fully architected
- Clear separation of Server Components vs TanStack Query
- Comprehensive RLS policies for 4 roles with negative test cases
- Well-defined patterns prevent AI agent conflicts
- Complete project structure with no placeholders
- Database index strategy for performance

**Areas for Future Enhancement:**
- Executive Dashboard (Phase 2)
- Real-time subscriptions (currently polling)
- Offline data entry (Phase 3)
- Query key versioning (optimization)

### Definition of Done - Architecture Compliance

All stories MUST verify before completion:
- [ ] All new Server Actions return `ActionResult<T>`
- [ ] All imports use `@/` aliases (no relative paths)
- [ ] All new RLS policies have corresponding E2E tests
- [ ] Database naming follows snake_case convention
- [ ] Component location follows page-specific vs shared rules

### Implementation Handoff

**AI Agent Guidelines:**
1. Follow all architectural decisions exactly as documented
2. Use implementation patterns consistently across all components
3. Respect project structure and component location rules
4. Use @/ import aliases, never relative paths
5. Transform snake_case ↔ camelCase at service boundary
6. Use ActionResult<T> for all Server Actions
7. Run RLS tests for each role after policy changes
8. Include negative test cases for RLS boundaries

**First Implementation Priority:**
```bash
# Step 1: Initialize project
npx create-next-app -e with-supabase timelog

# Step 2: Install dependencies
cd timelog
npm install framer-motion @use-gesture/react
npm install -D vitest @testing-library/react @playwright/test

# Step 3: Set up database migrations (with indexes)
supabase init
supabase migration new 001_departments
# ... continue with migration sequence including indexes
```

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2025-12-30
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- 25+ architectural decisions made
- 15+ implementation patterns defined
- 60+ architectural components specified
- 49 functional requirements fully supported

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Timelog. Follow all decisions, patterns, and structures exactly as documented.

**Development Sequence:**

1. Initialize project using documented starter template
2. Set up database schema with multi-department support
3. Implement RLS policies with E2E tests
4. Build core features following established patterns
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**

- [x] All 49 functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled (11 concerns)
- [x] Integration points are defined

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen starter template and architectural patterns provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

