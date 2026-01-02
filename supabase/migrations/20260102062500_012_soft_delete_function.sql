-- Migration: 012_soft_delete_function
-- Fixes: Use SECURITY DEFINER function for soft delete to bypass RLS "new row visible" check
--
-- Problem: Adding a SELECT policy that doesn't filter deleted_at allows
-- staff to see their deleted entries, which breaks the requirement.
--
-- Solution:
-- 1. Drop the permissive SELECT policy we added in migration 011
-- 2. Create a SECURITY DEFINER function that performs soft delete
-- 3. The function runs with owner privileges, bypassing RLS
-- 4. Staff calls this function instead of direct UPDATE

-- ============================================
-- FIX: REMOVE OVERLY PERMISSIVE SELECT POLICY
-- ============================================

DROP POLICY IF EXISTS "staff_select_own_entries_for_mutation" ON time_entries;

-- ============================================
-- CREATE SOFT DELETE FUNCTION
-- ============================================

-- This function performs soft delete with SECURITY DEFINER
-- It runs with the privileges of the function owner (bypassing RLS)
-- but still validates that the user owns the entry and it's not already deleted
CREATE OR REPLACE FUNCTION public.soft_delete_time_entry(entry_id UUID)
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  deleted_entry time_entries;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Perform soft delete with ownership and not-already-deleted validation
  UPDATE time_entries
  SET deleted_at = NOW()
  WHERE id = entry_id
    AND user_id = current_user_id  -- Only own entries
    AND deleted_at IS NULL          -- Prevent double-delete
  RETURNING * INTO deleted_entry;

  -- Check if a row was updated
  IF deleted_entry IS NULL THEN
    -- Entry not found, not owned by user, or already deleted
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Entry not found, not owned by you, or already deleted'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object('id', entry_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.soft_delete_time_entry(UUID) TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.soft_delete_time_entry(UUID) IS
'Soft deletes a time entry by setting deleted_at. Runs with SECURITY DEFINER to bypass RLS new row visible check. Validates user ownership and prevents double-delete.';
