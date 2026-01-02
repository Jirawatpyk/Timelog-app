'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { hoursToMinutes } from '@/lib/duration';
import { canEditEntry, EDIT_WINDOW_DAYS_CONST } from '@/lib/entry-rules';
import type { ActionResult, Client, Project, Job, Service, Task, TimeEntry, TimeEntryWithDetails } from '@/types/domain';

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

// ============================================
// TIME ENTRY CREATION (Story 4.4)
// ============================================

interface CreateTimeEntryInput {
  jobId: string;
  serviceId: string;
  taskId: string | null;
  durationHours: number;
  entryDate: string; // ISO format: YYYY-MM-DD
  notes?: string;
}

/**
 * Create a new time entry
 * Story 4.4 - AC5: Form submission success
 * Story 4.4 - AC7: Form submission error handling
 */
export async function createTimeEntry(
  input: CreateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  // Validate UUID formats
  if (!isValidUUID(input.jobId)) {
    return { success: false, error: 'Invalid job ID format' };
  }
  if (!isValidUUID(input.serviceId)) {
    return { success: false, error: 'Invalid service ID format' };
  }
  if (input.taskId && !isValidUUID(input.taskId)) {
    return { success: false, error: 'Invalid task ID format' };
  }

  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'ไม่ได้เข้าสู่ระบบ' };
  }

  // Get user's department for snapshot
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('department_id')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile?.department_id) {
    return { success: false, error: 'ไม่พบข้อมูลผู้ใช้' };
  }

  // Convert hours to minutes for storage
  const durationMinutes = hoursToMinutes(input.durationHours);

  // Create time entry
  const { data: entry, error: insertError } = await supabase
    .from('time_entries')
    .insert({
      user_id: user.id,
      job_id: input.jobId,
      service_id: input.serviceId,
      task_id: input.taskId,
      duration_minutes: durationMinutes,
      entry_date: input.entryDate,
      notes: input.notes ?? null,
      department_id: userProfile.department_id, // Snapshot at creation
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to create time entry:', insertError);
    return { success: false, error: 'ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง' };
  }

  // Revalidate dashboard to show new entry
  revalidatePath('/dashboard');
  revalidatePath('/entry');

  return { success: true, data: entry };
}

// ============================================
// RECENT COMBINATIONS (Story 4.4 - AC8)
// ============================================

interface RecentCombinationInput {
  clientId: string;
  projectId: string;
  jobId: string;
  serviceId: string;
  taskId: string | null;
}

/**
 * Update recent combinations for quick entry
 * Story 4.4 - AC8: Recent combinations update
 */
