-- Migration: 010_fix_soft_delete_rls
-- Fixes: RLS policy blocking soft delete UPDATE operation
--
-- Problem 1: The super_admin_all_entries policy (FOR ALL) has a WITH CHECK
-- that conflicts with staff trying to soft delete their own entries.
--
-- Problem 2 (REAL ISSUE): PostgreSQL RLS requires that after an UPDATE,
-- the new row must still pass SELECT policies ("new row visible" check).
-- The staff_select_own_entries policy from migration 009 has:
--   USING (user_id = auth.uid() AND deleted_at IS NULL)
-- So after setting deleted_at, the row becomes invisible and UPDATE fails.
--
-- Solution: Add a separate SELECT policy for staff that doesn't filter
-- on deleted_at. Multiple SELECT policies are ORed together, so the
-- stricter policy will still filter in normal queries, but updates will pass.

-- ============================================
-- FIX 1: REPLACE FOR ALL POLICY WITH SEPARATE POLICIES
-- ============================================

-- Drop the conflicting FOR ALL policy
DROP POLICY IF EXISTS "super_admin_all_entries" ON time_entries;

-- Super Admin: SELECT all entries (including deleted)
CREATE POLICY "super_admin_select_all_entries" ON time_entries
FOR SELECT TO authenticated
USING (public.get_user_role() = 'super_admin');

-- Super Admin: INSERT entries
CREATE POLICY "super_admin_insert_entries" ON time_entries
FOR INSERT TO authenticated
WITH CHECK (public.get_user_role() = 'super_admin');

-- Super Admin: UPDATE any entry
CREATE POLICY "super_admin_update_entries" ON time_entries
FOR UPDATE TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- Super Admin: DELETE any entry (hard delete if needed)
CREATE POLICY "super_admin_delete_entries" ON time_entries
FOR DELETE TO authenticated
USING (public.get_user_role() = 'super_admin');

-- ============================================
-- FIX 2: ADD SELECT POLICY FOR SOFT DELETE SUPPORT
-- ============================================

-- Staff: SELECT own entries (for update/delete purposes - no deleted_at filter)
-- This policy allows staff to see their own entries regardless of deleted_at
-- when PostgreSQL checks "new row visible" after UPDATE.
-- Multiple SELECT policies are ORed, so this + staff_select_own_entries together:
-- - Normal query: returns entries where user_id = auth.uid() AND deleted_at IS NULL
-- - After UPDATE: row passes because user_id = auth.uid() (this policy)
CREATE POLICY "staff_select_own_entries_for_mutation" ON time_entries
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "super_admin_select_all_entries" ON time_entries IS 'Super Admin can view all entries including deleted (no deleted_at filter)';
COMMENT ON POLICY "super_admin_insert_entries" ON time_entries IS 'Super Admin can insert entries for any user';
COMMENT ON POLICY "super_admin_update_entries" ON time_entries IS 'Super Admin can update any entry';
COMMENT ON POLICY "super_admin_delete_entries" ON time_entries IS 'Super Admin can hard delete any entry';
COMMENT ON POLICY "staff_select_own_entries_for_mutation" ON time_entries IS 'Staff can see their own entries for UPDATE/DELETE mutation visibility check';
