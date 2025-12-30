# Story 1.3: Database Schema - Time Entry & Supporting Tables

Status: ready-for-dev

## Story

As a **developer**,
I want **time entry and supporting tables created**,
So that **time tracking functionality can be implemented**.

## Acceptance Criteria

1. **AC1: Time Entries Table**
   - Given core tables from Story 1.2 exist
   - When migrations are run
   - Then `time_entries` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
     - `job_id` UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT
     - `service_id` UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT
     - `task_id` UUID REFERENCES tasks(id) ON DELETE SET NULL (nullable)
     - `duration_minutes` INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440)
     - `entry_date` DATE NOT NULL
     - `notes` TEXT
     - `department_id` UUID NOT NULL REFERENCES departments(id) (snapshot at creation)
     - `created_at` TIMESTAMPTZ DEFAULT now()
     - `updated_at` TIMESTAMPTZ DEFAULT now()

2. **AC2: Manager Departments Junction Table**
   - Given users and departments tables exist
   - When migrations are run
   - Then `manager_departments` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `manager_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
     - `department_id` UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE
     - `created_at` TIMESTAMPTZ DEFAULT now()
     - UNIQUE constraint on (manager_id, department_id)

3. **AC3: User Recent Combinations Table**
   - Given core tables exist
   - When migrations are run
   - Then `user_recent_combinations` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
     - `client_id` UUID NOT NULL REFERENCES clients(id)
     - `project_id` UUID NOT NULL REFERENCES projects(id)
     - `job_id` UUID NOT NULL REFERENCES jobs(id)
     - `service_id` UUID NOT NULL REFERENCES services(id)
     - `task_id` UUID REFERENCES tasks(id) (nullable)
     - `last_used_at` TIMESTAMPTZ DEFAULT now()
     - UNIQUE constraint on (user_id, client_id, project_id, job_id, service_id, task_id)

4. **AC4: Audit Logs Table**
   - Given Supabase project is connected
   - When migrations are run
   - Then `audit_logs` table exists with:
     - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
     - `table_name` TEXT NOT NULL
     - `record_id` UUID NOT NULL
     - `action` TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
     - `old_data` JSONB
     - `new_data` JSONB
     - `user_id` UUID REFERENCES auth.users(id)
     - `created_at` TIMESTAMPTZ DEFAULT now()

5. **AC5: Performance Indexes**
   - Given all tables are created
   - When reviewing indexes
   - Then these indexes exist:
     - `idx_time_entries_user_date` on time_entries(user_id, entry_date)
     - `idx_time_entries_dept_date` on time_entries(department_id, entry_date)
     - `idx_manager_departments_manager` on manager_departments(manager_id)
     - `idx_recent_user` on user_recent_combinations(user_id)
     - `idx_audit_logs_table_record` on audit_logs(table_name, record_id)

6. **AC6: Updated_at Trigger**
   - Given time_entries table exists
   - When a row is updated
   - Then `updated_at` is automatically set to now()

## Tasks / Subtasks

- [ ] **Task 1: Create Manager Departments Migration** (AC: 2)
  - [ ] 1.1 Run `supabase migration new 003_manager_departments`
  - [ ] 1.2 Add manager_departments table DDL
  - [ ] 1.3 Add UNIQUE constraint
  - [ ] 1.4 Add index `idx_manager_departments_manager`
  - [ ] 1.5 Apply migration and verify

- [ ] **Task 2: Create Time Entries Migration** (AC: 1, 6)
  - [ ] 2.1 Run `supabase migration new 005_time_entries`
  - [ ] 2.2 Add time_entries table DDL with all foreign keys
  - [ ] 2.3 Add CHECK constraint for duration_minutes
  - [ ] 2.4 Add indexes: idx_time_entries_user_date, idx_time_entries_dept_date
  - [ ] 2.5 Create updated_at trigger function
  - [ ] 2.6 Apply trigger to time_entries
  - [ ] 2.7 Apply migration and verify

- [ ] **Task 3: Create Recent Combinations Migration** (AC: 3)
  - [ ] 3.1 Run `supabase migration new 006_recent_combinations`
  - [ ] 3.2 Add user_recent_combinations table DDL
  - [ ] 3.3 Add UNIQUE constraint on combination
  - [ ] 3.4 Add index `idx_recent_user`
  - [ ] 3.5 Apply migration and verify

- [ ] **Task 4: Create Audit Logs Migration** (AC: 4)
  - [ ] 4.1 Run `supabase migration new 007_audit_logs`
  - [ ] 4.2 Add audit_logs table DDL
  - [ ] 4.3 Add CHECK constraint for action
  - [ ] 4.4 Add index `idx_audit_logs_table_record`
  - [ ] 4.5 Apply migration and verify

- [ ] **Task 5: Regenerate TypeScript Types** (AC: all)
  - [ ] 5.1 Run `supabase gen types typescript --local > src/types/database.types.ts`
  - [ ] 5.2 Update `src/types/domain.ts` with new type aliases
  - [ ] 5.3 Verify all new tables have types

- [ ] **Task 6: Verify Schema Integrity** (AC: all)
  - [ ] 6.1 Test inserting a time_entry with valid job_id, service_id
  - [ ] 6.2 Test duration_minutes CHECK constraint (reject <= 0, > 1440)
  - [ ] 6.3 Test manager_departments UNIQUE constraint
  - [ ] 6.4 Test user_recent_combinations UNIQUE constraint
  - [ ] 6.5 Verify updated_at trigger fires on UPDATE
  - [ ] 6.6 Test cascade behavior on user deletion

## Dev Notes

### Migration File Sequence

```
supabase/migrations/
├── 001_departments.sql           # (Story 1.2)
├── 002_users.sql                 # (Story 1.2)
├── 003_manager_departments.sql   # THIS STORY - Multi-department manager support
├── 004_master_data.sql           # (Story 1.2)
├── 005_time_entries.sql          # THIS STORY - Core time tracking
├── 006_recent_combinations.sql   # THIS STORY - Quick entry optimization
├── 007_audit_logs.sql            # THIS STORY - Audit trail
└── 008_rls_policies.sql          # (Story 1.4)
```

### Complete SQL for Manager Departments

```sql
-- supabase/migrations/003_manager_departments.sql

