---
project_name: 'Timelog'
user_name: 'Jiraw'
date: '2025-12-30'
sections_completed: ['technology_stack', 'implementation_rules', 'testing_rules', 'constants', 'anti_patterns', 'usage_guidelines']
source_document: '_bmad-output/planning-artifacts/architecture.md'
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 14 | App Router, Server Components default |
| TypeScript | Strict mode | `noImplicitAny`, `strictNullChecks` |
| Supabase | Latest | Auth + PostgreSQL + RLS + Realtime |
| TanStack Query | v5 | **ONLY for Entry page** |
| React Hook Form | Latest | With Zod resolver |
| Zod | Latest | Validation schemas |
| shadcn/ui | Latest | Radix UI primitives |
| Tailwind CSS | Latest | Utility-first |
| Framer Motion | Latest | Animations |
| Vitest | Latest | Unit testing |
| Playwright | Latest | E2E testing |

---

## Critical Implementation Rules

### Server Actions Pattern

```typescript
// ✅ ALWAYS return ActionResult<T> - NEVER throw
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ✅ Correct pattern
export async function createEntry(formData: FormData): Promise<ActionResult<TimeEntry>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('time_entries').insert({...}).select().single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard');
  return { success: true, data };
}

// ❌ NEVER do this
export async function createEntry(formData: FormData) {
  // ...
  if (error) throw new Error(error.message); // WRONG!
}
```

### Import Aliases

```typescript
// ✅ ALWAYS use @/ aliases
import { createEntry } from '@/actions/entry';
import { Button } from '@/components/ui/button';
import type { TimeEntry } from '@/types/domain';

// ❌ NEVER use relative paths
import { createEntry } from '../../../actions/entry'; // WRONG!
```

### State Management Rules

```typescript
// ✅ TanStack Query ONLY in Entry page
// app/(app)/entry/providers.tsx - ONLY place for QueryClientProvider

// ✅ Dashboard, Team, Admin = Server Components
// NO TanStack Query, use Server Components + revalidatePath

// ❌ NEVER add TanStack Query to Dashboard/Team/Admin pages
```

### Data Transform at Service Boundary

```typescript
// Database returns snake_case, React uses camelCase
// Transform at service layer ONLY

// ✅ Correct - transform at boundary
function toTimeEntry(row: Database['time_entries']): TimeEntry {
  return {
    id: row.id,
    userId: row.user_id,        // snake → camel
    jobId: row.job_id,
    durationMinutes: row.duration_minutes,
    entryDate: row.entry_date,
    departmentId: row.department_id,
  };
}

// ❌ NEVER mix naming in React components
const user_id = entry.userId; // WRONG!
```

---

## Database Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `time_entries`, `manager_departments` |
| Columns | snake_case | `user_id`, `created_at`, `job_no` |
| Foreign Keys | `{table_singular}_id` | `department_id`, `project_id` |
| Indexes | `idx_{table}_{columns}` | `idx_time_entries_user_date` |

---

## UI Standards

### Language
- **UI Language:** English only (no Thai mixed)
- **Font:** Inter (Google Fonts, Latin subset)
- All labels, buttons, messages, placeholders must be in English

### Color Theme (Blue Brand)
```css
/* Primary - Blue Brand */
--primary: 221 83% 53%;        /* Light mode */
--primary: 217 91% 60%;        /* Dark mode */

/* Semantic Colors */
--success: 142 76% 36%;        /* Green */
--warning: 38 92% 50%;         /* Amber */
--info: 199 89% 48%;           /* Cyan */
--destructive: 0 84% 60%;      /* Red */
```

### Design System
- Use shadcn/ui components (New York style)
- Support Light/Dark mode via CSS variables
- Mobile-first responsive design

---

## File & Component Naming

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase.tsx | `QuickEntry.tsx`, `CascadingJobSelector.tsx` |
| Hooks | use-{name}.ts | `use-entries.ts`, `use-cascading-select.ts` |
| Actions | {domain}.ts | `entry.ts`, `master-data.ts` |
| Schemas | {domain}.schema.ts | `entry.schema.ts`, `user.schema.ts` |
| Routes | kebab-case | `app/(app)/quick-entry/` |
| Tests | co-located | `use-entries.test.ts` next to `use-entries.ts` |

**Zod Schema Location:**
```
src/schemas/
├── entry.schema.ts       # entrySchema, editEntrySchema
├── user.schema.ts        # profileSchema
└── master-data.schema.ts # clientSchema, projectSchema, jobSchema
```

---

## Component Location Rules

**Page-specific components** → `app/(app)/{page}/components/`
- Used only within that page
- Examples: `QuickEntryForm`, `WeeklyStats`, `TeamOverview`

**Shared components** → `components/shared/` or domain-specific folders
- Reused across multiple pages
- Examples: `CascadingJobSelector`, `ErrorBoundary`
- Navigation: `components/navigation/` (BottomNav, SideNav)

