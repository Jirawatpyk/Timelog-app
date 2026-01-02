# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timelog เป็นระบบบันทึกเวลาการทำงานสำหรับทีม พัฒนาด้วย Next.js 16 + Supabase (PostgreSQL 17)

## Essential Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build production bundle
npm start            # Start production server

# Testing
npm test             # Run unit tests with Vitest
npm run test:e2e     # Run E2E tests with Playwright

# Linting
npm run lint         # Run ESLint

# Supabase
npx supabase start                    # Start local Supabase
npx supabase migration new <name>     # Create new migration
npx supabase migration up             # Apply migrations
npx supabase gen types typescript --local > src/types/database.types.ts  # Generate types
```

## Architecture

### Tech Stack
- **Frontend:** Next.js 16 (App Router), React 18, TypeScript (strict mode)
- **UI:** shadcn/ui (New York style), Tailwind CSS, framer-motion
- **Backend:** Supabase (PostgreSQL 17 + Auth + RLS)
- **Testing:** Vitest + @testing-library/react (unit), Playwright (E2E)

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Protected routes (dashboard, entry, team, admin)
│   └── (auth)/             # Public auth routes (login, sign-up, etc.)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── shared/             # Reusable app components
│   ├── entry/              # Entry page components
│   ├── dashboard/          # Dashboard components
│   └── navigation/         # Navigation components (BottomNav, Sidebar)
├── lib/
│   ├── supabase/           # Supabase clients (client.ts, server.ts, proxy.ts)
│   ├── draft/              # Form draft persistence module
│   ├── master-data/        # Master data fetching utilities
│   ├── dashboard/          # Dashboard period utilities
│   └── queries/            # Query helpers
├── types/
│   ├── domain.ts           # Domain types (Row, Insert, Update helpers)
│   └── database.types.ts   # Auto-generated Supabase types
├── services/               # Business logic layer
├── actions/                # Server actions
├── schemas/                # Validation schemas
└── hooks/                  # Custom React hooks

supabase/
└── migrations/             # SQL migrations (001-008)

test/
├── setup.ts                # Vitest setup
├── e2e/                    # Playwright tests
├── fixtures/               # Test data factories
└── helpers/                # Test utilities (master-data.ts, etc.)
```

### Database Schema (Core Tables)
- **users** - User profiles linked to auth.users (roles: staff, manager, admin, super_admin)
- **departments** - Organization departments
- **manager_departments** - Manager-to-department assignments (many-to-many)
- **clients** → **projects** → **jobs** - Client hierarchy
- **services**, **tasks** - Lookup tables for time entries
- **time_entries** - Core business data (user, job, service, task, duration, date)
- **user_recent_combinations** - Quick entry optimization
- **audit_logs** - Change tracking

### Authentication & Authorization
- Cookie-based sessions via @supabase/ssr
- Middleware (`middleware.ts`) handles session refresh and route protection
- Row Level Security (RLS) enforced on all tables
- Role-based access: staff < manager < admin < super_admin

### Path Aliases
- `@/*` → `./src/*`

## Development Conventions

- ตอบกลับเป็นภาษาไทยเข้าใจง่าย
- ทำงานแบบ Best Practice และ Reusable Components
- การแบ่งส่วน (Modularity): แบ่งระบบออกเป็นส่วนย่อยๆ ที่ชัดเจน
- ความสามารถในการขยายตัว (Scalability): ออกแบบให้รองรับการเติบโต
- ความปลอดภัย (Security): คำนึงถึงความเสี่ยงตั้งแต่ขั้นตอนออกแบบ
- ประสิทธิภาพ (Performance): ออกแบบให้ทำงานได้อย่างรวดเร็ว

## Type Safety

ใช้ generated types จาก Supabase:
```typescript
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';

type User = Tables<'users'>;
type NewTimeEntry = TablesInsert<'time_entries'>;
type UpdateJob = TablesUpdate<'jobs'>;
```

## TanStack Query v5 Usage

TanStack Query is used **exclusively on the Entry page** for client-side data caching. Other pages (Dashboard, Team, Admin) use Server Components.

### Provider Setup

```typescript
// src/app/(app)/entry/providers.tsx
// ONLY location for QueryClientProvider in the entire app

export function EntryQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (v5 renamed from cacheTime)
          },
        },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Query Hook Pattern

```typescript
// src/hooks/use-entry-data.ts
// All Entry page queries in one file

export function useClients() {
  return useQuery({
    queryKey: ['clients', 'active'],
    queryFn: async () => {
      const result = await getActiveClients();
      if (!result.success) throw new Error(result.error); // Convert ActionResult to throw
      return result.data;
    },
  });
}

