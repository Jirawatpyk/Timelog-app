'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Client, Project, Job, Service, Task } from '@/types/domain';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Get all active clients
 * Used in Story 4.2 for the Client dropdown
 */
export async function getActiveClients(): Promise<ActionResult<Client[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

/**
 * Get active projects for a specific client
 * Used in Story 4.2 for the Project dropdown (cascaded from Client)
 */
export async function getProjectsByClient(
  clientId: string
): Promise<ActionResult<Project[]>> {
  // Validate UUID format
  if (!isValidUUID(clientId)) {
    return { success: false, error: 'Invalid client ID format' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .eq('active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

/**
 * Get active jobs for a specific project
 * Used in Story 4.2 for the Job dropdown (cascaded from Project)
 */
export async function getJobsByProject(
  projectId: string
): Promise<ActionResult<Job[]>> {
  // Validate UUID format
  if (!isValidUUID(projectId)) {
    return { success: false, error: 'Invalid project ID format' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .eq('active', true)
    .order('job_no', { nullsFirst: false })
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

/**
 * Get all active services
 * Used in Story 4.3 for the Service dropdown
 */
export async function getActiveServices(): Promise<ActionResult<Service[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

/**
 * Get all active tasks
 * Used in Story 4.3 for the Task dropdown (optional field)
 */
export async function getActiveTasks(): Promise<ActionResult<Task[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}
