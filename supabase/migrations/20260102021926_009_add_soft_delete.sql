-- Migration: 009_add_soft_delete
-- Story: 4.6 Delete Own Time Entry
-- AC6: Soft Delete Implementation

-- ============================================
-- ADD DELETED_AT COLUMN
-- ============================================

-- Add deleted_at column for soft delete
ALTER TABLE time_entries
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create partial index for efficient filtering of non-deleted entries
-- This significantly speeds up the common case (querying active entries)
CREATE INDEX idx_time_entries_not_deleted ON time_entries (user_id, entry_date)
WHERE deleted_at IS NULL;

COMMENT ON COLUMN time_entries.deleted_at IS 'Soft delete timestamp - entries with this set are considered deleted';

-- ============================================
-- UPDATE RLS POLICIES TO FILTER DELETED ENTRIES
-- ============================================

-- Drop existing SELECT policies and recreate with deleted_at filter
DROP POLICY IF EXISTS "staff_select_own_entries" ON time_entries;
DROP POLICY IF EXISTS "manager_select_dept_entries" ON time_entries;
DROP POLICY IF EXISTS "admin_select_all_entries" ON time_entries;

-- Staff: SELECT own non-deleted entries only
CREATE POLICY "staff_select_own_entries" ON time_entries
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  AND deleted_at IS NULL
);

-- Manager: SELECT non-deleted entries from managed departments
CREATE POLICY "manager_select_dept_entries" ON time_entries
FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM manager_departments md
    WHERE md.manager_id = auth.uid()
    AND md.department_id = time_entries.department_id
  )
  AND public.get_user_role() = 'manager'
);

-- Admin: SELECT all non-deleted entries
CREATE POLICY "admin_select_all_entries" ON time_entries
FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND public.get_user_role() IN ('admin', 'super_admin')
);

-- Super Admin: Keep full access (can see deleted entries for recovery if needed)
-- (super_admin_all_entries policy already exists and gives full access)

-- ============================================
-- AUDIT LOG TRIGGER FOR TIME ENTRIES
-- ============================================

-- Create or replace the audit trigger function
-- This captures INSERT, UPDATE, and soft DELETE (when deleted_at changes from NULL)
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

-- Create trigger on time_entries for audit logging
DROP TRIGGER IF EXISTS time_entries_audit ON time_entries;
CREATE TRIGGER time_entries_audit
AFTER INSERT OR UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION log_time_entry_changes();

COMMENT ON FUNCTION log_time_entry_changes() IS 'Audit trigger for time_entries - records INSERT, UPDATE, and soft DELETE operations';

-- ============================================
-- POLICY COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON POLICY "staff_select_own_entries" ON time_entries IS 'Staff can only view their own non-deleted time entries';
COMMENT ON POLICY "manager_select_dept_entries" ON time_entries IS 'Managers can view non-deleted entries from departments they manage';
COMMENT ON POLICY "admin_select_all_entries" ON time_entries IS 'Admins and Super Admins can view all non-deleted time entries';
