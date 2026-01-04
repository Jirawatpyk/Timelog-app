/**
 * User Entries Queries - Story 5.1, 5.6, 5.7, 5.8
 *
 * Server-side query functions for fetching user time entries.
 * Used by Dashboard page (Server Components).
 *
 * Story 5.7: Added search filtering across multiple fields.
 * Story 5.8: Added first-time user detection.
 * Epic 5 Action Item #3: Added performance monitoring (dev mode only).
 */

import { createClient } from '@/lib/supabase/server';
import { formatLocalDate } from '@/lib/utils';
import type { DateRange, DashboardStats, FilterState, ClientOption } from '@/types/dashboard';
import type { TimeEntryWithDetails } from '@/types/domain';

/**
 * Performance monitoring utility for dashboard queries.
 * Logs query timing in development mode only.
 *
 * Target: <200ms p95 per NFR-P6 (API Response Time)
 * Check server logs for timing data to identify slow queries.
 *
 * TODO: Replace with proper observability tool (Datadog/Sentry) for production monitoring.
 */
const perfLog = {
  start: (label: string): string => {
    if (process.env.NODE_ENV === 'development') {
      const uniqueLabel = `${label}:${Date.now()}`;
      console.time(uniqueLabel);
      return uniqueLabel;
    }
    return label;
  },
  end: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(label);
    }
  },
};

/**
 * Fetch user's time entries for a date range
 * Returns entries with all related data (job > project > client, service, task)
 *
 * Story 5.6: Added optional filter parameter for client filtering
 * Story 5.7: Added search filtering with client-side text matching
 */
export async function getUserEntries(
  dateRange: DateRange,
  filter?: FilterState
): Promise<TimeEntryWithDetails[]> {
  const perfLabelBase = `getUserEntries${filter?.clientId ? ':filter' : ''}${filter?.searchQuery ? ':search' : ''}`;
  const perfLabel = perfLog.start(perfLabelBase);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Build base query
  let query = supabase
    .from('time_entries')
    .select(
      `
      *,
      job:jobs!inner(
        id, name, job_no,
        project:projects!inner(
          id, name,
          client:clients!inner(id, name)
        )
      ),
      service:services(id, name),
      task:tasks(id, name)
    `
    )
    .eq('user_id', user.id)
    .gte('entry_date', formatLocalDate(dateRange.start))
    .lte('entry_date', formatLocalDate(dateRange.end))
    .is('deleted_at', null);

  // Apply client filter if provided
  if (filter?.clientId) {
    query = query.eq('job.project.client.id', filter.clientId);
  }

  const { data, error } = await query
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  let entries = (data as unknown as TimeEntryWithDetails[]) || [];

  // Story 5.7: Apply client-side search filter for complex multi-field matching
  if (filter?.searchQuery && filter.searchQuery.length >= 2) {
    entries = filterEntriesBySearch(entries, filter.searchQuery);
  }

  perfLog.end(perfLabel);
  return entries;
}

/**
 * Story 5.7: Filter entries by search query
 *
 * Searches across multiple fields (case-insensitive, partial matches):
 * - Client name
 * - Project name
 * - Job name
 * - Job number (job_no)
 * - Service name
 * - Task name
 * - Notes
 */
function filterEntriesBySearch(
  entries: TimeEntryWithDetails[],
  searchQuery: string
): TimeEntryWithDetails[] {
  const searchLower = searchQuery.toLowerCase();

  return entries.filter((entry) => {
    const searchableFields = [
      entry.job?.project?.client?.name,
      entry.job?.project?.name,
      entry.job?.name,
      entry.job?.job_no,
      entry.service?.name,
      entry.task?.name,
      entry.notes,
    ];

    return searchableFields.some(
      (field) => field?.toLowerCase().includes(searchLower)
    );
  });
}

/**
 * Calculate dashboard statistics for a date range
 * Returns total hours, entry count, top client, and monthly stats (for month period)
 *
 * Story 5.4: Added period parameter for monthly stats calculation
 * Story 5.6: Added filter parameter for client filtering
 * Story 5.7: Added search filter support for stats to reflect search results
 */
