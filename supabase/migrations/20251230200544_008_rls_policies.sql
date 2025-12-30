-- Migration: 008_rls_policies
-- Story: 1.4 RLS Policies for All Roles
-- AC: 1-7 - Complete RLS policy configuration for all roles

-- ============================================
-- HELPER FUNCTION
-- ============================================

-- Get current user's role from the users table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the currently authenticated user';

-- ============================================
-- TIME ENTRIES POLICIES (AC: 1, 2, 3, 4)
-- ============================================

-- Staff: SELECT own entries only (AC: 1)
CREATE POLICY "staff_select_own_entries" ON time_entries
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Staff: INSERT own entries only (AC: 1)
CREATE POLICY "staff_insert_own_entries" ON time_entries
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Staff: UPDATE own entries only (AC: 1)
CREATE POLICY "staff_update_own_entries" ON time_entries
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Staff: DELETE own entries only (AC: 1)
CREATE POLICY "staff_delete_own_entries" ON time_entries
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Manager: SELECT entries from managed departments (AC: 2)
CREATE POLICY "manager_select_dept_entries" ON time_entries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM manager_departments md
    WHERE md.manager_id = auth.uid()
    AND md.department_id = time_entries.department_id
  )
  AND public.get_user_role() = 'manager'
);

-- Admin: SELECT all entries (AC: 3)
CREATE POLICY "admin_select_all_entries" ON time_entries
FOR SELECT TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'));

-- Super Admin: Full access to all entries (AC: 4)
CREATE POLICY "super_admin_all_entries" ON time_entries
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- ============================================
-- MASTER DATA POLICIES (AC: 5, 6)
-- ============================================

-- CLIENTS
-- Read: Active only for regular users, all for admin+ (AC: 5)
CREATE POLICY "authenticated_read_active_clients" ON clients
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

-- Write: Admin and Super Admin only (AC: 6)
CREATE POLICY "admin_manage_clients" ON clients
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- PROJECTS
-- Read: Active only for regular users, all for admin+ (AC: 5)
CREATE POLICY "authenticated_read_active_projects" ON projects
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

-- Write: Admin and Super Admin only (AC: 6)
CREATE POLICY "admin_manage_projects" ON projects
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- JOBS
-- Read: Active only for regular users, all for admin+ (AC: 5)
CREATE POLICY "authenticated_read_active_jobs" ON jobs
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

-- Write: Admin and Super Admin only (AC: 6)
CREATE POLICY "admin_manage_jobs" ON jobs
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- SERVICES
-- Read: Active only for regular users, all for admin+ (AC: 5)
CREATE POLICY "authenticated_read_active_services" ON services
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

-- Write: Admin and Super Admin only (AC: 6)
CREATE POLICY "admin_manage_services" ON services
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- TASKS
-- Read: Active only for regular users, all for admin+ (AC: 5)
CREATE POLICY "authenticated_read_active_tasks" ON tasks
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

-- Write: Admin and Super Admin only (AC: 6)
CREATE POLICY "admin_manage_tasks" ON tasks
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- SUPPORTING TABLES POLICIES (AC: 4, 7)
-- ============================================

-- DEPARTMENTS
-- Read: All authenticated users can read (AC: 7)
CREATE POLICY "authenticated_read_departments" ON departments
FOR SELECT TO authenticated
USING (true);

-- Write: Super Admin only
CREATE POLICY "super_admin_manage_departments" ON departments
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- USERS
-- Read: Own profile or admin+ can read all (AC: 7)
CREATE POLICY "users_read_own_profile" ON users
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.get_user_role() IN ('admin', 'super_admin'));

-- Write: Admin and Super Admin only
CREATE POLICY "admin_manage_users" ON users
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- MANAGER_DEPARTMENTS
-- Read: All authenticated users can read (for lookups)
CREATE POLICY "authenticated_read_manager_departments" ON manager_departments
FOR SELECT TO authenticated
USING (true);

-- Write: Super Admin only
CREATE POLICY "super_admin_manage_manager_departments" ON manager_departments
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- USER_RECENT_COMBINATIONS
-- All operations: Own records only
CREATE POLICY "users_own_recent_combinations" ON user_recent_combinations
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- AUDIT_LOGS
-- Read: Admin and Super Admin only (no writes from application)
CREATE POLICY "admin_read_audit_logs" ON audit_logs
FOR SELECT TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON POLICY "staff_select_own_entries" ON time_entries IS 'Staff can only view their own time entries';
COMMENT ON POLICY "manager_select_dept_entries" ON time_entries IS 'Managers can view entries from departments they manage';
COMMENT ON POLICY "admin_select_all_entries" ON time_entries IS 'Admins and Super Admins can view all time entries';
COMMENT ON POLICY "super_admin_all_entries" ON time_entries IS 'Super Admins have full CRUD on all time entries';
