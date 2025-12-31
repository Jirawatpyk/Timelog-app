# Story 1.2: Database Schema - Core Tables

Status: done

## Story

As a **developer**,
I want **the core database tables created with proper relationships**,
So that **the application can store and manage data**.

## Acceptance Criteria

1. **AC1: Departments Table**
   - Given Supabase project is connected
   - When migrations are run
   - Then `departments` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `name` TEXT NOT NULL
     - `active` BOOLEAN DEFAULT true
     - `created_at` TIMESTAMPTZ DEFAULT now()

2. **AC2: Users Table**
   - Given departments table exists
   - When migrations are run
   - Then `users` table exists with:
     - `id` UUID PRIMARY KEY REFERENCES auth.users(id)
     - `email` TEXT NOT NULL
     - `display_name` TEXT
     - `role` TEXT CHECK (role IN ('staff', 'manager', 'admin', 'super_admin'))
     - `department_id` UUID REFERENCES departments(id)
     - `created_at` TIMESTAMPTZ DEFAULT now()

3. **AC3: Clients Table**
   - Given Supabase project is connected
   - When migrations are run
   - Then `clients` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `name` TEXT NOT NULL
     - `active` BOOLEAN DEFAULT true
     - `created_at` TIMESTAMPTZ DEFAULT now()

4. **AC4: Projects Table**
   - Given clients table exists
   - When migrations are run
   - Then `projects` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `client_id` UUID REFERENCES clients(id) ON DELETE CASCADE
     - `name` TEXT NOT NULL
     - `active` BOOLEAN DEFAULT true
     - `created_at` TIMESTAMPTZ DEFAULT now()
   - And index `idx_projects_client` exists on `client_id`

5. **AC5: Jobs Table**
   - Given projects table exists
   - When migrations are run
   - Then `jobs` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `project_id` UUID REFERENCES projects(id) ON DELETE CASCADE
     - `name` TEXT NOT NULL
     - `job_no` TEXT
     - `so_no` TEXT
     - `active` BOOLEAN DEFAULT true
     - `created_at` TIMESTAMPTZ DEFAULT now()
   - And index `idx_jobs_project` exists on `project_id`

6. **AC6: Services Table**
   - Given Supabase project is connected
   - When migrations are run
   - Then `services` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `name` TEXT NOT NULL UNIQUE
     - `active` BOOLEAN DEFAULT true
     - `created_at` TIMESTAMPTZ DEFAULT now()

7. **AC7: Tasks Table**
   - Given Supabase project is connected
   - When migrations are run
   - Then `tasks` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `name` TEXT NOT NULL UNIQUE
     - `active` BOOLEAN DEFAULT true
     - `created_at` TIMESTAMPTZ DEFAULT now()

8. **AC8: Foreign Key Constraints**
   - Given all tables are created
   - When reviewing constraints
   - Then `projects.client_id` cascades on delete
   - And `jobs.project_id` cascades on delete
   - And `users.department_id` references departments (no cascade - prevent accidental user deletion)

## Tasks / Subtasks

- [x] **Task 1: Initialize Supabase in Project** (AC: 1-7)
  - [x] 1.1 Run `supabase init` in project root (if not already done)
  - [x] 1.2 Verify `supabase/config.toml` exists
  - [x] 1.3 Link to remote Supabase cloud (alternative to local)

- [x] **Task 2: Create Departments Migration** (AC: 1)
  - [x] 2.1 Run `supabase migration new 001_departments`
  - [x] 2.2 Add departments table DDL to migration file
  - [x] 2.3 Apply migration with `supabase db push`
  - [x] 2.4 Verify table exists in Supabase Studio

- [x] **Task 3: Create Users Migration** (AC: 2)
  - [x] 3.1 Run `supabase migration new 002_users`
  - [x] 3.2 Add users table DDL with role CHECK constraint
  - [x] 3.3 Add foreign key to departments
  - [x] 3.4 Apply migration and verify

- [x] **Task 4: Create Master Data Migration** (AC: 3, 4, 5, 6, 7)
  - [x] 4.1 Run `supabase migration new 004_master_data`
  - [x] 4.2 Add clients table DDL
  - [x] 4.3 Add projects table DDL with FK to clients
  - [x] 4.4 Add jobs table DDL with FK to projects
  - [x] 4.5 Add services table DDL with UNIQUE constraint on name
  - [x] 4.6 Add tasks table DDL with UNIQUE constraint on name
  - [x] 4.7 Apply migration and verify all tables

- [x] **Task 5: Create Indexes** (AC: 4, 5, 8)
  - [x] 5.1 Add `CREATE INDEX idx_projects_client ON projects(client_id)`
  - [x] 5.2 Add `CREATE INDEX idx_jobs_project ON jobs(project_id)`
  - [x] 5.3 Verify indexes in Supabase Studio

- [x] **Task 6: Generate TypeScript Types** (AC: all)
  - [x] 6.1 Run `supabase gen types typescript --project-id > src/types/database.types.ts`
  - [x] 6.2 Verify generated types include all tables
  - [x] 6.3 Create `src/types/domain.ts` with app-specific type aliases

