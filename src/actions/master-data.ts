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
import { serviceSchema, clientSchema, taskSchema, uuidSchema, type ServiceInput, type ClientInput, type TaskInput } from '@/schemas/master-data.schema';
import type { Service, Client, Task, ActionResult } from '@/types/domain';

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
