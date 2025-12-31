# Story 1.5: Seed Data for Development

Status: done

## Story

As a **developer**,
I want **realistic seed data populated in the database**,
So that **I can develop and test features with meaningful data**.

## Acceptance Criteria

1. **AC1: Departments Created**
   - Given all tables and RLS policies exist
   - When seed script is executed
   - Then 3 departments exist:
     - "Audio Production"
     - "Video Production"
     - "Localization"

2. **AC2: Clients Created**
   - Given departments exist
   - When seed script is executed
   - Then 10 clients exist with realistic Thai company names
   - And all clients have `active = true`

3. **AC3: Projects Created**
   - Given clients exist
   - When seed script is executed
   - Then 20 projects exist distributed across clients (2 per client average)
   - And all projects have `active = true`

4. **AC4: Jobs Created**
   - Given projects exist
   - When seed script is executed
   - Then 50 jobs exist distributed across projects
   - And each job has realistic `job_no` (e.g., "JOB-2024-001")
   - And each job has `so_no` (e.g., "SO-2024-001")
   - And all jobs have `active = true`

5. **AC5: Services Created**
   - Given tables exist
   - When seed script is executed
   - Then 8 services exist:
     - "Dubbing", "Subtitling", "QC", "Recording"
     - "Mixing", "Translation", "Voice Over", "ADR"
   - And all services have `active = true`

6. **AC6: Tasks Created**
   - Given tables exist
   - When seed script is executed
   - Then 10 task codes exist:
     - "Preparation", "Production", "Review", "Revision", "Delivery"
     - "Meeting", "Admin", "Training", "Research", "Support"
   - And all tasks have `active = true`

7. **AC7: Test Users Created**
   - Given auth.users and users tables exist
   - When seed script is executed
   - Then 4 test users exist:
     - staff@test.com (role: staff, department: Audio Production)
     - manager@test.com (role: manager, department: Audio Production)
     - admin@test.com (role: admin, department: Audio Production)
     - superadmin@test.com (role: super_admin, department: Audio Production)

8. **AC8: Manager Multi-Department Assignment**
   - Given test manager user exists
   - When seed script is executed
   - Then manager@test.com is assigned to manage 2 departments:
     - "Audio Production"
     - "Video Production"
   - And entries in `manager_departments` table exist

9. **AC9: Sample Time Entries Created**
   - Given test users and master data exist
   - When seed script is executed
   - Then 20 sample time_entries exist for staff@test.com
   - And entries span across different dates (last 14 days)
   - And entries use various jobs, services, and tasks
   - And entries have realistic durations (30-480 minutes)

10. **AC10: Seed Script Idempotency**
    - Given seed script has been executed once
    - When seed script is executed again
    - Then no duplicate records are created
    - And script uses upsert or checks before insert
    - And script completes without errors

## Tasks / Subtasks

- [x] **Task 1: Create Seed SQL File** (AC: all)
  - [x] 1.1 Create `supabase/seed.sql` file
  - [x] 1.2 Add header comments with usage instructions
  - [x] 1.3 Configure script for idempotent execution

- [x] **Task 2: Seed Departments** (AC: 1)
  - [x] 2.1 Create INSERT for 3 departments with fixed UUIDs
  - [x] 2.2 Use ON CONFLICT DO NOTHING or upsert

- [x] **Task 3: Seed Master Data** (AC: 2, 3, 4, 5, 6)
  - [x] 3.1 Create INSERT for 10 Thai company clients
  - [x] 3.2 Create INSERT for 20 projects (2 per client)
  - [x] 3.3 Create INSERT for 50 jobs with job_no/so_no patterns
  - [x] 3.4 Create INSERT for 8 services
  - [x] 3.5 Create INSERT for 10 tasks

- [x] **Task 4: Seed Test Users** (AC: 7)
  - [x] 4.1 Create auth.users entries for 4 test users
  - [x] 4.2 Create corresponding public.users entries
  - [x] 4.3 Use fixed UUIDs for consistent testing

- [x] **Task 5: Seed Manager Departments** (AC: 8)
  - [x] 5.1 Create manager_departments entries
  - [x] 5.2 Assign manager to Audio + Video departments

- [x] **Task 6: Seed Sample Time Entries** (AC: 9)
  - [x] 6.1 Create 20 time entries for staff user
  - [x] 6.2 Distribute across last 14 days
  - [x] 6.3 Vary jobs, services, tasks, and durations
  - [x] 6.4 Set department_id snapshot correctly

- [x] **Task 7: Update User Recent Combinations** (AC: 9)
  - [x] 7.1 Create 5 recent combination entries for staff
  - [x] 7.2 Based on the seeded time entries