export async function upsertRecentCombination(
  input: RecentCombinationInput
): Promise<ActionResult<void>> {
  // Validate UUID formats
  if (!isValidUUID(input.clientId)) {
    return { success: false, error: 'Invalid client ID format' };
  }
  if (!isValidUUID(input.projectId)) {
    return { success: false, error: 'Invalid project ID format' };
  }
  if (!isValidUUID(input.jobId)) {
    return { success: false, error: 'Invalid job ID format' };
  }
  if (!isValidUUID(input.serviceId)) {
    return { success: false, error: 'Invalid service ID format' };
  }
  if (input.taskId && !isValidUUID(input.taskId)) {
    return { success: false, error: 'Invalid task ID format' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Build query for checking existing combination
  let query = supabase
    .from('user_recent_combinations')
    .select('id')
    .eq('user_id', user.id)
    .eq('client_id', input.clientId)
    .eq('project_id', input.projectId)
    .eq('job_id', input.jobId)
    .eq('service_id', input.serviceId);

  // Handle null task_id - need to use is() for null comparison
  if (input.taskId === null) {
    query = query.is('task_id', null);
  } else {
    query = query.eq('task_id', input.taskId);
  }

  const { data: existing } = await query.single();

  if (existing) {
    // Update last_used_at
    await supabase
      .from('user_recent_combinations')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    // Insert new combination
    await supabase
      .from('user_recent_combinations')
      .insert({
        user_id: user.id,
        client_id: input.clientId,
        project_id: input.projectId,
        job_id: input.jobId,
        service_id: input.serviceId,
        task_id: input.taskId,
        last_used_at: new Date().toISOString(),
      });

    // Keep only last 5 combinations per user
    const { data: allRecent } = await supabase
      .from('user_recent_combinations')
      .select('id')
      .eq('user_id', user.id)
      .order('last_used_at', { ascending: false });

    if (allRecent && allRecent.length > 5) {
      const toDelete = allRecent.slice(5).map((r) => r.id);
      await supabase
        .from('user_recent_combinations')
        .delete()
        .in('id', toDelete);
    }
  }

  return { success: true, data: undefined };
}

// ============================================
// UPDATE TIME ENTRY (Story 4.5)
// ============================================

interface UpdateTimeEntryInput {
  jobId: string;
  serviceId: string;
  taskId: string | null;
  durationHours: number;
  entryDate: string;
  notes?: string;
}

/**
 * Update an existing time entry
 * Story 4.5 - AC3: Edit form submission
 * Story 4.5 - AC4: 7-day edit restriction (server-side enforcement)
 * Story 4.5 - AC5: Audit log (handled by database trigger in Story 8.6)
 */
export async function updateTimeEntry(
  entryId: string,
  input: UpdateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  // Validate UUID formats
  if (!isValidUUID(entryId)) {
    return { success: false, error: 'Invalid entry ID format' };
  }
  if (!isValidUUID(input.jobId)) {
    return { success: false, error: 'Invalid job ID format' };
  }
  if (!isValidUUID(input.serviceId)) {
    return { success: false, error: 'Invalid service ID format' };
  }
  if (input.taskId && !isValidUUID(input.taskId)) {
    return { success: false, error: 'Invalid task ID format' };
  }

  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get existing entry (RLS will ensure ownership)
  const { data: existingEntry, error: fetchError } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (fetchError || !existingEntry) {
    return { success: false, error: 'Entry not found' };
  }

  // Check 7-day edit restriction (AC4 - server-side enforcement)
  if (!canEditEntry(existingEntry.entry_date)) {
    return {
      success: false,
      error: `Cannot edit entries older than ${EDIT_WINDOW_DAYS_CONST} days`,
    };
  }

  // Convert hours to minutes for storage
  const durationMinutes = hoursToMinutes(input.durationHours);

  // Update entry
  const { data: updatedEntry, error: updateError } = await supabase
    .from('time_entries')
    .update({
      job_id: input.jobId,
      service_id: input.serviceId,
      task_id: input.taskId,
      duration_minutes: durationMinutes,
      entry_date: input.entryDate,
      notes: input.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .select()
    .single();

  if (updateError) {
    console.error('Failed to update time entry:', updateError);
    return { success: false, error: 'Failed to update. Please try again.' };
  }

  // Revalidate paths to refresh UI
  revalidatePath('/dashboard');
  revalidatePath('/entry');

  return { success: true, data: updatedEntry };
}

// ============================================
// GET ENTRY WITH DETAILS (Story 4.5)
// ============================================

/**
 * Get a single time entry with all related details
 * Used for viewing and editing entry details
 */
export async function getEntryWithDetails(
  entryId: string
): Promise<ActionResult<TimeEntryWithDetails>> {
  if (!isValidUUID(entryId)) {
    return { success: false, error: 'Invalid entry ID format' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs (
        id,
        name,
        job_no,
        project:projects (
          id,
          name,
          client:clients (
            id,
            name
          )
        )
      ),
      service:services (
        id,
        name
      ),
      task:tasks (
        id,
        name
      )
    `)
    .eq('id', entryId)
    .single();

  if (error) {
    console.error('Failed to get entry details:', error);
    return { success: false, error: 'Entry not found' };
  }

  // Type assertion - Supabase returns nested objects
  const transformed = data as unknown as TimeEntryWithDetails;

  return { success: true, data: transformed };
}

// ============================================
// GET USER ENTRIES (Story 4.5 - for entry list)
// ============================================

/**
 * Get user's time entries for a date range
 * Returns entries with full details for display
 */
export async function getUserEntries(
  options: { limit?: number; offset?: number } = {}
): Promise<ActionResult<TimeEntryWithDetails[]>> {
  const { limit = 10, offset = 0 } = options;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs (
        id,
        name,
        job_no,
        project:projects (
          id,
          name,
          client:clients (
            id,
            name
          )
        )
      ),
      service:services (
        id,
        name
      ),
      task:tasks (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to get user entries:', error);
    return { success: false, error: 'Failed to load entries' };
  }

  const entries = (data ?? []) as unknown as TimeEntryWithDetails[];
  return { success: true, data: entries };
}

// ============================================
// DELETE TIME ENTRY (Story 4.6 - Soft Delete)
// ============================================

/**
 * Delete a time entry (soft delete)
 * Story 4.6 - AC3: Delete success
 * Story 4.6 - AC5: Audit log (handled by database trigger)
 * Story 4.6 - AC6: Soft delete implementation
 */
export async function deleteTimeEntry(
  entryId: string
): Promise<ActionResult<void>> {
  if (!isValidUUID(entryId)) {
    return { success: false, error: 'Invalid entry ID format' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Soft delete: set deleted_at timestamp instead of actual delete
  // RLS policy ensures user can only delete their own entries
  // Database trigger will record this as a DELETE action in audit_logs
  // Note: Unlike edit, delete is allowed for entries of any age (AC1: visible for all entries)
  const { data: updatedEntry, error: updateError } = await supabase
    .from('time_entries')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .eq('user_id', user.id) // Extra safety check
    .eq('deleted_at', null) // Prevent double-delete (Fix #3: race condition)
    .select('id')
    .single();

  if (updateError) {
    // PGRST116 = no rows returned (entry not found or already deleted)
    if (updateError.code === 'PGRST116') {
      return { success: false, error: 'Entry not found or already deleted' };
    }
    console.error('Failed to delete time entry:', updateError);
    return { success: false, error: 'Failed to delete entry' };
  }

  // Fix #2: Verify a row was actually updated
  if (!updatedEntry) {
    return { success: false, error: 'Entry not found or already deleted' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/entry');

  return { success: true, data: undefined };
}
