/**
 * Master Data Server Actions
 * Story 3.1: Service Type Management (AC: 2, 4, 5)
 *
 * CRUD operations for master data entities.
 * All actions return ActionResult<T> per project conventions.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  serviceSchema,
  clientSchema,
  taskSchema,
  departmentSchema,
  uuidSchema,
  createProjectSchema,
  updateProjectSchema,
  createJobSchema,
  updateJobSchema,
  type ServiceInput,
  type ClientInput,
  type TaskInput,
  type DepartmentInput,
  type CreateProjectInput,
  type UpdateProjectInput,
  type CreateJobInput,
  type UpdateJobInput,
} from '@/schemas/master-data.schema';
import type {
  Service,
  Client,
  Task,
  Department,
  Project,
  Job,
  ActionResult,
  ProjectWithClient,
  JobWithProject,
} from '@/types/domain';

/**
 * Check if user is authenticated and has admin role
 */
async function requireAdminAuth(): Promise<
  | { success: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { success: false; error: string }
> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role || !['admin', 'super_admin'].includes(profile.role)) {
    return { success: false, error: 'Not authorized' };
  }

  return { success: true, supabase, userId: user.id };
}

/**
 * Create a new service
 *
 * @param input - Service input data
 * @returns ActionResult with created service or error
 */
export async function createService(input: ServiceInput): Promise<ActionResult<Service>> {
  // Validate input first
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Insert service
  const { data, error } = await supabase
    .from('services')
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Service name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Update an existing service
 *
 * @param id - Service ID to update
 * @param input - Updated service data
 * @returns ActionResult with updated service or error
 */
export async function updateService(
  id: string,
  input: ServiceInput
): Promise<ActionResult<Service>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Validate input
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update service
  const { data, error } = await supabase
    .from('services')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Service name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Toggle service active status
 *
 * @param id - Service ID to toggle
 * @param active - New active status
 * @returns ActionResult with updated service or error
 */
export async function toggleServiceActive(
  id: string,
  active: boolean
): Promise<ActionResult<Service>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update active status
  const { data, error } = await supabase
    .from('services')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

// ============================================================================
// Client Actions
// Story 3.2: Client Management (AC: 2, 4, 5)
// ============================================================================

/**
 * Create a new client
 * Note: Named createClientAction to avoid conflict with Supabase createClient
 *
 * @param input - Client input data
 * @returns ActionResult with created client or error
 */
export async function createClientAction(input: ClientInput): Promise<ActionResult<Client>> {
  // Validate input first
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Insert client
  const { data, error } = await supabase
    .from('clients')
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Client name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Update an existing client
 *
 * @param id - Client ID to update
 * @param input - Updated client data
 * @returns ActionResult with updated client or error
 */
export async function updateClientAction(
  id: string,
  input: ClientInput
): Promise<ActionResult<Client>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Validate input
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update client
  const { data, error } = await supabase
    .from('clients')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Client name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Toggle client active status
 *
 * @param id - Client ID to toggle
 * @param active - New active status
 * @returns ActionResult with updated client or error
 */
export async function toggleClientActive(
  id: string,
  active: boolean
): Promise<ActionResult<Client>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update active status
  const { data, error } = await supabase
    .from('clients')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

// ============================================================================
// Task Actions
// Story 3.3: Task Management (AC: 2, 4, 5)
// ============================================================================

/**
 * Create a new task
 *
 * @param input - Task input data
 * @returns ActionResult with created task or error
 */
export async function createTask(input: TaskInput): Promise<ActionResult<Task>> {
  // Validate input first
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Insert task
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Task name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Update an existing task
 *
 * @param id - Task ID to update
 * @param input - Updated task data
 * @returns ActionResult with updated task or error
 */
export async function updateTask(
  id: string,
  input: TaskInput
): Promise<ActionResult<Task>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Validate input
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update task
  const { data, error } = await supabase
    .from('tasks')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Task name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Toggle task active status
 *
 * @param id - Task ID to toggle
 * @param active - New active status
 * @returns ActionResult with updated task or error
 */
export async function toggleTaskActive(
  id: string,
  active: boolean
): Promise<ActionResult<Task>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update active status
  const { data, error } = await supabase
    .from('tasks')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

// ============================================================================
// Usage Check Actions
// Story 3.4: Soft Delete Protection (AC: 1)
// ============================================================================

/**
 * Result type for item usage check
 */
export interface ItemUsage {
  used: boolean;
  count: number;
}

/**
 * Check if a service is used in any time entries
 *
 * @param id - Service ID to check
 * @returns ActionResult with usage info
 */
export async function checkServiceUsage(id: string): Promise<ActionResult<ItemUsage>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Count time entries using this service
  const { count, error } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      used: (count ?? 0) > 0,
      count: count ?? 0,
    },
  };
}