- [x] **Task 8: Verify Seed Data** (AC: all)
  - [x] 8.1 Run `supabase db reset` to apply migrations + seed
  - [x] 8.2 Verify all counts in Supabase Studio
  - [x] 8.3 Test login with each test user
  - [x] 8.4 Run seed script twice to verify idempotency

## Dev Notes

### Fixed UUIDs for Testing

Use fixed UUIDs for all test data to ensure:
- Consistent references across test files
- Reproducible test environments
- Easy cleanup

```sql
-- Department UUIDs
'dept-audio-0001-0001-000000000001'  -- Audio Production
'dept-video-0002-0002-000000000002'  -- Video Production
'dept-local-0003-0003-000000000003'  -- Localization

-- User UUIDs
'user-staff-0001-0001-000000000001'  -- staff@test.com
'user-mangr-0002-0002-000000000002'  -- manager@test.com
'user-admin-0003-0003-000000000003'  -- admin@test.com
'user-super-0004-0004-000000000004'  -- superadmin@test.com
```

### Complete Seed SQL Structure

```sql
-- supabase/seed.sql
-- Timelog Development Seed Data
-- Usage: supabase db reset (applies migrations + seed)
-- This script is IDEMPOTENT - safe to run multiple times

-- ============================================
-- DEPARTMENTS
-- ============================================
INSERT INTO departments (id, name, active) VALUES
  ('dept-audio-0001-0001-000000000001', 'Audio Production', true),
  ('dept-video-0002-0002-000000000002', 'Video Production', true),
  ('dept-local-0003-0003-000000000003', 'Localization', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEST USERS (auth.users)
-- ============================================
-- Note: For local dev, create via Supabase Dashboard or auth API
-- These entries assume auth.users already exist

INSERT INTO users (id, email, display_name, role, department_id) VALUES
  ('user-staff-0001-0001-000000000001', 'staff@test.com', 'Test Staff', 'staff', 'dept-audio-0001-0001-000000000001'),
  ('user-mangr-0002-0002-000000000002', 'manager@test.com', 'Test Manager', 'manager', 'dept-audio-0001-0001-000000000001'),
  ('user-admin-0003-0003-000000000003', 'admin@test.com', 'Test Admin', 'admin', 'dept-audio-0001-0001-000000000001'),
  ('user-super-0004-0004-000000000004', 'superadmin@test.com', 'Test Super Admin', 'super_admin', 'dept-audio-0001-0001-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MANAGER DEPARTMENTS (Multi-department support)
-- ============================================
INSERT INTO manager_departments (id, manager_id, department_id) VALUES
  ('md-0001-0001-0001-000000000001', 'user-mangr-0002-0002-000000000002', 'dept-audio-0001-0001-000000000001'),
  ('md-0002-0002-0002-000000000002', 'user-mangr-0002-0002-000000000002', 'dept-video-0002-0002-000000000002')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CLIENTS (10 Thai companies)
-- ============================================
INSERT INTO clients (id, name, active) VALUES
  ('client-0001-0001-0001-000000000001', 'บริษัท สยามมีเดีย จำกัด', true),
  ('client-0002-0002-0002-000000000002', 'บริษัท ไทยเอ็นเตอร์เทนเมนต์ จำกัด', true),
  ('client-0003-0003-0003-000000000003', 'บริษัท กรุงเทพโปรดักชั่น จำกัด', true),
  ('client-0004-0004-0004-000000000004', 'บริษัท แอนิเมชั่นสตูดิโอ จำกัด', true),
  ('client-0005-0005-0005-000000000005', 'บริษัท วอยซ์โอเวอร์ไทย จำกัด', true),
  ('client-0006-0006-0006-000000000006', 'บริษัท สตูดิโอมิกซ์ จำกัด', true),
  ('client-0007-0007-0007-000000000007', 'บริษัท ซับไตเติ้ลโปร จำกัด', true),
  ('client-0008-0008-0008-000000000008', 'บริษัท ดับบิ้งมาสเตอร์ จำกัด', true),
  ('client-0009-0009-0009-000000000009', 'บริษัท แปลภาษาไทย จำกัด', true),
  ('client-0010-0010-0010-000000000010', 'บริษัท โพสต์โปรดักชั่น จำกัด', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SERVICES (8 types)
-- ============================================
INSERT INTO services (id, name, active) VALUES
  ('svc-0001-0001-0001-000000000001', 'Dubbing', true),
  ('svc-0002-0002-0002-000000000002', 'Subtitling', true),
  ('svc-0003-0003-0003-000000000003', 'QC', true),
  ('svc-0004-0004-0004-000000000004', 'Recording', true),
  ('svc-0005-0005-0005-000000000005', 'Mixing', true),
  ('svc-0006-0006-0006-000000000006', 'Translation', true),
  ('svc-0007-0007-0007-000000000007', 'Voice Over', true),
  ('svc-0008-0008-0008-000000000008', 'ADR', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TASKS (10 types)
-- ============================================
INSERT INTO tasks (id, name, active) VALUES
  ('task-0001-0001-0001-000000000001', 'Preparation', true),
  ('task-0002-0002-0002-000000000002', 'Production', true),
  ('task-0003-0003-0003-000000000003', 'Review', true),
  ('task-0004-0004-0004-000000000004', 'Revision', true),
  ('task-0005-0005-0005-000000000005', 'Delivery', true),
  ('task-0006-0006-0006-000000000006', 'Meeting', true),
  ('task-0007-0007-0007-000000000007', 'Admin', true),
  ('task-0008-0008-0008-000000000008', 'Training', true),
  ('task-0009-0009-0009-000000000009', 'Research', true),
  ('task-0010-0010-0010-000000000010', 'Support', true)
ON CONFLICT (id) DO NOTHING;
```

