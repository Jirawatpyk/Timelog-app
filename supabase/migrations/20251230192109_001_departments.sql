-- Migration: 001_departments
-- Story: 1.2 Database Schema - Core Tables
-- AC: 1 - Departments Table

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE departments IS 'Organization departments that users belong to';
