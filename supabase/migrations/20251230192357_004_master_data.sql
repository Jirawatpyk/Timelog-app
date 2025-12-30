-- Migration: 004_master_data
-- Story: 1.2 Database Schema - Core Tables
-- AC: 3, 4, 5, 6, 7 - Clients, Projects, Jobs, Services, Tasks Tables

-- Clients table (AC: 3)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects table (AC: 4) - depends on clients
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_projects_client ON projects(client_id);

-- Jobs table (AC: 5) - depends on projects
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_no TEXT,
  so_no TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_jobs_project ON jobs(project_id);

-- Services table (AC: 6) - standalone lookup
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks table (AC: 7) - standalone lookup
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables (policies added in Story 1.4)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE clients IS 'Client companies for time tracking';
COMMENT ON TABLE projects IS 'Projects under each client';
COMMENT ON TABLE jobs IS 'Jobs/tasks under each project with job_no and so_no';
COMMENT ON TABLE services IS 'Service types for time entries';
COMMENT ON TABLE tasks IS 'Task types for time entries';