### Projects and Jobs Pattern

```sql
-- ============================================
-- PROJECTS (20 total, 2 per client)
-- ============================================
INSERT INTO projects (id, client_id, name, active) VALUES
  -- Client 1: สยามมีเดีย
  ('proj-0001-0001-0001-000000000001', 'client-0001-0001-0001-000000000001', 'Netflix Series Q1', true),
  ('proj-0002-0002-0002-000000000002', 'client-0001-0001-0001-000000000001', 'Disney+ Movie Dub', true),
  -- Client 2: ไทยเอ็นเตอร์เทนเมนต์
  ('proj-0003-0003-0003-000000000003', 'client-0002-0002-0002-000000000002', 'HBO Drama Series', true),
  ('proj-0004-0004-0004-000000000004', 'client-0002-0002-0002-000000000002', 'Amazon Prime Show', true),
  -- ... (continue for all 10 clients)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- JOBS (50 total, ~2-3 per project)
-- ============================================
INSERT INTO jobs (id, project_id, name, job_no, so_no, active) VALUES
  -- Project 1 jobs
  ('job-0001-0001-0001-000000000001', 'proj-0001-0001-0001-000000000001', 'Episode 1-5 Dubbing', 'JOB-2024-001', 'SO-2024-001', true),
  ('job-0002-0002-0002-000000000002', 'proj-0001-0001-0001-000000000001', 'Episode 6-10 Dubbing', 'JOB-2024-002', 'SO-2024-002', true),
  ('job-0003-0003-0003-000000000003', 'proj-0001-0001-0001-000000000001', 'Trailer Localization', 'JOB-2024-003', 'SO-2024-003', true),
  -- ... (continue for 50 jobs)
ON CONFLICT (id) DO NOTHING;
```

### Sample Time Entries Pattern

```sql
-- ============================================
-- TIME ENTRIES (20 for staff user, last 14 days)
-- ============================================
INSERT INTO time_entries (id, user_id, job_id, service_id, task_id, duration_minutes, entry_date, notes, department_id) VALUES
  -- Today
  ('entry-0001-0001-0001-000000000001', 'user-staff-0001-0001-000000000001', 'job-0001-0001-0001-000000000001', 'svc-0001-0001-0001-000000000001', 'task-0002-0002-0002-000000000002', 240, CURRENT_DATE, 'Dubbing session EP1-2', 'dept-audio-0001-0001-000000000001'),
  ('entry-0002-0002-0002-000000000002', 'user-staff-0001-0001-000000000001', 'job-0002-0002-0002-000000000002', 'svc-0003-0003-0003-000000000003', 'task-0003-0003-0003-000000000003', 120, CURRENT_DATE, 'QC review', 'dept-audio-0001-0001-000000000001'),
  -- Yesterday
  ('entry-0003-0003-0003-000000000003', 'user-staff-0001-0001-000000000001', 'job-0003-0003-0003-000000000003', 'svc-0002-0002-0002-000000000002', 'task-0001-0001-0001-000000000001', 180, CURRENT_DATE - INTERVAL '1 day', 'Subtitling prep', 'dept-audio-0001-0001-000000000001'),
  -- ... (continue for 20 entries across 14 days)
ON CONFLICT (id) DO NOTHING;
```

### Recent Combinations for Staff

```sql
-- ============================================
-- USER RECENT COMBINATIONS (5 for staff)
-- ============================================
INSERT INTO user_recent_combinations (id, user_id, client_id, project_id, job_id, service_id, task_id, last_used_at) VALUES
  ('recent-0001-0001-0001-000000000001', 'user-staff-0001-0001-000000000001', 'client-0001-0001-0001-000000000001', 'proj-0001-0001-0001-000000000001', 'job-0001-0001-0001-000000000001', 'svc-0001-0001-0001-000000000001', 'task-0002-0002-0002-000000000002', now()),
  ('recent-0002-0002-0002-000000000002', 'user-staff-0001-0001-000000000001', 'client-0001-0001-0001-000000000001', 'proj-0001-0001-0001-000000000001', 'job-0002-0002-0002-000000000002', 'svc-0003-0003-0003-000000000003', 'task-0003-0003-0003-000000000003', now() - INTERVAL '1 hour'),
  -- ... (5 total)
ON CONFLICT (id) DO NOTHING;
```

