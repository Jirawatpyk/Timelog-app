/**
 * Master Data Query Functions
 * Story 3.4: Soft Delete Protection (AC: 2, 4)
 *
 * These functions provide type-safe queries for master data:
 * - getActive*() functions return only active items (for dropdowns)
 * - getAll*() functions return all items including inactive (for admin panel)
 *
 * Note: RLS policies already filter inactive items for non-admin users,
 * but we explicitly filter for clarity and API consistency.
 */

import { createClient } from '@/lib/supabase/server';
import type { Service, Client, Task, Project, Job } from '@/types/domain';

/**
 * Get active services for time entry form
 * RLS already filters for non-admin users, but we explicitly filter here for clarity
 */
export async function getActiveServices(): Promise<Service[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all services for admin panel (includes inactive)
 */
export async function getAllServices(): Promise<Service[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active clients for time entry form
 */
export async function getActiveClients(): Promise<Client[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all clients for admin panel (includes inactive)
 */
export async function getAllClients(): Promise<Client[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active projects for a specific client
 */
export async function getActiveProjectsByClient(clientId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all projects for a specific client (includes inactive)
 */
export async function getAllProjectsByClient(clientId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active jobs for a specific project
 */
export async function getActiveJobsByProject(projectId: string): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .eq('active', true)
    .order('job_no', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all jobs for a specific project (includes inactive)
 */
export async function getAllJobsByProject(projectId: string): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .order('job_no', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active tasks for time entry form
 */
export async function getActiveTasks(): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all tasks for admin panel (includes inactive)
 */
export async function getAllTasks(): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

// ============================================
// CASCADE-AWARE QUERIES (AC: 6)
// These queries filter by parent AND child active status
// ============================================

/**
 * Project with client info for cascade filtering
 */
export interface ProjectWithClient extends Project {
  clients: Pick<Client, 'id' | 'active'> | null;
}

/**
 * Job with project/client info for cascade filtering
 */
export interface JobWithHierarchy extends Job {
  projects: {
    id: string;
    active: boolean;
    clients: Pick<Client, 'id' | 'active'> | null;
  } | null;
}

/**
 * Get active projects for a client, ensuring client is also active (AC: 6)
 * Returns empty array if client is inactive
 */
export async function getActiveProjectsWithCascade(clientId: string): Promise<Project[]> {
  const supabase = await createClient();

  // First check if client is active
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, active')
    .eq('id', clientId)
    .single();

  if (clientError || !client || !client.active) {
    // Client doesn't exist, not accessible, or inactive - return empty
    return [];
  }

  // Get active projects for this active client
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active jobs for a project, ensuring project AND client are active (AC: 6)
 * Returns empty array if project or client is inactive
 */
export async function getActiveJobsWithCascade(projectId: string): Promise<Job[]> {
  const supabase = await createClient();

  // First check if project is active and its client is active
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id,
      active,
      clients:client_id (
        id,
        active
      )
    `)
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    // Project doesn't exist or not accessible
    return [];
  }

  // Type assertion for the joined data
  const projectWithClient = project as unknown as {
    id: string;
    active: boolean;
    clients: { id: string; active: boolean } | null;
  };

  // Check cascade: project active AND client active
  if (!projectWithClient.active || !projectWithClient.clients?.active) {
    return [];
  }

  // Get active jobs for this active project with active client
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .eq('active', true)
    .order('job_no', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get cascading dropdown data for time entry form
 * Returns clients, and functions to get projects/jobs based on selection
 * All filtering respects the active cascade
 */
export async function getCascadingDropdownData() {
  const clients = await getActiveClients();

  return {
    clients,
    getProjects: getActiveProjectsWithCascade,
    getJobs: getActiveJobsWithCascade,
  };
}