// Dependent query (enabled only when parent selected)
export function useProjects(clientId: string | null) {
  return useQuery({
    queryKey: ['projects', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await getProjectsByClient(clientId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!clientId, // Only fetch when clientId exists
  });
}
```

### Optimistic Updates Pattern

```typescript
// For delete operations with animation
const handleDeleteConfirm = async () => {
  // 1. Optimistic update: remove from cache immediately
  queryClient.setQueryData<TimeEntryWithDetails[]>(['userEntries'], (old) =>
    old?.filter((e) => e.id !== entryToDelete.id) ?? []
  );

  // 2. Call server action
  const result = await deleteTimeEntry(entryToDelete.id);

  if (!result.success) {
    // 3a. Rollback on error
    queryClient.invalidateQueries({ queryKey: ['userEntries'] });
    toast.error(result.error);
    return;
  }

  // 3b. Sync with server on success
  queryClient.invalidateQueries({ queryKey: ['userEntries'] });
};
```

### Query Key Conventions

| Query Key | Description |
|-----------|-------------|
| `['clients', 'active']` | Active clients list |
| `['projects', clientId]` | Projects filtered by client |
| `['jobs', projectId]` | Jobs filtered by project |
| `['services', 'active']` | Active services list |
| `['tasks', 'active']` | Active tasks list |
| `['userEntries']` | Current user's recent entries |
| `['recentCombinations']` | User's quick entry combinations |

### Anti-Patterns

```typescript
// ❌ NEVER add TanStack Query to Dashboard/Team/Admin pages
// These should be Server Components

// ❌ NEVER use useQuery outside Entry page
// Other pages use Server Components + revalidatePath

// ❌ NEVER forget enabled option for dependent queries
useQuery({ queryKey: ['projects', clientId], queryFn, enabled: !!clientId });

// ❌ NEVER return ActionResult from queryFn - throw errors instead
queryFn: async () => {
  const result = await serverAction();
  if (!result.success) throw new Error(result.error); // Throw, don't return
  return result.data;
}
```

## Draft Module (Form Persistence)

The draft module (`src/lib/draft/`) provides form draft persistence using sessionStorage.

### Basic Usage

```typescript
import { useDraftPersistence, DRAFT_KEYS, cleanupExpiredDrafts } from '@/lib/draft';

// 1. Clean up expired drafts on app mount (in layout.tsx)
useEffect(() => {
  cleanupExpiredDrafts();
}, []);

// 2. Use in form components
function MyForm() {
  const form = useForm<FormData>();
  const { clearDraft } = useDraftPersistence({
    form,
    storageKey: DRAFT_KEYS.entry,
  });

  const onSubmit = async (data: FormData) => {
    const result = await submitAction(data);
    if (result.success) {
      clearDraft(); // Clear draft on successful submit
    }
  };
}
```

### Draft Keys

| Key | Usage |
|-----|-------|
| `DRAFT_KEYS.entry` | New time entry form |
| `DRAFT_KEYS.editEntry(id)` | Edit entry form (unique per entry) |

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DRAFT_EXPIRY_MS` | 86,400,000 | 24 hours expiry |
| `DRAFT_SAVE_DEBOUNCE_MS` | 2,000 | 2 second debounce |

### Module Exports

```typescript
// Types
export type { FormDraft } from './types';

// Constants
export { DRAFT_KEYS, DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS } from './constants';

// Utilities
export { cleanupExpiredDrafts, hasDraft, getDraftAge } from './utils';

// Hook
export { useDraftPersistence } from './use-draft-persistence';
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Library Selection Criteria

When adding new dependencies, evaluate against these criteria:

### Must Have
1. **TypeScript Support** - First-class TS types (not @types/* from DefinitelyTyped)
2. **Active Maintenance** - Updated within last 6 months, responsive to issues
3. **Bundle Size** - Consider impact on client bundle (use bundlephobia.com)
4. **Security** - No known vulnerabilities (check npm audit)

### Prefer
- **Tree-shakeable** - ES modules for dead code elimination
- **Zero/minimal dependencies** - Reduces supply chain risk
- **Widely adopted** - >10k weekly downloads, established community
- **Framework-aligned** - Works well with Next.js App Router patterns

### Current Library Decisions

| Library | Purpose | Why Chosen |
|---------|---------|------------|
| **shadcn/ui** | UI Components | Copy-paste ownership, Radix primitives, full customization |
| **TanStack Query v5** | Server state (Entry page only) | Industry standard, excellent caching, devtools |
| **React Hook Form** | Form handling | Minimal re-renders, great DX, Zod integration |
| **Zod** | Validation | TypeScript-first, composable schemas |
| **framer-motion** | Animations | Declarative API, gesture support, production-ready |
| **Sonner** | Toast notifications | Minimal, accessible, good defaults |
| **date-fns** | Date utilities | Tree-shakeable, immutable, TypeScript |

### Explicitly Avoided

| Library | Reason |
|---------|--------|
| **Redux/Zustand** | Overkill for this app size; Server Components + TanStack Query sufficient |
| **next-pwa** | Manual PWA setup preferred for control |
| **moment.js** | Large bundle, mutable API; use date-fns instead |
| **axios** | fetch() is sufficient; reduces dependencies |

### Adding New Libraries

Before adding a new dependency:
1. Check if existing libraries can solve the problem
2. Evaluate bundle size impact
3. Verify TypeScript support quality
4. Check maintenance status and community size
5. Consider if a simple utility function would suffice
