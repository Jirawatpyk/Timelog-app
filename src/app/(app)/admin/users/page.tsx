import { getUsers, getActiveDepartments } from '@/actions/user';
import { UserTable } from './components/UserTable';
import { AddUserDialog } from './components/AddUserDialog';
import { UserFiltersClient } from './components/UserFiltersClient';
import { EmptyFilterState } from './components/EmptyFilterState';
import { Pagination } from '@/components/shared/Pagination';
import { createClient } from '@/lib/supabase/server';
import type { UserFilters, UserRole, UserStatus } from '@/types/domain';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    dept?: string;
    role?: string;
    status?: string;
    q?: string;
  }>;
}

const PAGE_SIZE = 20;

/**
 * Admin Users Page - Story 7.1, 7.2, 7.7
 * Server Component fetching paginated user list with filters
 *
 * Story 7.1:
 * - AC 1: Displays list of all users with Name, Email, Role, Department, Status
 * - AC 2: Pagination with 20 users per page
 * - AC 4: Super admin can see all users including other admins
 *
 * Story 7.2:
 * - Add User button to open create user dialog
 *
 * Story 7.7:
 * - Filter by Department, Role, Status
 * - Search by name or email
 * - Filter chips with clear options
 * - URL-based filter state
 */
export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  // Parse filters from URL params (Story 7.7)
  const filters: UserFilters = {
    departmentId: params.dept || undefined,
    role: (params.role as UserRole) || undefined,
    status: (params.status as UserStatus) || undefined,
    search: params.q || undefined,
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(Boolean);

  // Get current user ID for self-deactivation check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? '';

  // Fetch users with filters and departments in parallel
  const [usersResult, departmentsResult] = await Promise.all([
    getUsers({ page: currentPage, limit: PAGE_SIZE }, filters),
    getActiveDepartments(),
  ]);

  if (!usersResult.success) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground">Failed to load users: {usersResult.error}</p>
      </div>
    );
  }

  const { users, totalCount } = usersResult.data;
  const departments = departmentsResult.success ? departmentsResult.data : [];
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="py-6 space-y-6">
      {/* Header with filters and Add User button - Story 7.1, 7.2, 7.7 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? `${totalCount} ${totalCount === 1 ? 'user' : 'users'} found`
                : `Total: ${totalCount} ${totalCount === 1 ? 'user' : 'users'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UserFiltersClient departments={departments} />
            <AddUserDialog />
          </div>
        </div>
      </div>

      {/* User table or empty state */}
      {users.length === 0 && hasActiveFilters ? (
        <EmptyFilterState />
      ) : (
        <UserTable users={users} currentUserId={currentUserId} />
      )}

      {/* Pagination - AC 2, Story 7.7: Preserve filters */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/admin/users"
          searchParams={{
            dept: params.dept,
            role: params.role,
            status: params.status,
            q: params.q,
          }}
        />
      )}
    </div>
  );
}
