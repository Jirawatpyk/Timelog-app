'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  ActionResult,
  PaginationParams,
  UserListItem,
  UserListResponse,
  UserRole,
} from '@/types/domain';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Get paginated list of users for admin user management
 * @param params - Pagination parameters (page, limit)
 * @returns ActionResult with users array and total count
 */
export async function getUsers(
  params: PaginationParams = { page: 1, limit: DEFAULT_PAGE_SIZE }
): Promise<ActionResult<UserListResponse>> {
  const supabase = await createClient();

  const { page, limit } = params;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('users')
    .select(
      `
      id,
      email,
      display_name,
      role,
      is_active,
      department:departments(id, name)
    `,
      { count: 'exact' }
    )
    .range(offset, offset + limit - 1)
    .order('display_name', { ascending: true, nullsFirst: false });

  if (error) {
    return { success: false, error: error.message };
  }

  // Transform snake_case to camelCase at boundary
  // Note: Supabase returns FK joins based on relationship type
  const users: UserListItem[] = (data ?? []).map((row) => {
    // Handle department which can be null, object, or array (Supabase types)
    // Runtime: single FK returns object, type system says array - use unknown bridge
    const deptData = row.department as unknown;
    let dept: { id: string; name: string } | null = null;
    if (deptData && typeof deptData === 'object' && 'id' in deptData) {
      dept = deptData as { id: string; name: string };
    }
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role as UserRole,
      department: dept,
      isActive: row.is_active,
    };
  });

  return {
    success: true,
    data: {
      users,
      totalCount: count ?? 0,
    },
  };
}
