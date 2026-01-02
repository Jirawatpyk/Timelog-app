-- Migration: 010_fix_soft_delete_rls
-- Fixes: RLS policy blocking soft delete UPDATE operation
--
-- Problem: The super_admin_all_entries policy (FOR ALL) has a WITH CHECK
-- that conflicts with staff trying to soft delete their own entries.
-- PostgreSQL evaluates WITH CHECK from applicable policies, and FOR ALL
-- policies apply to UPDATE operations.
--
-- Solution: Replace super_admin_all_entries FOR ALL with separate policies
-- for each operation, so WITH CHECK doesn't conflict with staff updates.

-- ============================================
-- FIX: REPLACE FOR ALL POLICY WITH SEPARATE POLICIES
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
-- COMMENTS
-- ============================================

COMMENT ON POLICY "super_admin_select_all_entries" ON time_entries IS 'Super Admin can view all entries including deleted (no deleted_at filter)';
COMMENT ON POLICY "super_admin_insert_entries" ON time_entries IS 'Super Admin can insert entries for any user';
COMMENT ON POLICY "super_admin_update_entries" ON time_entries IS 'Super Admin can update any entry';
COMMENT ON POLICY "super_admin_delete_entries" ON time_entries IS 'Super Admin can hard delete any entry';
