-- Migration: 007_audit_logs
-- Story: 1.3 Database Schema - Time Entry & Supporting Tables
-- AC: 4 - Audit Logs Table

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient lookup by table and record
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Note: Audit trigger will be added in Story 8.6 (Audit Log Database Trigger)
-- This story only creates the table structure

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE audit_logs IS 'Audit trail for tracking data changes across tables';
COMMENT ON COLUMN audit_logs.old_data IS 'Previous row data for UPDATE/DELETE operations';
COMMENT ON COLUMN audit_logs.new_data IS 'New row data for INSERT/UPDATE operations';
