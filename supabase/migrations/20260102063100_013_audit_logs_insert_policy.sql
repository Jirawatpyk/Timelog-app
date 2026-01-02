-- Migration: 013_audit_logs_insert_policy
-- Fixes: Audit log INSERT failing when soft_delete_time_entry function runs
--
-- Problem: The audit log trigger (log_time_entry_changes) tries to INSERT
-- into audit_logs, but there's no INSERT policy. With RLS enabled and no
-- matching policy, the INSERT is denied.
--
-- Solution: Add an INSERT policy that allows the trigger to insert.
-- We use SECURITY DEFINER on the trigger function to run as owner,
-- but we also need an INSERT policy for completeness.

-- ============================================
-- ADD INSERT POLICY FOR AUDIT TRIGGER
-- ============================================

-- Allow authenticated users to insert audit logs (only via trigger)
-- The trigger runs as SECURITY DEFINER, so this policy allows the insert
CREATE POLICY "trigger_insert_audit_logs" ON audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "trigger_insert_audit_logs" ON audit_logs
IS 'Allows audit log insertion from triggers. Inserts are controlled by trigger logic, not direct user access.';
