// src/lib/queries/team.ts
import { createClient } from '@/lib/supabase/server';
import type { ManagerDepartment, TeamMember } from '@/types/team';

export async function getManagerDepartments(
  userId: string,
  isAdmin: boolean
): Promise<ManagerDepartment[]> {
  const supabase = await createClient();

  if (isAdmin) {
    // Admin sees all departments
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Manager sees only assigned departments
  const { data, error } = await supabase
    .from('manager_departments')
    .select(
      `
      department:departments!inner(id, name)
    `
    )
    .eq('manager_id', userId);

  if (error) throw error;

  type DepartmentRow = {
    department: {
      id: string;
      name: string;
    };
  };

  return (data || []).map((row: DepartmentRow) => ({
    id: row.department.id,
    name: row.department.name,
  }));
}

export async function getTeamMembers(
  departmentIds: string[]
): Promise<TeamMember[]> {
  if (departmentIds.length === 0) return [];

  const supabase = await createClient();

  // TODO: Epic 7 - Add .eq('active', true) when users.active column is added
  // This will filter out deactivated users from team dashboard
  const { data, error } = await supabase
    .from('users')
    .select(
      `
      id,
      email,
      display_name,
      role,
      department_id,
      department:departments!inner(name)
    `
    )
    .in('department_id', departmentIds)
    .order('display_name');

  if (error) throw error;

  type UserRow = {
    id: string;
    email: string;
    display_name: string | null;
    role: string | null;
    department_id: string | null;
    department: {
      name: string;
    } | null;
  };

  return (data || []).map((user: UserRow) => ({
    id: user.id,
    email: user.email,
    displayName: user.display_name || user.email.split('@')[0],
    departmentId: user.department_id,
    departmentName: user.department?.name || '',
    role: user.role as 'staff' | 'manager' | 'admin' | 'super_admin',
  }));
}
