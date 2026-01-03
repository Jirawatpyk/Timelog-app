// src/app/(app)/team/page.tsx
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { checkManagerAccess } from '@/lib/auth/check-manager-access';
import { getManagerDepartments, getTeamMembers } from '@/lib/queries/team';
import { TeamDashboard } from '@/components/team/TeamDashboard';
import { TeamDashboardSkeleton } from '@/components/team/TeamDashboardSkeleton';

export default async function TeamPage() {
  const { canAccess, userId, isAdmin } = await checkManagerAccess();

  if (!canAccess) {
    // Redirect with message (toast handled client-side)
    redirect('/dashboard?error=no-access');
  }

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<TeamDashboardSkeleton />}>
        <TeamDashboardContent userId={userId} isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}

async function TeamDashboardContent({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const departments = await getManagerDepartments(userId, isAdmin);
  const members = await getTeamMembers(departments.map((d) => d.id));

  return <TeamDashboard departments={departments} members={members} />;
}