**UI primitives** → `components/ui/`
- shadcn/ui components (don't modify)

---

## RLS Testing Requirements

> ⚠️ **CRITICAL:** Every migration with RLS policy changes MUST pass E2E tests before merge

### E2E Test File Organization

```text
test/e2e/
├── flows/                    # User flow tests
│   ├── quick-entry.test.ts
│   └── dashboard.test.ts
└── rls/                      # RLS policy tests
    ├── staff.test.ts
    ├── manager.test.ts
    └── admin.test.ts
```

### Mandatory Test Users

```typescript
// test/helpers/test-users.ts
export const testUsers = {
  staff: { id: 'staff-uuid', role: 'staff', departmentId: 'dept-a' },
  manager: { id: 'manager-uuid', role: 'manager', departments: ['dept-a', 'dept-b'] },
  admin: { id: 'admin-uuid', role: 'admin' },
  superAdmin: { id: 'super-uuid', role: 'super_admin' },
};
```

### Test Naming Convention

```typescript
// ✅ Correct naming pattern
it('staff_can_read_own_entries', async () => {});
it('staff_cannot_read_other_entries', async () => {});
it('manager_can_read_dept_a_entries', async () => {});
it('manager_can_read_dept_b_entries', async () => {});  // Multi-dept!
it('manager_cannot_read_dept_c_entries', async () => {}); // CRITICAL negative test
```

### Mandatory Negative Test Case

```typescript
// test/e2e/rls/multi-dept.test.ts - MUST EXIST
it('manager_cannot_see_third_department', async () => {
  // Manager manages dept-a, dept-b but MUST NOT see dept-c
  const entries = await asUser(testUsers.manager.id, (supabase) =>
    supabase.from('time_entries')
      .select('*')
      .eq('department_id', 'dept-c-id')
  );
  expect(entries.data).toHaveLength(0); // MUST be empty
});
```

### RLS Test Helper Pattern

```typescript
// test/helpers/supabase-test.ts
export async function asUser<T>(
  userId: string,
  query: (supabase: SupabaseClient) => Promise<T>
): Promise<T> {
  const supabase = createTestClient(userId);
  return query(supabase);
}
```

### Test Data Cleanup Rule

```typescript
// ✅ Each test MUST clean up its own data
afterEach(async () => {
  await cleanupTestEntries(testUsers.staff.id);
});

// test/helpers/cleanup.ts
export async function cleanupTestEntries(userId: string) {
  const supabase = createServiceClient();
  await supabase.from('time_entries').delete().eq('user_id', userId);
}
```

---

## Multi-Department Manager Support

**Database Design:**
```sql
-- Junction table for managers overseeing multiple departments
CREATE TABLE manager_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manager_id, department_id)
);
```

**RLS Policy Pattern:**
```sql
-- Managers see entries from ALL their departments
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
```

---

## Entry Page Layout

```typescript
// app/(app)/entry/layout.tsx
// NOTE: Do NOT wrap with Suspense - TanStack Query handles loading states
import { EntryProviders } from './providers';

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return <EntryProviders>{children}</EntryProviders>;
}
```

---

## Form Handling Pattern

```typescript
// ✅ React Hook Form + Zod + Server Action
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entrySchema } from '@/schemas/entry.schema';
import { createEntry } from '@/actions/entry';

const form = useForm({ resolver: zodResolver(entrySchema) });

// Form draft persistence
useEffect(() => {
  const subscription = form.watch((data) => {
    sessionStorage.setItem(DRAFT_KEYS.entry, JSON.stringify(data));
  });
  return () => subscription.unsubscribe();
}, [form]);
```

---

## Constants & Configuration

### Draft Keys (Form Persistence)

```typescript
// src/constants/storage.ts
export const DRAFT_KEYS = {
  entry: 'draft-entry',
  editEntry: (id: string) => `draft-entry-${id}`,
} as const;
```

### Polling Intervals

```typescript
// src/constants/time.ts
export const POLLING_INTERVAL_MS = 30_000; // 30 seconds
export const MAX_DURATION_MINUTES = 480;   // 8 hours
export const STALE_TIME_MS = 30_000;       // TanStack Query stale time
```

### Environment Variables

```bash
# .env.local - Naming convention

# Public (client-safe) - prefix with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Private (server-only) - NO prefix
SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## Definition of Done - Architecture Compliance

All stories MUST verify before completion:
- [ ] All new Server Actions return `ActionResult<T>`
- [ ] All imports use `@/` aliases (no relative paths)
- [ ] All new RLS policies have corresponding E2E tests
- [ ] Database naming follows snake_case convention
- [ ] Component location follows page-specific vs shared rules
- [ ] Tests are co-located with source files

---

## Anti-Patterns to Avoid

```typescript
// ❌ Throwing from Server Actions
throw new Error('Failed'); // Use ActionResult instead

// ❌ Relative imports
import { foo } from '../../../utils'; // Use @/utils

// ❌ TanStack Query in Dashboard/Team/Admin
useQuery(...) // These should be Server Components

// ❌ snake_case in React code
const user_id = entry.userId; // Use camelCase

// ❌ Wrapping Entry layout with Suspense
<Suspense><EntryProviders>...</EntryProviders></Suspense> // TanStack handles this

// ❌ Forgetting negative RLS tests
// MUST test that unauthorized access returns empty/error
```

---

## Quick Reference

| Rule | Pattern |
|------|---------|
| Server Action return | `ActionResult<T>` |
| Imports | `@/` aliases only |
| TanStack Query | Entry page only |
| Database naming | snake_case |
| React naming | camelCase |
| Component naming | PascalCase |
| Hook naming | use-{name}.ts |
| Test naming | {source}.test.ts (co-located) |
| RLS tests | Include negative test cases |

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge during implementation

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

_Last Updated: 2025-12-30_