- [x] **Task 7: Verify Schema Integrity** (AC: all)
  - [x] 7.1 TypeScript compiles without errors
  - [x] 7.2 All 7 tables created in remote Supabase
  - [x] 7.3 Migrations pushed successfully
  - [x] 7.4 Generated types include all tables with correct structure
  - [x] 7.5 Domain types created with Row, Insert, Update types

## Dev Notes

### Database Naming Convention

All database elements MUST follow snake_case:
- Tables: plural, snake_case (e.g., `time_entries`, `manager_departments`)
- Columns: snake_case (e.g., `user_id`, `created_at`, `job_no`)
- Foreign keys: `{table_singular}_id` (e.g., `department_id`, `project_id`)
- Indexes: `idx_{table}_{columns}` (e.g., `idx_projects_client`)

### Migration File Structure

```
supabase/migrations/
├── 001_departments.sql     # departments table
├── 002_users.sql           # users table (depends on departments)
├── 004_master_data.sql     # clients, projects, jobs, services, tasks
```

Note: Migration 003 is reserved for `manager_departments` (Story 1.3).

### Complete SQL for Departments Table

```sql
-- supabase/migrations/001_departments.sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
```

### Complete SQL for Users Table

```sql
-- supabase/migrations/002_users.sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT CHECK (role IN ('staff', 'manager', 'admin', 'super_admin')) DEFAULT 'staff',
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Complete SQL for Master Data Tables

```sql
-- supabase/migrations/004_master_data.sql

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects table (depends on clients)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_projects_client ON projects(client_id);

-- Jobs table (depends on projects)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_no TEXT,
  so_no TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_jobs_project ON jobs(project_id);

-- Services table (standalone lookup)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks table (standalone lookup)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables (policies added in Story 1.4)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

### Entity Relationship Summary

```
departments (1) ←──── (N) users
    │
    └── Each user belongs to one department

clients (1) ←──── (N) projects (1) ←──── (N) jobs
    │                   │                   │
    └── CASCADE ────────┴── CASCADE ────────┘

services (standalone lookup table)
tasks (standalone lookup table)
```

### Data Hierarchy for Time Entry Selection

```
1. Client → 2. Project → 3. Job → 4. Service → 5. Task (optional)
```

### TypeScript Type Generation

After running migrations, generate types:

```bash
supabase gen types typescript --local > src/types/database.types.ts
```

Then create domain types in `src/types/domain.ts`:

```typescript
import type { Database } from './database.types';

// Table row types
export type Department = Database['public']['Tables']['departments']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];

// User roles
export type UserRole = 'staff' | 'manager' | 'admin' | 'super_admin';
```

### Project Structure Notes

- Migrations: `supabase/migrations/`
- Generated types: `src/types/database.types.ts`
- Domain types: `src/types/domain.ts`
- All paths use `@/` import aliases per project-context.md

### Testing Considerations

While no E2E tests are required for this story (schema only), Story 1.4 (RLS Policies) will require comprehensive E2E tests that verify:
- Role CHECK constraint enforcement
- Foreign key cascade behavior
- UNIQUE constraint enforcement on services/tasks

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Database Schema for Multi-Department Managers]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Database Schema Mapping]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/project-context.md#Database Naming Conventions]

## Definition of Done

- [x] All 7 tables created successfully
- [x] All foreign key constraints working
- [x] All indexes created
- [x] Role CHECK constraint validated
- [x] UNIQUE constraints on services.name and tasks.name validated
- [x] TypeScript types generated and verified
- [x] `supabase db push` completes without errors
- [x] Tables visible in Supabase Studio

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. Initialized Supabase in project with `npx supabase init`
2. Created 3 migration files:
   - `20251230192109_001_departments.sql` - departments table
   - `20251230192149_002_users.sql` - users table with role CHECK constraint
   - `20251230192357_004_master_data.sql` - clients, projects, jobs, services, tasks tables with indexes
3. Linked to remote Supabase project (jfmsybitraznceytvdqw)
4. Successfully pushed all migrations to remote database
5. Generated TypeScript types from remote schema
6. Created domain.ts with Row, Insert, Update types and ActionResult type
7. TypeScript compiles without errors

### File List

**New Files:**
- `supabase/config.toml`
- `supabase/.gitignore`
- `supabase/migrations/20251230192109_001_departments.sql`
- `supabase/migrations/20251230192149_002_users.sql`
- `supabase/migrations/20251230192357_004_master_data.sql`
- `src/types/database.types.ts`
- `.env.local` (Supabase credentials - not committed to git)

**Modified Files:**
- `src/types/domain.ts`
- `package.json` (added supabase dev dependency)
- `package-lock.json` (auto-generated)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-31 | Created core database schema with 7 tables | Dev Agent (Claude Opus 4.5) |
| 2025-12-31 | Code review passed - File List updated | Code Review (Claude Opus 4.5) |
