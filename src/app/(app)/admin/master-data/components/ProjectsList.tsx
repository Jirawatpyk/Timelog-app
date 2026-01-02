/**
 * Projects List Component (Server Component)
 * Story 3.6: Projects & Jobs Admin UI (AC: 1, 10)
 *
 * Server component that fetches projects with client data
 * and passes to client component for interactive features.
 */

import { createClient } from '@/lib/supabase/server';
import { ProjectsListClient } from './ProjectsListClient';
import type { ProjectWithClient, Client } from '@/types/domain';

export async function ProjectsList() {
  const supabase = await createClient();

  // Fetch projects with client names
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
    .order('name');

  // Transform to include clientName
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

  // Fetch clients for filter dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('active', true)
    .order('name');

  return (
    <ProjectsListClient
      initialProjects={projects}
      clients={(clients ?? []) as Client[]}
    />
  );
}
