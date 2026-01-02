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
 * Returns total hours, entry count, top client, and monthly stats (for month period)
 *
 * Story 5.4: Added period parameter for monthly stats calculation
 */
export async function getDashboardStats(
  dateRange: DateRange,
  period?: 'today' | 'week' | 'month'
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
      entry_date,
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

  // Calculate period-specific stats (Story 5.4, 5.5)
  let daysWithEntries: number | undefined;
  let averagePerDay: number | undefined;
  let weeksInMonth: number | undefined;
  let averagePerWeek: number | undefined;

  // Calculate days with entries for week and month periods
  if (period === 'week' || period === 'month') {
    const uniqueDates = new Set(
      entries?.map((e) => (e as { entry_date: string }).entry_date) || []
    );
    daysWithEntries = uniqueDates.size;

    // Calculate average per day based on actual days with entries
    if (daysWithEntries > 0) {
      averagePerDay = totalHours / daysWithEntries;
    }
  }

  // Calculate monthly-specific stats
  if (period === 'month') {
    const year = dateRange.start.getFullYear();
    const month = dateRange.start.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Count weeks by counting how many Mondays (or partial weeks) there are
    let weekCount = 0;
    const current = new Date(firstDay);
    while (current <= lastDay) {
      weekCount++;
      // Move to next Monday
      const daysUntilMonday = current.getDay() === 0 ? 1 : 8 - current.getDay();
      current.setDate(current.getDate() + daysUntilMonday);
    }
    weeksInMonth = weekCount;

    // Calculate average per week
    if (weeksInMonth > 0) {
      averagePerWeek = totalHours / weeksInMonth;
    }
  }

  return {
    totalHours,
    entryCount: entries?.length || 0,
    topClient,
    daysWithEntries,
    averagePerDay,
    weeksInMonth,
    averagePerWeek,
  };
}
