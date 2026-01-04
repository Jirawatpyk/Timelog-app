import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/domain';
import { AdminSidebar, AdminMobileHeader } from '@/components/admin';

/**
 * Admin Layout with Role-Based Access Control
 * Story 7.1: AC 3 & AC 4
 * Story 7.1a: Admin Navigation Layout
 *
 * Checks user role and restricts access to admin/super_admin only.
 * Staff and Manager users are redirected to /dashboard with error message.
 *
 * Features:
 * - AdminSidebar visible on desktop (AC: 1)
 * - AdminMobileHeader with hamburger menu on mobile (AC: 5)
 * - Content area takes remaining space (flex-1)
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?expired=true');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const allowedRoles: UserRole[] = ['admin', 'super_admin'];

  if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
    // AC 3: Redirect unauthorized users with access denied message
    // Uses existing AccessDeniedHandler component which shows toast
    redirect('/dashboard?access=denied');
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminMobileHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
