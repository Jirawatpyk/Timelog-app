-- Migration: add_user_confirmed_at
-- Story: 7.2a User Invitation Email
-- Purpose: Add confirmed_at column to track whether user has confirmed their account
-- This enables tracking invitation status (pending/active/inactive)

-- Add confirmed_at column to public.users
ALTER TABLE public.users
ADD COLUMN confirmed_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN users.confirmed_at IS 'Timestamp when user confirmed their account via email. NULL means pending invitation.';

-- Create function to sync confirmed_at from auth.users
-- This function is called by a trigger when auth.users.confirmed_at is updated
CREATE OR REPLACE FUNCTION public.sync_user_confirmed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update when confirmed_at changes from NULL to a value
  IF OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    UPDATE public.users
    SET confirmed_at = NEW.confirmed_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Creating triggers on auth.users requires special permissions
-- This trigger syncs confirmation status to public.users
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
AFTER UPDATE OF confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.sync_user_confirmed_at();

-- Backfill: Set confirmed_at for existing users who have already confirmed
-- This handles users created before this migration
UPDATE public.users u
SET confirmed_at = au.confirmed_at
FROM auth.users au
WHERE u.id = au.id AND au.confirmed_at IS NOT NULL;

-- Create index for filtering by confirmation status
CREATE INDEX idx_users_confirmed_at ON users(confirmed_at);
