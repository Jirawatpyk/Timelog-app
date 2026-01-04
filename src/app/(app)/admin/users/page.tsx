import { getUsers } from '@/actions/user';
import { UserTable } from './components/UserTable';
import { AddUserDialog } from './components/AddUserDialog';
import { Pagination } from '@/components/shared/Pagination';
import { createClient } from '@/lib/supabase/server';

interface UsersPageProps {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

/**
 * Admin Users Page - Story 7.1, 7.2
 * Server Component fetching paginated user list
 *
 * Story 7.1:
 * - AC 1: Displays list of all users with Name, Email, Role, Department, Status
 * - AC 2: Pagination with 20 users per page
 * - AC 4: Super admin can see all users including other admins
 *
 * Story 7.2:
 * - Add User button to open create user dialog
 */
export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  // Get current user ID for self-deactivation check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? '';

  const result = await getUsers({ page: currentPage, limit: PAGE_SIZE });

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground">Failed to load users: {result.error}</p>
      </div>
    );
  }

  const { users, totalCount } = result.data;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="py-6 space-y-6">
      {/* Header with total count and Add User button - Story 7.1 AC 1, Story 7.2 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Total: {totalCount} {totalCount === 1 ? 'user' : 'users'}
          </p>
        </div>
        <AddUserDialog />
      </div>

      {/* User table - AC 1, AC 5 (empty state handled in UserTable) */}
      {/* Story 7.4: Pass currentUserId for self-deactivation check */}
      <UserTable users={users} currentUserId={currentUserId} />

      {/* Pagination - AC 2 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/admin/users"
        />
      )}
    </div>
  );
}
