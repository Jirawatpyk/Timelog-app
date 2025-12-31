-- Migration: add_clients_name_unique
-- Story: 3.2 Client Management (Code Review Fix)
-- Issue: AC3 "Unique Client Names" was not enforced at database level
--
-- The services and tasks tables have UNIQUE constraints on name,
-- but clients table was missing this constraint.

-- Step 1: Rename duplicate client names (append _dup_N suffix)
-- Cannot delete because of foreign key constraints (clients->projects->jobs->time_entries)
WITH duplicates AS (
  SELECT id, name, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) AS rn
  FROM clients
)
UPDATE clients c
SET name = c.name || '_dup_' || d.rn
FROM duplicates d
WHERE c.id = d.id AND d.rn > 1;

-- Step 2: Add unique constraint to clients.name
ALTER TABLE clients ADD CONSTRAINT clients_name_unique UNIQUE (name);

-- Comment
COMMENT ON CONSTRAINT clients_name_unique ON clients IS 'Ensures client names are unique (Story 3.2 AC3)';
