# Story 8.6: Audit Log Database Trigger

## Status: done

## Story

As a **system administrator**,
I want **all time entry changes logged automatically**,
So that **I can audit modifications for compliance**.

## Acceptance Criteria

### AC 1: INSERT Logging
- **Given** time_entries table
- **When** A row is INSERTed
- **Then** audit_logs records: table_name='time_entries', action='INSERT', new_data=row
- **And** user_id is captured from entry user_id
- **And** timestamp is recorded

### AC 2: UPDATE Logging
- **Given** time_entries table
- **When** A row is UPDATEd
- **Then** audit_logs records: action='UPDATE', old_data=previous, new_data=updated
- **And** Both old and new values are stored as JSONB

### AC 3: Soft DELETE Logging
- **Given** time_entries uses soft delete pattern
- **When** deleted_at changes from NULL to a timestamp
- **Then** audit_logs records: action='DELETE', old_data=deleted_row
- **And** new_data is null (indicates deletion)

### AC 4: Automatic Trigger
- **Given** Audit log trigger
- **When** Implemented
- **Then** Trigger is a PostgreSQL function attached to time_entries
- **And** Runs automatically on INSERT and UPDATE operations
- **And** Uses SECURITY DEFINER to bypass RLS
- **And** Cannot be bypassed by application code

### AC 5: Audit Log Access Control
- **Given** Audit logs exist
- **When** Querying audit_logs table
- **Then** Admin and Super Admin can SELECT audit logs
- **And** Staff and Manager cannot access audit_logs
- **And** No UPDATE or DELETE allowed (immutable audit trail)

## Implementation Status

### Completed
- `audit_logs` table created in migration 007_audit_logs.sql
- `log_time_entry_changes()` trigger function in migration 009_add_soft_delete.sql
- INSERT policy `trigger_insert_audit_logs` in migration 013_audit_logs_insert_policy.sql
- SELECT policy `admin_read_audit_logs` in migration 008_rls_policies.sql
- Trigger handles INSERT, UPDATE, and soft DELETE detection
- Uses SECURITY DEFINER for RLS bypass
- Audit service created (`src/services/audit.ts`)
- Unit tests created (16 tests)
- E2E tests created (7 tests)

## Tasks

### Task 1: Create Audit Logs Table
**Status:** COMPLETE
**File:** `supabase/migrations/20251230194508_007_audit_logs.sql`
- [x] Table with: id, table_name, record_id, action, old_data, new_data, user_id, created_at
- [x] Action CHECK constraint: 'INSERT', 'UPDATE', 'DELETE'
- [x] Index on (table_name, record_id)
- [x] RLS enabled

### Task 2: Create Audit Trigger Function
**Status:** COMPLETE
**File:** `supabase/migrations/20260102021926_009_add_soft_delete.sql`
- [x] `log_time_entry_changes()` function
- [x] Handle INSERT: record new_data
- [x] Handle UPDATE: record old_data and new_data
- [x] Handle soft DELETE: detect deleted_at change, record as DELETE
- [x] Uses SECURITY DEFINER
- [x] Attach trigger to time_entries (AFTER INSERT OR UPDATE)

### Task 3: Add INSERT Policy for Trigger
**Status:** COMPLETE
**File:** `supabase/migrations/20260102063100_013_audit_logs_insert_policy.sql`
- [x] `trigger_insert_audit_logs` policy
- [x] Allows INSERT via trigger

### Task 4: Add RLS SELECT Policy for Admin
**Status:** COMPLETE (already in migration 008_rls_policies.sql)
**File:** `supabase/migrations/20251230200544_008_rls_policies.sql`
- [x] Create SELECT policy for admin and super_admin roles
- [x] Use get_user_role() function for role check
- [x] Staff and Manager cannot SELECT

### Task 5: Create Audit Query Service
**Status:** COMPLETE
**File:** `src/services/audit.ts`
- [x] `getAuditLogsForEntry(entryId: string)`
- [x] `getAuditLogsByUser(userId: string, limit?: number)`
- [x] `getAuditLogsByDateRange(startDate: string, endDate: string)`
- [x] Return ActionResult pattern

### Task 6: Unit Tests for Audit Service
**Status:** COMPLETE
**File:** `src/services/audit.test.ts`
- [x] Test getAuditLogsForEntry returns logs
- [x] Test getAuditLogsByUser with limit
- [x] Test getAuditLogsByDateRange
- [x] Test RLS prevents staff access

### Task 7: E2E Tests for Audit Trigger
**Status:** COMPLETE
**File:** `test/e2e/audit/audit-trigger.test.ts`
- [x] Test INSERT creates audit log
- [x] Test UPDATE creates audit log with old/new data
- [x] Test soft DELETE (deleted_at set) creates DELETE audit log
- [x] Test admin can view audit logs
- [x] Test super admin can view audit logs
- [x] Test manager cannot view audit logs
- [x] Test staff cannot view audit logs

## Dev Notes

### Architecture Pattern
- PostgreSQL trigger function (PL/pgSQL)
- Automatic execution on DML
- JSONB storage for row data
- Immutable audit trail (no UPDATE/DELETE on audit_logs)