-- Junction table for managers overseeing multiple departments
-- Critical: Manager can oversee 2 departments (project requirement)
CREATE TABLE manager_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manager_id, department_id)
);

-- Index for efficient lookup of manager's departments
CREATE INDEX idx_manager_departments_manager ON manager_departments(manager_id);

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE manager_departments ENABLE ROW LEVEL SECURITY;
```

### Complete SQL for Time Entries

```sql
-- supabase/migrations/005_time_entries.sql

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  entry_date DATE NOT NULL,
  notes TEXT,
  department_id UUID NOT NULL REFERENCES departments(id),  -- Snapshot at creation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes for common queries
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, entry_date);
CREATE INDEX idx_time_entries_dept_date ON time_entries(department_id, entry_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to time_entries
CREATE TRIGGER time_entries_updated_at
BEFORE UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
```

### Complete SQL for Recent Combinations

```sql
-- supabase/migrations/006_recent_combinations.sql

-- Store last 5 used combinations for quick 1-tap entry
CREATE TABLE user_recent_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, client_id, project_id, job_id, service_id, COALESCE(task_id, '00000000-0000-0000-0000-000000000000'))
);

-- Index for efficient lookup of user's recent combinations
CREATE INDEX idx_recent_user ON user_recent_combinations(user_id, last_used_at DESC);

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE user_recent_combinations ENABLE ROW LEVEL SECURITY;
```

### Complete SQL for Audit Logs

```sql
-- supabase/migrations/007_audit_logs.sql

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient lookup by table and record
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Note: Audit trigger will be added in Story 8.6 (Audit Log Database Trigger)
-- This story only creates the table structure

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Entity Relationship Summary

```
departments (1) ←──── (N) manager_departments (N) ────→ (1) users
    │                                                      │
    │ (snapshot)                                           │
    ↓                                                      │
time_entries (N) ────→ (1) users ←─────────────────────────┘
    │
    ├──→ (1) jobs ←── projects ←── clients
    ├──→ (1) services
    └──→ (1) tasks (optional)

user_recent_combinations (N) ────→ (1) users
    │
    ├──→ (1) clients
    ├──→ (1) projects
    ├──→ (1) jobs
    ├──→ (1) services
    └──→ (1) tasks (optional)
```

### Critical: Department Snapshot Pattern

The `time_entries.department_id` captures the user's department at entry creation time. This means:
- Historical entries stay visible to the manager who managed that department at creation time
- User department changes don't affect historical entry visibility
- Managers see entries based on the entry's snapshot department, not user's current department

### TypeScript Domain Types Update

Add to `src/types/domain.ts`:

```typescript
import type { Database } from './database.types';

// Existing types from Story 1.2...

// New types for Story 1.3
export type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
export type ManagerDepartment = Database['public']['Tables']['manager_departments']['Row'];
export type UserRecentCombination = Database['public']['Tables']['user_recent_combinations']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// Insert types for mutations
export type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert'];
export type TimeEntryUpdate = Database['public']['Tables']['time_entries']['Update'];

// Audit action type
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';
```

### Constraints Summary

| Table | Constraint | Type | Purpose |
|-------|------------|------|---------|
| time_entries | duration_minutes | CHECK | 1-1440 minutes (max 24h) |
| time_entries | job_id | FK RESTRICT | Prevent deletion of used jobs |
| time_entries | service_id | FK RESTRICT | Prevent deletion of used services |
| time_entries | task_id | FK SET NULL | Allow task deletion, preserve entry |
| manager_departments | (manager_id, department_id) | UNIQUE | Prevent duplicate assignments |
| user_recent_combinations | composite | UNIQUE | One record per combination per user |
| audit_logs | action | CHECK | Only INSERT/UPDATE/DELETE |

### Project Structure Notes

- Migrations: `supabase/migrations/`
- Generated types: `src/types/database.types.ts`
- Domain types: `src/types/domain.ts`
- All paths use `@/` import aliases per project-context.md

### RLS Considerations (Story 1.4)

These tables will require specific RLS policies:
- `time_entries`: Staff own entries, Managers see managed departments, Admin sees all
- `manager_departments`: Readable by all, writable by super_admin only
- `user_recent_combinations`: Each user sees only their own
- `audit_logs`: Readable by admin/super_admin only

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Database Schema for Multi-Department Managers]
- [Source: _bmad-output/planning-artifacts/architecture.md#Audit Logging]
- [Source: _bmad-output/planning-artifacts/architecture.md#Database Schema Mapping]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/project-context.md#Multi-Department Manager Support]

## Definition of Done

- [ ] All 4 tables created successfully (time_entries, manager_departments, user_recent_combinations, audit_logs)
- [ ] All foreign key constraints working with correct ON DELETE behavior
- [ ] All 5 indexes created
- [ ] CHECK constraints validated (duration_minutes, action)
- [ ] UNIQUE constraints validated
- [ ] updated_at trigger working on time_entries
- [ ] TypeScript types regenerated and verified
- [ ] `supabase db push` completes without errors
- [ ] Tables visible in Supabase Studio

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