/**
 * Check if a task is used in any time entries
 *
 * @param id - Task ID to check
 * @returns ActionResult with usage info
 */
export async function checkTaskUsage(id: string): Promise<ActionResult<ItemUsage>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Count time entries using this task
  const { count, error } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact', head: true })
    .eq('task_id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      used: (count ?? 0) > 0,
      count: count ?? 0,
    },
  };
}

/**
 * Check if a client is used in any time entries (via jobs)
 *
 * @param id - Client ID to check
 * @returns ActionResult with usage info
 */
export async function checkClientUsage(id: string): Promise<ActionResult<ItemUsage>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Get all jobs under this client (via projects)
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', id);

  if (projectsError) {
    return { success: false, error: projectsError.message };
  }

  if (!projects || projects.length === 0) {
    return { success: true, data: { used: false, count: 0 } };
  }

  const projectIds = projects.map((p) => p.id);

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id')
    .in('project_id', projectIds);

  if (jobsError) {
    return { success: false, error: jobsError.message };
  }

  if (!jobs || jobs.length === 0) {
    return { success: true, data: { used: false, count: 0 } };
  }

  const jobIds = jobs.map((j) => j.id);

  // Count time entries using these jobs
  const { count, error } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact', head: true })
    .in('job_id', jobIds);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      used: (count ?? 0) > 0,
      count: count ?? 0,
    },
  };
}

// ============================================================================
// Project Actions
// Story 3.6: Projects & Jobs Admin UI (AC: 1, 2, 3, 4)
// ============================================================================

/**
 * Get all projects, optionally filtered by client
 *
 * @param clientId - Optional client ID to filter by
 * @returns ActionResult with projects array including client names
 */
