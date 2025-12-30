-- Migration: 003_manager_departments
-- Story: 1.3 Database Schema - Time Entry & Supporting Tables
-- AC: 2 - Manager Departments Junction Table

-- Junction table for managers overseeing multiple departments
-- Critical: Manager can oversee 2 departments (project requirement)
CREATE TABLE manager_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manager_id, department_id)
);

-- Index for efficient lookup of manager's departments
CREATE INDEX idx_manager_departments_manager ON manager_departments(manager_id);

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE manager_departments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE manager_departments IS 'Junction table for managers overseeing multiple departments';
