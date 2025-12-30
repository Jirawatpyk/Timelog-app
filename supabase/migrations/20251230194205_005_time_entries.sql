-- Migration: 005_time_entries
-- Story: 1.3 Database Schema - Time Entry & Supporting Tables
-- AC: 1 - Time Entries Table, AC: 6 - Updated_at Trigger

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  entry_date DATE NOT NULL,
  notes TEXT,
  department_id UUID NOT NULL REFERENCES departments(id),  -- Snapshot at creation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes for common queries
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, entry_date);
CREATE INDEX idx_time_entries_dept_date ON time_entries(department_id, entry_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to time_entries
CREATE TRIGGER time_entries_updated_at
BEFORE UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE time_entries IS 'Core time tracking entries with department snapshot';
COMMENT ON COLUMN time_entries.department_id IS 'Snapshot of user department at entry creation for historical reporting';
COMMENT ON COLUMN time_entries.duration_minutes IS 'Duration in minutes, must be between 1 and 1440 (24 hours)';
