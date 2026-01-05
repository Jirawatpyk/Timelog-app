import { createClient } from '@/lib/supabase/server';
import type { AuditLog, ActionResult } from '@/types/domain';

/**
 * Get audit logs for a specific time entry
 * Returns all audit records (INSERT, UPDATE, DELETE) for the given entry ID
 */
export async function getAuditLogsForEntry(
  entryId: string
): Promise<ActionResult<AuditLog[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('table_name', 'time_entries')
    .eq('record_id', entryId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data ?? [] };
}

/**
 * Get audit logs for a specific user
 * Returns all audit records where the entry belonged to the given user
 * @param userId - The user ID to filter by
 * @param limit - Maximum number of records to return (default 50)
 */
export async function getAuditLogsByUser(
  userId: string,
  limit = 50
): Promise<ActionResult<AuditLog[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data ?? [] };
}

/**
 * Get audit logs within a date range
 * Returns audit records between startDate and endDate (inclusive)
 * @param startDate - Start date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 * @param endDate - End date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 * @param limit - Maximum number of records to return (default 100)
 */
export async function getAuditLogsByDateRange(
  startDate: string,
  endDate: string,
  limit = 100
): Promise<ActionResult<AuditLog[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data ?? [] };
}
