-- Migration: 002_users
-- Story: 1.2 Database Schema - Core Tables
-- AC: 2 - Users Table

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT CHECK (role IN ('staff', 'manager', 'admin', 'super_admin')) DEFAULT 'staff',
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE users IS 'Application users with role and department assignment';
COMMENT ON COLUMN users.role IS 'User role: staff, manager, admin, or super_admin';
