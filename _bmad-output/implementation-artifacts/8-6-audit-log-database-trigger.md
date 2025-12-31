# Story 8.6: Audit Log Database Trigger

## Status: ready-for-dev

## Story

As a **system administrator**,
I want **all time entry changes logged automatically**,
So that **I can audit modifications for compliance**.

## Acceptance Criteria

### AC 1: INSERT Logging
- **Given** time_entries table
- **When** A row is INSERTed
- **Then** audit_logs records: table_name='time_entries', action='INSERT', new_data=row
- **And** user_id is captured from auth.uid()
- **And** timestamp is recorded

### AC 2: UPDATE Logging
- **Given** time_entries table
- **When** A row is UPDATEd
- **Then** audit_logs records: action='UPDATE', old_data=previous, new_data=updated
- **And** Both old and new values are stored as JSONB

### AC 3: DELETE Logging
- **Given** time_entries table
- **When** A row is DELETEd
- **Then** audit_logs records: action='DELETE', old_data=deleted_row
- **And** new_data is null

### AC 4: Automatic Trigger
- **Given** Audit log trigger
- **When** Implemented
- **Then** Trigger is a PostgreSQL function attached to time_entries
- **And** Runs automatically on all DML operations
- **And** Cannot be bypassed by application code

### AC 5: Audit Log Integrity
- **Given** Audit logs exist
- **When** Querying audit_logs table
- **Then** RLS prevents modification by non-super_admin
- **And** Only SELECT is allowed for admin roles
- **And** No UPDATE or DELETE allowed (immutable)

## Tasks

### Task 1: Create Audit Log Migration
**File:** `supabase/migrations/009_audit_log_trigger.sql`
- [ ] Create trigger function for audit logging
- [ ] Attach trigger to time_entries table
- [ ] Handle INSERT, UPDATE, DELETE operations

### Task 2: Implement Trigger Function
**File:** `supabase/migrations/009_audit_log_trigger.sql`
- [ ] Capture OLD and NEW row data
- [ ] Convert to JSONB format
- [ ] Get current user from auth.uid()
- [ ] Insert into audit_logs table

### Task 3: Update Audit Logs Table (if needed)
**File:** `supabase/migrations/009_audit_log_trigger.sql`
- [ ] Ensure audit_logs has required columns
- [ ] Add indexes for common queries
- [ ] Add constraint for action enum

### Task 4: Add RLS Policies for Audit Logs
**File:** `supabase/migrations/009_audit_log_trigger.sql`
- [ ] SELECT for admin and super_admin only
- [ ] No INSERT policy (trigger inserts directly)
- [ ] No UPDATE or DELETE policies (immutable)

### Task 5: Test INSERT Trigger
**File:** `test/e2e/audit/insert.test.ts`
- [ ] Create time entry
- [ ] Verify audit log created
- [ ] Check action='INSERT'
- [ ] Verify new_data contains entry

### Task 6: Test UPDATE Trigger
**File:** `test/e2e/audit/update.test.ts`
- [ ] Update time entry
- [ ] Verify audit log created
- [ ] Check old_data has previous values
- [ ] Check new_data has updated values

### Task 7: Test DELETE Trigger
**File:** `test/e2e/audit/delete.test.ts`
- [ ] Delete time entry
- [ ] Verify audit log created
- [ ] Check action='DELETE'
- [ ] Verify old_data contains deleted entry

### Task 8: Create Audit Log Query Helper
**File:** `src/services/audit.ts`
- [ ] getAuditLogsForEntry(entryId)
- [ ] getAuditLogsByUser(userId)
- [ ] getAuditLogsByDateRange(start, end)

### Task 9: Regenerate Database Types
**File:** `src/types/database.types.ts`
- [ ] Run npx supabase gen types typescript
- [ ] Verify audit_logs type updated

### Task 10: Document Audit System
**File:** `docs/audit-system.md` (optional)
- [ ] Document trigger behavior
- [ ] Document RLS policies
- [ ] Document query patterns

## Dev Notes

### Architecture Pattern
- PostgreSQL trigger function (PL/pgSQL)
- Automatic execution on DML
- JSONB storage for flexibility
- Immutable audit trail

