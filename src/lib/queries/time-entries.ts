/**
 * Time Entry Query Functions
 * Story 3.4: Soft Delete Protection (AC: 3)
 *
 * These functions provide queries for time entries with JOINed data:
 * - Historical entries show names even for inactive master data
 * - Used for dashboard, reports, and entry editing
 */

import { createClient } from '@/lib/supabase/server';
import type { TimeEntryWithDetails } from '@/types/domain';

/**
 * Get a single time entry with all related names
 * Used for viewing/editing historical entries
 */
export async function getTimeEntryWithDetails(id: string): Promise<TimeEntryWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs!inner(
        id,
        name,
        job_no,
        project:projects!inner(
          id,
          name,
          client:clients!inner(
            id,
            name
          )
        )
      ),
      service:services!inner(
        id,
        name
      ),
      task:tasks(
        id,
        name
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as TimeEntryWithDetails | null;
}

/**
 * Get user's time entries for a date range with all related names
 * Used for dashboard and personal reports
 */
export async function getUserTimeEntries(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntryWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs!inner(
        id,
        name,
        job_no,
        project:projects!inner(
          id,
          name,
          client:clients!inner(
            id,
            name
          )
        )
      ),
      service:services!inner(
        id,
        name
      ),
      task:tasks(
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TimeEntryWithDetails[];
}

/**
 * Get time entries for a specific date with all related names
 * Used for "today's entries" view
 */
export async function getUserTimeEntriesForDate(
  userId: string,
  date: string
): Promise<TimeEntryWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs!inner(
        id,
        name,
        job_no,
        project:projects!inner(
          id,
          name,
          client:clients!inner(
            id,
            name
          )
        )
      ),
      service:services!inner(
        id,
        name
      ),
      task:tasks(
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .eq('entry_date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TimeEntryWithDetails[];
}

/**
 * Get department time entries (for managers)
 */
export async function getDepartmentTimeEntries(
  departmentId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntryWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs!inner(
        id,
        name,
        job_no,
        project:projects!inner(
          id,
          name,
          client:clients!inner(
            id,
            name
          )
        )
      ),
      service:services!inner(
        id,
        name
      ),
      task:tasks(
        id,
        name
      )
    `)
    .eq('department_id', departmentId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TimeEntryWithDetails[];
}