export async function getDashboardStats(
  dateRange: DateRange,
  period?: 'today' | 'week' | 'month',
  filter?: FilterState
): Promise<DashboardStats> {
  const perfLabelBase = `getDashboardStats:${period || 'all'}${filter?.clientId ? ':filter' : ''}${filter?.searchQuery ? ':search' : ''}`;
  const perfLabel = perfLog.start(perfLabelBase);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Build base query for stats calculation
  // Story 5.7: Include all searchable fields for client-side search filtering
  let query = supabase
    .from('time_entries')
    .select(
      `
      duration_minutes,
      entry_date,
      notes,
      job:jobs!inner(
        name,
        job_no,
        project:projects!inner(
          name,
          client:clients!inner(id, name)
        )
      ),
      service:services(name),
      task:tasks(name)
    `
    )
    .eq('user_id', user.id)
    .gte('entry_date', formatLocalDate(dateRange.start))
    .lte('entry_date', formatLocalDate(dateRange.end))
    .is('deleted_at', null);

  // Apply client filter if provided
  if (filter?.clientId) {
    query = query.eq('job.project.client.id', filter.clientId);
  }

  const { data: rawEntries, error } = await query;

  if (error) {
    throw error;
  }

  // Story 5.7: Apply client-side search filter for stats consistency
  let entries = rawEntries || [];
  if (filter?.searchQuery && filter.searchQuery.length >= 2) {
    const searchLower = filter.searchQuery.toLowerCase();
    entries = entries.filter((entry) => {
      const job = entry.job as { name?: string; job_no?: string; project?: { name?: string; client?: { name?: string } } } | null;
      const service = entry.service as { name?: string } | null;
      const task = entry.task as { name?: string } | null;

      const searchableFields = [
        job?.project?.client?.name,
        job?.project?.name,
        job?.name,
        job?.job_no,
        service?.name,
        task?.name,
        entry.notes,
      ];
      return searchableFields.some(
        (field) => field?.toLowerCase().includes(searchLower)
      );
    });
  }

  // Calculate total hours
  const totalMinutes =
    entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0;
  const totalHours = totalMinutes / 60;

  // Calculate top client
  const clientHours: Record<string, { name: string; hours: number }> = {};

  entries.forEach((entry) => {
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
      entries.map((e) => (e as { entry_date: string }).entry_date)
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

  const stats = {
    totalHours,
    entryCount: entries.length,
    topClient,
    daysWithEntries,
    averagePerDay,
    weeksInMonth,
    averagePerWeek,
  };

  perfLog.end(perfLabel);
  return stats;
}

/**
 * Story 5.6: Get unique clients the user has logged time to
 * Returns only clients that appear in user's time entries
 *
 * Uses RPC function `get_user_clients()` for efficient DISTINCT query.
 * Falls back to JS deduplication if RPC not available.
 */
export async function getUserClients(): Promise<ClientOption[]> {
  const perfLabel = perfLog.start('getUserClients');

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Try optimized RPC first (uses DISTINCT in PostgreSQL)
  const { data: rpcClients, error: rpcError } = await supabase.rpc('get_user_clients');

  if (!rpcError && rpcClients) {
    perfLog.end(perfLabel);
    return rpcClients.map((c: { id: string; name: string }) => ({
      id: c.id,
      name: c.name,
    }));
  }

  // Fallback: Query entries and deduplicate in JS
  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(
      `
      job:jobs!inner(
        project:projects!inner(
          client:clients!inner(id, name)
        )
      )
    `
    )
    .eq('user_id', user.id)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  // Extract unique clients using Map for O(1) lookup
  const clientMap = new Map<string, string>();

  for (const entry of entries || []) {
    const job = entry.job as { project?: { client?: { id: string; name: string } } } | null;
    const client = job?.project?.client;

    if (client && !clientMap.has(client.id)) {
      clientMap.set(client.id, client.name);
    }
  }

  // Convert to array and sort alphabetically
  const clients = Array.from(clientMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  perfLog.end(perfLabel);
  return clients;
}

/**
 * Story 5.8: Check if user is a first-time user (has zero entries ever)
 *
 * Used to show a welcoming empty state for new users.
 */
export async function checkIsFirstTimeUser(): Promise<boolean> {
  const perfLabel = perfLog.start('checkIsFirstTimeUser');

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false; // Not authenticated = not first-time user (will redirect to login)
  }

  const { count, error } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('deleted_at', null);

  if (error) {
    // On error, assume not first-time to avoid showing wrong state
    perfLog.end(perfLabel);
    return false;
  }

  const isFirstTime = count === 0;
  perfLog.end(perfLabel);
  return isFirstTime;
}