### Existing Trigger Implementation
```sql
-- From migration 009_add_soft_delete.sql
CREATE OR REPLACE FUNCTION log_time_entry_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
    VALUES ('time_entries', NEW.id, 'INSERT', row_to_json(NEW), NEW.user_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if this is a soft delete (deleted_at changed from NULL to a value)
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      -- Record as DELETE action with old_data for audit purposes
      INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
      VALUES ('time_entries', OLD.id, 'DELETE', row_to_json(OLD), OLD.user_id);
    ELSE
      -- Regular update
      INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
      VALUES ('time_entries', OLD.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), OLD.user_id);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to time_entries
CREATE TRIGGER time_entries_audit
AFTER INSERT OR UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION log_time_entry_changes();
```

### Migration: SELECT Policy for Admin
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_014_audit_logs_select_policy.sql

-- Migration: 014_audit_logs_select_policy
-- Story 8.6: Audit Log Database Trigger
-- AC 5: Audit Log Access Control

-- Admin and Super Admin can SELECT audit logs
CREATE POLICY "admin_select_audit_logs" ON audit_logs
FOR SELECT TO authenticated
USING (
  public.get_user_role() IN ('admin', 'super_admin')
);

COMMENT ON POLICY "admin_select_audit_logs" ON audit_logs
IS 'Only admin and super_admin roles can view audit logs';
```

### Audit Service
```typescript
// src/services/audit.ts
import { createClient } from '@/lib/supabase/server';
import type { AuditLog, ActionResult } from '@/types/domain';

export async function getAuditLogsForEntry(entryId: string): Promise<ActionResult<AuditLog[]>>
export async function getAuditLogsByUser(userId: string, limit = 50): Promise<ActionResult<AuditLog[]>>
export async function getAuditLogsByDateRange(startDate: string, endDate: string, limit = 100): Promise<ActionResult<AuditLog[]>>
```

### Testing Notes
- Use `loginAsAdmin` for E2E tests that verify admin access
- Use `loginAsStaff` to verify staff cannot access audit logs
- Trigger tests require creating/updating time entries and checking audit_logs

### Component Dependencies
- No frontend components needed for this story
- Pure database-level implementation + query service

### Import Convention
```typescript
import {
  getAuditLogsForEntry,
  getAuditLogsByUser,
  getAuditLogsByDateRange
} from '@/services/audit';
```

### Security Notes
- SECURITY DEFINER allows trigger to bypass RLS for INSERT
- Audit logs are immutable (no UPDATE/DELETE policies)
- Only admin/super_admin can SELECT
- Uses get_user_role() function for consistent role checking

## Definition of Done

- [x] audit_logs table created with correct structure
- [x] Trigger function handles INSERT/UPDATE/soft DELETE
- [x] Trigger attached to time_entries table
- [x] old_data and new_data stored as JSONB
- [x] user_id captured from entry
- [x] INSERT policy allows trigger to write
- [x] SELECT policy for admin/super_admin (in migration 008_rls_policies.sql)
- [x] Staff/Manager cannot SELECT audit logs (verified by E2E tests)
- [x] Audit service created with ActionResult pattern
- [x] Unit tests for service pass (16 tests)
- [x] E2E tests verify trigger behavior (7 tests)
- [x] No TypeScript errors
- [x] All imports use @/ aliases

## File List

### Existing Files (Already Implemented)
- `supabase/migrations/20251230194508_007_audit_logs.sql` - Table creation
- `supabase/migrations/20251230200544_008_rls_policies.sql` - SELECT policy for admin/super_admin
- `supabase/migrations/20260102021926_009_add_soft_delete.sql` - Trigger function
- `supabase/migrations/20260102063100_013_audit_logs_insert_policy.sql` - INSERT policy

### New Files (Created)
- `src/services/audit.ts` - Audit query service
- `src/services/audit.test.ts` - Unit tests (16 tests)
- `test/e2e/audit/audit-trigger.test.ts` - E2E tests (7 tests)

## Change Log

| Date | Change |
|------|--------|
| 2026-01-05 | Updated status to partially-implemented, documented existing implementation |
| 2026-01-05 | Verified all implementation complete: audit service, unit tests, E2E tests all passing. Status updated to review |
| 2026-01-05 | Code review fixes: Added manager/super_admin E2E tests (AC 5), limit param to getAuditLogsByDateRange, updated docs |

## Dev Agent Record

### Implementation Plan
- Verified existing implementation against all Acceptance Criteria
- Confirmed RLS SELECT policy already existed in migration 008
- Ran all unit and E2E tests to verify functionality

### Completion Notes
- All 7 tasks completed and verified
- Unit tests: 16 tests passing (audit service)
- E2E tests: 7 tests passing (trigger behavior + RLS access control)
- TypeScript compilation: clean
- ESLint: clean

### Code Review Fixes (2026-01-05)
**Issues Found:** 1 High, 4 Medium, 3 Low

**Fixes Applied:**
- **[H1]** Added manager role E2E test for AC 5 compliance
- **[M2]** Updated story Dev Notes with correct import pattern
- **[M3]** Replaced "Remaining Work" section with "Completed" status
- **[M4]** Added `limit` parameter to `getAuditLogsByDateRange()` (default: 100)
- **[L1]** Strengthened admin E2E assertion from `toBeGreaterThanOrEqual(0)` to `toBeGreaterThan(0)`
- **[L3]** Added super admin E2E test for complete AC 5 coverage
