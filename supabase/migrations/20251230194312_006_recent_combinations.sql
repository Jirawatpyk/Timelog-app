-- Migration: 006_recent_combinations
-- Story: 1.3 Database Schema - Time Entry & Supporting Tables
-- AC: 3 - User Recent Combinations Table

-- Store last used combinations for quick 1-tap entry
CREATE TABLE user_recent_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ DEFAULT now()
);

-- UNIQUE constraint using expression index to handle NULL task_id
CREATE UNIQUE INDEX idx_unique_user_combination ON user_recent_combinations(
  user_id, client_id, project_id, job_id, service_id, COALESCE(task_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Index for efficient lookup of user's recent combinations ordered by recency
CREATE INDEX idx_recent_user ON user_recent_combinations(user_id, last_used_at DESC);

-- Enable RLS (policies added in Story 1.4)
ALTER TABLE user_recent_combinations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE user_recent_combinations IS 'Stores recent job/service/task combinations for quick time entry';
