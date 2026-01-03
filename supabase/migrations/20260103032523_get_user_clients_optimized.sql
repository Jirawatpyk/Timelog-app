-- Story 5.6: Optimized function to get unique clients for a user
-- Uses DISTINCT to avoid fetching all entries and deduplicating in JS

CREATE OR REPLACE FUNCTION get_user_clients()
RETURNS TABLE (id UUID, name TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT DISTINCT c.id, c.name
  FROM clients c
  INNER JOIN projects p ON p.client_id = c.id
  INNER JOIN jobs j ON j.project_id = p.id
  INNER JOIN time_entries te ON te.job_id = j.id
  WHERE te.user_id = auth.uid()
    AND te.deleted_at IS NULL
    AND c.deleted_at IS NULL
  ORDER BY c.name;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_clients() TO authenticated;

COMMENT ON FUNCTION get_user_clients() IS 'Returns unique clients that the authenticated user has logged time entries for. Uses DISTINCT for efficiency.';
