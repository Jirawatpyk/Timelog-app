-- Migration: 015_user_onboarding
-- Story 8.7: First-Time User Flow
-- AC 2: First-time flag in user preferences

-- Add onboarding flag to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Update existing users to mark as completed (they're not new)
UPDATE users SET has_completed_onboarding = TRUE
WHERE created_at < NOW() - INTERVAL '1 day';

COMMENT ON COLUMN users.has_completed_onboarding
IS 'Whether user has completed first-time onboarding flow';