### Auth User Creation Note

For local development, test users need to be created in `auth.users` first:

```bash
# Option 1: Use Supabase Dashboard
# Go to Authentication > Users > Add User

# Option 2: Use SQL (requires service_role or direct DB access)
# The seed.sql assumes auth.users exist with matching UUIDs
```

### Alternative: TypeScript Seed Script

If SQL seed is insufficient, create `scripts/seed.ts`:

```typescript
// scripts/seed.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  // Create auth users first
  for (const user of testUsers) {
    await supabase.auth.admin.createUser({
      email: user.email,
      password: 'test123456',
      email_confirm: true,
      user_metadata: { display_name: user.displayName },
    });
  }

  // Then run SQL seed
  // ...
}
```

### Verification Queries

```sql
-- Verify counts
SELECT 'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'time_entries', COUNT(*) FROM time_entries
UNION ALL SELECT 'manager_departments', COUNT(*) FROM manager_departments
UNION ALL SELECT 'user_recent_combinations', COUNT(*) FROM user_recent_combinations;

-- Expected results:
-- departments: 3
-- users: 4
-- clients: 10
-- projects: 20
-- jobs: 50
-- services: 8
-- tasks: 10
-- time_entries: 20
-- manager_departments: 2
-- user_recent_combinations: 5
```

### Test User Credentials

| Email | Password | Role | Departments |
|-------|----------|------|-------------|
| staff@test.com | test123456 | staff | Audio Production |
| manager@test.com | test123456 | manager | Audio + Video |
| admin@test.com | test123456 | admin | Audio Production |
| superadmin@test.com | test123456 | super_admin | Audio Production |

### Project Structure

- Seed SQL: `supabase/seed.sql`
- TypeScript seed (optional): `scripts/seed.ts`
- Test fixtures reference: `test/fixtures/`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Test Users Setup]
- [Source: _bmad-output/planning-artifacts/architecture.md#E2E Test Users]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: _bmad-output/project-context.md#RLS Testing Requirements]

## Definition of Done

- [x] 3 departments created
- [x] 10 clients with Thai company names
- [x] 20 projects distributed across clients
- [x] 50 jobs with job_no and so_no patterns
- [x] 8 services created
- [x] 10 tasks created
- [x] 4 test users created (staff, manager, admin, super_admin)
- [x] Manager assigned to 2 departments
- [x] 20 sample time entries for staff
- [x] 5 recent combinations for staff
- [x] Seed script is idempotent (verified by running twice)
- [x] All test users can login
- [x] Verification queries return expected counts

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. สร้าง `supabase/seed.sql` สำหรับ local Supabase (Docker) - ใช้ ON CONFLICT DO NOTHING
2. สร้าง `scripts/seed.ts` สำหรับ remote Supabase - ใช้ Supabase Admin API สร้าง auth users
3. แก้ไขปัญหา UUID format (PostgreSQL ต้องการ hex digits 0-9, a-f เท่านั้น)
4. เพิ่ม `tsx` dependency และ `seed` script ใน package.json
5. ทดสอบ idempotency โดย run seed script 2 ครั้ง - ผ่านทุก count
6. Verified counts: departments=3, users=4, clients=10, projects=20, jobs=50, services=8, tasks=10, time_entries=20, manager_departments=2, recent_combinations=5

### File List

- `supabase/seed.sql` - SQL seed file for local Supabase
- `scripts/seed.ts` - TypeScript seed script with Admin API
- `package.json` - Added seed script and tsx dependency
- `package-lock.json` - Updated dependency lockfile

### Senior Developer Review (AI)

**Reviewed:** 2025-12-31
**Reviewer:** Claude Opus 4.5 (Adversarial Code Review)

**Issues Found & Fixed:**

1. ✅ **[HIGH] pgcrypto extension** - Added `CREATE EXTENSION IF NOT EXISTS pgcrypto;` to seed.sql:15
2. ✅ **[MEDIUM] File List incomplete** - Added package-lock.json to documentation
3. ⚠️ **[MEDIUM] No automated login test** - Noted for future story (not blocking)
4. ⚠️ **[MEDIUM] TypeScript types** - Seed script works without strict types (not blocking)
5. ⚠️ **[LOW] Data duplication** - Accepted tradeoff for SQL/TS compatibility
6. ⚠️ **[LOW] Files untracked** - Pending git add by developer

**Verdict:** APPROVED with minor notes