### Migration: Audit Log Trigger
```sql
-- supabase/migrations/009_audit_log_trigger.sql

-- Ensure audit_logs table has correct structure
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS old_data JSONB,
ADD COLUMN IF NOT EXISTS new_data JSONB;

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record
ON audit_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
ON audit_logs(user_id, created_at);

-- Create the audit trigger function
CREATE OR REPLACE FUNCTION audit_time_entries()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id,
      created_at
    ) VALUES (
      'time_entries',
      NEW.id,
      'INSERT',
      NULL,
      to_jsonb(NEW),
      auth.uid(),
      NOW()
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id,
      created_at
    ) VALUES (
      'time_entries',
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      NOW()
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id,
      created_at
    ) VALUES (
      'time_entries',
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      NULL,
      auth.uid(),
      NOW()
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to time_entries table
DROP TRIGGER IF EXISTS audit_time_entries_trigger ON time_entries;

CREATE TRIGGER audit_time_entries_trigger
AFTER INSERT OR UPDATE OR DELETE ON time_entries
FOR EACH ROW EXECUTE FUNCTION audit_time_entries();

-- RLS Policies for audit_logs (immutable)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Super admin can view all audit logs" ON audit_logs;

-- Only admin and super_admin can SELECT
CREATE POLICY "Admin can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- No INSERT policy needed (trigger uses SECURITY DEFINER)
-- No UPDATE or DELETE policies (immutable audit trail)
```

### Audit Service
```typescript
// src/services/audit.ts
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database.types';

type AuditLog = Tables<'audit_logs'>;

export async function getAuditLogsForEntry(
  entryId: string
): Promise<AuditLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('table_name', 'time_entries')
    .eq('record_id', entryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAuditLogsByUser(
  userId: string,
  limit = 50
): Promise<AuditLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getAuditLogsByDateRange(
  startDate: string,
  endDate: string
): Promise<AuditLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
```

### Testing Pattern
```typescript
// test/e2e/audit/insert.test.ts
import { describe, it, expect } from 'vitest';
import { createUserClient } from '@/test/helpers';

describe('Audit Log - INSERT', () => {
  it('should create audit log on time entry insert', async () => {
    const client = await createUserClient('staff');

    // Create time entry
    const { data: entry } = await client
      .from('time_entries')
      .insert({
        job_id: 'test-job-id',
        service_id: 'test-service-id',
        task_id: 'test-task-id',
        duration_minutes: 60,
        work_date: '2024-01-15',
      })
      .select()
      .single();

    // Query as admin
    const adminClient = await createUserClient('admin');
    const { data: logs } = await adminClient
      .from('audit_logs')
      .select('*')
      .eq('record_id', entry.id)
      .eq('action', 'INSERT');

    expect(logs).toHaveLength(1);
    expect(logs[0].new_data).toMatchObject({
      duration_minutes: 60,
    });
  });
});
```

### Existing Audit Logs Table
The audit_logs table was created in earlier migrations:
```sql
-- From migration 001 or 002
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Component Dependencies
- No frontend components needed
- Pure database-level implementation
- Service layer for querying

### Import Convention
```typescript
import {
  getAuditLogsForEntry,
  getAuditLogsByUser,
  getAuditLogsByDateRange
} from '@/services/audit';
```

### Security Notes
- SECURITY DEFINER allows trigger to bypass RLS
- Audit logs are immutable (no UPDATE/DELETE policies)
- Only admin roles can view audit logs
- User ID captured from auth.uid()

### Testing Notes
- Test requires actual database operations
- Use service role for setup, user role for operations
- Verify audit log contains correct data structure

## Definition of Done

- [ ] Migration created for audit trigger
- [ ] Trigger function handles INSERT/UPDATE/DELETE
- [ ] Trigger attached to time_entries table
- [ ] old_data and new_data stored as JSONB
- [ ] user_id captured from auth.uid()
- [ ] RLS policies prevent modification
- [ ] Only admin/super_admin can SELECT
- [ ] Audit service queries created
- [ ] Tests verify all operations logged
- [ ] Database types regenerated
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
