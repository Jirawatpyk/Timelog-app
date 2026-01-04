/**
 * Departments List Component (Server Component)
 * Story 3.7: Department Management (AC: 1, 2)
 *
 * Server component that fetches departments and passes to client component.
 * Note: Department management is restricted to super_admin only.
 */

import { createClient } from '@/lib/supabase/server';
import { DepartmentsListClient } from './DepartmentsListClient';

export async function DepartmentsList() {
  const supabase = await createClient();

  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('active', { ascending: false })
    .order('name');

  return <DepartmentsListClient initialDepartments={departments ?? []} />;
}
