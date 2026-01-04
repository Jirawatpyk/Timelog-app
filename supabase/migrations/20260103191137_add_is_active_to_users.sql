-- Migration: add_is_active_to_users
-- Purpose: Add is_active column to users table for user deactivation feature
-- Required by: Story 7.1 (User List View), 7.2 (Create User), 7.4 (Deactivate User)
-- Note: This column was missing from initial schema (Story 1.2)

ALTER TABLE users
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN users.is_active IS 'Whether the user account is active. Inactive users cannot log in.';

-- Create index for filtering active/inactive users
CREATE INDEX idx_users_is_active ON users(is_active);
