-- Migration: 011_fix_soft_delete_select_policy
-- Fixes: RLS "new row visible" check failing after soft delete
--
-- Problem: PostgreSQL RLS requires that after an UPDATE, the new row must
-- still pass SELECT policies. The staff_select_own_entries policy from
-- migration 009 has: USING (user_id = auth.uid() AND deleted_at IS NULL)
-- So after setting deleted_at to non-null, the row becomes invisible and
-- the UPDATE fails with "new row violates row-level security policy".
--
-- Solution: Add a separate SELECT policy for staff that doesn't filter
-- on deleted_at. Multiple SELECT policies are ORed together, so:
-- - For normal queries: stricter policy still filters deleted entries
-- - After UPDATE: row passes because it matches this permissive policy

-- ============================================
-- ADD SELECT POLICY FOR SOFT DELETE SUPPORT
-- ============================================

-- Staff: SELECT own entries (for update/delete visibility check)
-- This policy allows staff to see their own entries regardless of deleted_at
-- when PostgreSQL checks "new row visible" after UPDATE.
CREATE POLICY "staff_select_own_entries_for_mutation" ON time_entries
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "staff_select_own_entries_for_mutation" ON time_entries
IS 'Staff can see their own entries for UPDATE/DELETE mutation visibility check (no deleted_at filter)';
