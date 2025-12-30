-- Migration: 003b_manager_departments_dept_index
-- Story: 1.3 Database Schema - Time Entry & Supporting Tables
-- Fix: Add missing index for department_id lookup
-- Review finding: [L1] Missing index on department_id for manager_departments

-- Index for efficient lookup of managers by department
-- Supports query: "which managers oversee this department?"
CREATE INDEX idx_manager_departments_department ON manager_departments(department_id);
