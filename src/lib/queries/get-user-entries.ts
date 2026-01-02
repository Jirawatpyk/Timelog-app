/**
 * User Entries Queries - Story 5.1
 *
 * Server-side query functions for fetching user time entries.
 * Used by Dashboard page (Server Components).
 */

import { createClient } from '@/lib/supabase/server';
import type { DateRange, DashboardStats } from '@/types/dashboard';
import type { TimeEntryWithDetails } from '@/types/domain';

/**
 * Fetch user's time entries for a date range
 * Returns entries with all related data (job > project > client, service, task)
 */
export async function getUserEntries(
  dateRange: DateRange
): Promise<TimeEntryWithDetails[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select(
      `
      *,
      job:jobs(
        id, name, job_no,
        project:projects(
          id, name,
          client:clients(id, name)
        )
      ),
      service:services(id, name),
      task:tasks(id, name)
    `
    )
    .eq('user_id', user.id)
    .gte('entry_date', dateRange.start.toISOString().split('T')[0])
    .lte('entry_date', dateRange.end.toISOString().split('T')[0])
    .is('deleted_at', null)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as unknown as TimeEntryWithDetails[]) || [];
}

/**
 * Calculate dashboard statistics for a date range
 * Returns total hours, entry count, and top client
 */
export async function getDashboardStats(
  dateRange: DateRange
): Promise<DashboardStats> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get entries for stats calculation
  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(
      `
      duration_minutes,
      job:jobs(
        project:projects(
          client:clients(id, name)
        )
      )
    `
    )
    .eq('user_id', user.id)
    .gte('entry_date', dateRange.start.toISOString().split('T')[0])
    .lte('entry_date', dateRange.end.toISOString().split('T')[0])
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  // Calculate total hours
  const totalMinutes =
    entries?.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0;
  const totalHours = totalMinutes / 60;

  // Calculate top client
  const clientHours: Record<string, { name: string; hours: number }> = {};

  entries?.forEach((entry) => {
    // Type assertion for nested query result
    const job = entry.job as { project?: { client?: { id: string; name: string } } } | null;
    const client = job?.project?.client;

    if (client) {
      if (!clientHours[client.id]) {
        clientHours[client.id] = { name: client.name, hours: 0 };
      }
      clientHours[client.id].hours += (entry.duration_minutes || 0) / 60;
    }
  });

  const topClient = Object.entries(clientHours)
    .sort((a, b) => b[1].hours - a[1].hours)
    .map(([id, data]) => ({ id, ...data }))[0];

  return {
    totalHours,
    entryCount: entries?.length || 0,
    topClient,
  };
}
