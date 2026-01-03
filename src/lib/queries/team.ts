// src/lib/queries/team.ts
import { createClient } from '@/lib/supabase/server';
import { formatLocalDate } from '@/lib/utils';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday } from 'date-fns';
import type {
  TeamMember,
  TeamMemberWithStats,
  TeamMembersGrouped,
  TeamStats,
  DailyBreakdown,
  TeamStatsPeriod,
} from '@/types/team';
import type { ActionResult, DepartmentOption } from '@/types/domain';

export async function getManagerDepartments(
  userId: string,
  isAdmin: boolean
): Promise<ActionResult<DepartmentOption[]>> {
  const supabase = await createClient();

  if (isAdmin) {
    // Admin sees all departments
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .eq('active', true)
      .order('name');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
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

  if (error) {
    return { success: false, error: error.message };
  }

  // Type assertion needed because Supabase infers join as array
  type DepartmentRow = {
    department: {
      id: string;
      name: string;
    };
  };

  const departments = ((data || []) as unknown as DepartmentRow[]).map((row) => ({
    id: row.department.id,
    name: row.department.name,
  }));

  return { success: true, data: departments };
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

  // Type assertion needed because Supabase infers join as array
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

  const users = (data || []) as unknown as UserRow[];

  // Filter and map (skip any without department_id for data integrity)
  return users
    .filter((user) => user.department_id && user.department)
    .map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name || user.email.split('@')[0],
      departmentId: user.department_id!,
      departmentName: user.department!.name,
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
  const today = formatLocalDate(new Date());

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

  // Type assertion needed because Supabase infers join as array
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

  const membersList = (members || []) as unknown as UserRow[];

  // Filter and map members (skip any without department_id for data integrity)
  membersList
    .filter((member) => member.department_id && member.department)
    .forEach((member) => {
      const stats = statsMap.get(member.id);
      const totalHours = stats ? stats.totalMinutes / 60 : 0;
      const entryCount = stats?.count || 0;

      const memberWithStats: TeamMemberWithStats = {
        id: member.id,
        email: member.email,
        displayName: member.display_name || member.email.split('@')[0],
        departmentId: member.department_id!,
        departmentName: member.department!.name,
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

  // Sort notLogged alphabetically (English locale per project-context.md)
  notLogged.sort((a, b) => a.displayName.localeCompare(b.displayName, 'en'));

  return { logged, notLogged };
}

// ============================================
// STORY 6.4: Team Stats Functions
// ============================================

/**
 * Get aggregated team statistics for a given period
 */
export async function getTeamStats(
  period: TeamStatsPeriod,
  departmentIds: string[]
): Promise<ActionResult<TeamStats>> {
  // Return empty stats if no departments
  if (departmentIds.length === 0) {
    return {
      success: true,
      data: {
        totalHours: 0,
        memberCount: 0,
        loggedCount: 0,
        averageHours: 0,
      },
    };
  }

  const supabase = await createClient();
  const today = new Date();

  // Get all team members in departments
  const { data: members, error: membersError } = await supabase
    .from('users')
    .select('id')
    .in('department_id', departmentIds);

  if (membersError) {
    return { success: false, error: membersError.message };
  }

  const memberIds = (members || []).map((m) => m.id);
  const memberCount = memberIds.length;

  if (memberCount === 0) {
    return {
      success: true,
      data: {
        totalHours: 0,
        memberCount: 0,
        loggedCount: 0,
        averageHours: 0,
      },
    };
  }

  // Build date filter based on period
  let entriesQuery = supabase
    .from('time_entries')
    .select('user_id, duration_minutes')
    .in('user_id', memberIds);

  if (period === 'today') {
    const todayStr = format(today, 'yyyy-MM-dd');
    entriesQuery = entriesQuery.eq('entry_date', todayStr);
  } else {
    // Week period - Monday to Sunday
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    entriesQuery = entriesQuery
      .gte('entry_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('entry_date', format(weekEnd, 'yyyy-MM-dd'));
  }

  const { data: entries, error: entriesError } = await entriesQuery;

  if (entriesError) {
    return { success: false, error: entriesError.message };
  }

  // Calculate stats
  let totalMinutes = 0;
  const loggedUserIds = new Set<string>();

  (entries || []).forEach((entry) => {
    totalMinutes += entry.duration_minutes;
    loggedUserIds.add(entry.user_id);
  });

  const totalHours = totalMinutes / 60;
  const loggedCount = loggedUserIds.size;
  const averageHours = loggedCount > 0 ? totalHours / loggedCount : 0;

  return {
    success: true,
    data: {
      totalHours,
      memberCount,
      loggedCount,
      averageHours,
    },
  };
}

/**
 * Get weekly breakdown of hours by day
 */
export async function getWeeklyBreakdown(
  departmentIds: string[]
): Promise<ActionResult<DailyBreakdown[]>> {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Generate all 7 days of the week
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Return empty breakdown if no departments
  if (departmentIds.length === 0) {
    return {
      success: true,
      data: weekDays.map((day) => ({
        date: format(day, 'yyyy-MM-dd'),
        dayOfWeek: format(day, 'EEE'),
        totalHours: 0,
        isToday: isToday(day),
      })),
    };
  }

  const supabase = await createClient();

  // Get entries for the week
  const { data: entries, error } = await supabase
    .from('time_entries')
    .select('entry_date, duration_minutes')
    .in('department_id', departmentIds)
    .gte('entry_date', format(weekStart, 'yyyy-MM-dd'))
    .lte('entry_date', format(weekEnd, 'yyyy-MM-dd'));

  if (error) {
    return { success: false, error: error.message };
  }

  // Aggregate hours by date
  const hoursByDate = new Map<string, number>();
  (entries || []).forEach((entry) => {
    const current = hoursByDate.get(entry.entry_date) || 0;
    hoursByDate.set(entry.entry_date, current + entry.duration_minutes);
  });

  // Build breakdown
  const breakdown: DailyBreakdown[] = weekDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const totalMinutes = hoursByDate.get(dateStr) || 0;
    return {
      date: dateStr,
      dayOfWeek: format(day, 'EEE'),
      totalHours: totalMinutes / 60,
      isToday: isToday(day),
    };
  });

  return { success: true, data: breakdown };
}
