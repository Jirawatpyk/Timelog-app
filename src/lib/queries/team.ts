// src/lib/queries/team.ts
import { createClient } from '@/lib/supabase/server';
import type {
  ManagerDepartment,
  TeamMember,
  TeamMemberWithStats,
  TeamMembersGrouped,
} from '@/types/team';

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

export async function getTeamMembersWithTodayStats(
  departmentIds: string[]
): Promise<TeamMembersGrouped> {
  if (departmentIds.length === 0) {
    return { logged: [], notLogged: [] };
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get all team members
  // TODO: Epic 7 - Add .eq('active', true) when users.active column is added
  // This will filter out deactivated users from team dashboard
  const { data: members, error: membersError } = await supabase
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
    .in('department_id', departmentIds);

  if (membersError) throw membersError;

  // Get today's entries for these members
  const memberIds = (members || []).map((m) => m.id);

  const { data: entries, error: entriesError } = await supabase
    .from('time_entries')
    .select('user_id, duration_minutes')
    .in('user_id', memberIds)
    .eq('entry_date', today);

  if (entriesError) throw entriesError;

  // Aggregate entries by user
  const statsMap = new Map<string, { totalMinutes: number; count: number }>();
  (entries || []).forEach((entry) => {
    const current = statsMap.get(entry.user_id) || { totalMinutes: 0, count: 0 };
    current.totalMinutes += entry.duration_minutes;
    current.count += 1;
    statsMap.set(entry.user_id, current);
  });

  // Build result
  const logged: TeamMemberWithStats[] = [];
  const notLogged: TeamMemberWithStats[] = [];

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

  (members || []).forEach((member: UserRow) => {
    const stats = statsMap.get(member.id);
    const totalHours = stats ? stats.totalMinutes / 60 : 0;
    const entryCount = stats?.count || 0;

    const memberWithStats: TeamMemberWithStats = {
      id: member.id,
      email: member.email,
      displayName: member.display_name || member.email.split('@')[0],
      departmentId: member.department_id || '',
      departmentName: member.department?.name || '',
      role: member.role as 'staff' | 'manager' | 'admin' | 'super_admin',
      totalHours,
      entryCount,
      hasLoggedToday: entryCount > 0,
      isComplete: totalHours >= 8,
    };

    if (entryCount > 0) {
      logged.push(memberWithStats);
    } else {
      notLogged.push(memberWithStats);
    }
  });

  // Sort logged by hours descending
  logged.sort((a, b) => b.totalHours - a.totalHours);

  // Sort notLogged alphabetically
  notLogged.sort((a, b) => a.displayName.localeCompare(b.displayName, 'th'));

  return { logged, notLogged };
}
