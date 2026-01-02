/**
 * Jobs List Component (Server Component)
 * Story 3.6: Projects & Jobs Admin UI (AC: 5, 10)
 *
 * Server component that fetches jobs with project/client data
 * and passes to client component for interactive features.
 */

import { createClient } from '@/lib/supabase/server';
import { JobsListClient } from './JobsListClient';
import type { JobWithProject, Client, ProjectWithClient } from '@/types/domain';

export async function JobsList() {
  const supabase = await createClient();

  // Fetch jobs with project and client names
  const { data: jobsData } = await supabase
    .from('jobs')
    .select(`
      id,
      project_id,
      name,
      job_no,
      so_no,
      active,
      created_at,
      projects!inner(
        id,
        name,
        client_id,
        clients!inner(name)
      )
    `)
    .order('name');

  // Transform to include project and client names
  const jobs: JobWithProject[] = (jobsData || []).map((row) => {
    // Handle the joined projects data (can be object or array depending on query)
    const project = row.projects as unknown as {
      id: string;
      name: string;
      client_id: string;
      clients: { name: string };
    } | null;
    return {
      id: row.id,
      project_id: row.project_id,
      name: row.name,
      job_no: row.job_no,
      so_no: row.so_no,
      active: row.active,
      created_at: row.created_at,
      projectName: project?.name || '',
      clientName: project?.clients?.name || '',
      clientId: project?.client_id || '',
    };
  });

  // Fetch clients for filter dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('active', true)
    .order('name');

  // Fetch projects for filter and add dialogs
  const { data: projectsData } = await supabase
    .from('projects')
    .select(`
      id,
      client_id,
      name,
      active,
      created_at,
      clients!inner(name)
    `)
    .eq('active', true)
    .order('name');

  const projects: ProjectWithClient[] = (projectsData || []).map((row) => {
    // Handle the joined clients data (can be object or array depending on query)
    const clientData = row.clients as unknown as { name: string } | null;
    return {
      id: row.id,
      client_id: row.client_id,
      name: row.name,
      active: row.active,
      created_at: row.created_at,
      clientName: clientData?.name || '',
    };
  });

  return (
    <JobsListClient
      initialJobs={jobs}
      clients={(clients ?? []) as Client[]}
      projects={projects}
    />
  );
}