export async function getProjects(clientId?: string): Promise<ActionResult<ProjectWithClient[]>> {
  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  let query = supabase
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

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  // Transform to include clientName
  const projects: ProjectWithClient[] = (data || []).map((row) => {
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

  return { success: true, data: projects };
}

/**
 * Create a new project
 *
 * @param input - Project input data (clientId, name)
 * @returns ActionResult with created project
 */
export async function createProject(input: CreateProjectInput): Promise<ActionResult<Project>> {
  // Validate input
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Insert project
  const { data, error } = await supabase
    .from('projects')
    .insert({
      client_id: parsed.data.clientId,
      name: parsed.data.name,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Project name already exists for this client' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Update an existing project
 *
 * @param id - Project ID to update
 * @param input - Updated project data (name only)
 * @returns ActionResult with updated project
 */
export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<ActionResult<Project>> {
  // Validate ID
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Validate input
  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update project
  const { data, error } = await supabase
    .from('projects')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Project name already exists for this client' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Toggle project active status
 *
 * @param id - Project ID to toggle
 * @param active - New active status
 * @returns ActionResult with updated project
 */
export async function toggleProjectActive(
  id: string,
  active: boolean
): Promise<ActionResult<Project>> {
  // Validate ID
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update active status
  const { data, error } = await supabase
    .from('projects')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Check if a project is used (has jobs)
 *
 * @param id - Project ID to check
 * @returns ActionResult with usage info (count of jobs)
 */
export async function checkProjectUsage(id: string): Promise<ActionResult<ItemUsage>> {
  // Validate ID
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Count jobs under this project
  const { count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      used: (count ?? 0) > 0,
      count: count ?? 0,
    },
  };
}

// ============================================================================
// Job Actions
// Story 3.6: Projects & Jobs Admin UI (AC: 5, 6, 7, 8)
// ============================================================================

/**
 * Get all jobs, optionally filtered by project or client
 *
 * @param projectId - Optional project ID to filter by
 * @param clientId - Optional client ID to filter by (filters via projects)
 * @returns ActionResult with jobs array including project and client names
 */
export async function getJobs(
  projectId?: string,
  clientId?: string
): Promise<ActionResult<JobWithProject[]>> {
  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  let query = supabase
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

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  // Transform and optionally filter by clientId
  let jobs: JobWithProject[] = (data || []).map((row) => {
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

  // Filter by clientId if provided
  if (clientId) {
    jobs = jobs.filter((job) => job.clientId === clientId);
  }

  return { success: true, data: jobs };
}

/**
 * Create a new job
 *
 * @param input - Job input data (projectId, name, jobNo, soNo)
 * @returns ActionResult with created job
 */
export async function createJob(input: CreateJobInput): Promise<ActionResult<Job>> {
  // Validate input
  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Insert job
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      project_id: parsed.data.projectId,
      name: parsed.data.name,
      job_no: parsed.data.jobNo,
      so_no: parsed.data.soNo,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Job name already exists for this project' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Update an existing job
 *
 * @param id - Job ID to update
 * @param input - Updated job data (name, jobNo, soNo)
 * @returns ActionResult with updated job
 */
export async function updateJob(
  id: string,
  input: UpdateJobInput
): Promise<ActionResult<Job>> {
  // Validate ID
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Validate input
  const parsed = updateJobSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update job
  const { data, error } = await supabase
    .from('jobs')
    .update({
      name: parsed.data.name,
      job_no: parsed.data.jobNo,
      so_no: parsed.data.soNo,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Job name already exists for this project' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Toggle job active status
 *
 * @param id - Job ID to toggle
 * @param active - New active status
 * @returns ActionResult with updated job
 */
export async function toggleJobActive(
  id: string,
  active: boolean
): Promise<ActionResult<Job>> {
  // Validate ID
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update active status
  const { data, error } = await supabase
    .from('jobs')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Check if a job is used in time entries
 *
 * @param id - Job ID to check
 * @returns ActionResult with usage info (count of time_entries)
 */
export async function checkJobUsage(id: string): Promise<ActionResult<ItemUsage>> {
  // Validate ID
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Count time entries using this job
  const { count, error } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      used: (count ?? 0) > 0,
      count: count ?? 0,
    },
  };
}

// ============================================================================
// Department Actions
// Story 3.7: Department Management (AC: 1, 3, 5, 6)
// NOTE: Department management is restricted to super_admin ONLY
// ============================================================================

/**
 * Check if user is authenticated and has super_admin role
 * Unlike requireAdminAuth, this ONLY allows super_admin (not regular admin)
 */
async function requireSuperAdminAuth(): Promise<
  | { success: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { success: false; error: string }
> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    return { success: false, error: 'Super Admin access required' };
  }

  return { success: true, supabase, userId: user.id };
}

/**
 * Get all departments ordered by active status then name
 * Active departments first, then inactive, alphabetically within each group
 *
 * @returns ActionResult with departments array
 */
export async function getDepartments(): Promise<ActionResult<Department[]>> {
  // Check auth - super_admin only
  const authResult = await requireSuperAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Order by active (true first), then name alphabetically
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('active', { ascending: false })
    .order('name');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [] };
}

/**
 * Create a new department
 *
 * @param input - Department input data (name)
 * @returns ActionResult with created department or error
 */
export async function createDepartment(input: DepartmentInput): Promise<ActionResult<Department>> {
  // Validate input first
  const parsed = departmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth - super_admin only
  const authResult = await requireSuperAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Insert department
  const { data, error } = await supabase
    .from('departments')
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Department name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Update an existing department
 *
 * @param id - Department ID to update
 * @param input - Updated department data (name)
 * @returns ActionResult with updated department or error
 */
export async function updateDepartment(
  id: string,
  input: DepartmentInput
): Promise<ActionResult<Department>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Validate input
  const parsed = departmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check auth - super_admin only
  const authResult = await requireSuperAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update department
  const { data, error } = await supabase
    .from('departments')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Department name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Toggle department active status
 * Note: Deactivating a department does NOT affect existing users in that department
 *
 * @param id - Department ID to toggle
 * @param active - New active status
 * @returns ActionResult with updated department or error
 */
export async function toggleDepartmentActive(
  id: string,
  active: boolean
): Promise<ActionResult<Department>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth - super_admin only
  const authResult = await requireSuperAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Update active status
  const { data, error } = await supabase
    .from('departments')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

/**
 * Check if a department is in use (has active users)
 *
 * @param id - Department ID to check
 * @returns ActionResult with usage info (count of active users)
 */
export async function checkDepartmentUsage(id: string): Promise<ActionResult<ItemUsage>> {
  // Validate ID format
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: idResult.error.errors[0].message };
  }

  // Check auth - super_admin only
  const authResult = await requireSuperAdminAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const { supabase } = authResult;

  // Count active users in this department
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id)
    .eq('is_active', true);

  if (error) {
    return { success: false, error: error.message };
  }

  const userCount = count ?? 0;
  return {
    success: true,
    data: {
      used: userCount > 0,
      count: userCount,
    },
  };
}
