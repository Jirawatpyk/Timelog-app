// src/types/team.ts

export interface TeamMember {
  id: string;
  email: string;
  displayName: string;
  departmentId: string;
  departmentName: string;
  role: 'staff' | 'manager' | 'admin' | 'super_admin';
}

export interface ManagerDepartment {
  id: string;
  name: string;
}

export interface TeamDashboardData {
  departments: ManagerDepartment[];
  members: TeamMember[];
  // Stats will be added in Story 6.4
}

export interface TeamMemberWithStats extends TeamMember {
  totalHours: number; // Total hours logged today
  entryCount: number; // Number of entries today
  hasLoggedToday: boolean; // true if entryCount > 0
  isComplete: boolean; // true if totalHours >= 8
}

export interface TeamMembersGrouped {
  logged: TeamMemberWithStats[]; // Members who logged today
  notLogged: TeamMemberWithStats[]; // Members who haven't logged
}

// ============================================
// TEAM STATS TYPES (Story 6.4)
// ============================================

/**
 * Aggregated team statistics for a given period
 */
export interface TeamStats {
  totalHours: number; // Sum of all hours logged
  memberCount: number; // Total team members
  loggedCount: number; // Members who have logged
  averageHours: number; // Average hours per logged member
}

/**
 * Daily breakdown for weekly view
 */
export interface DailyBreakdown {
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfWeek: string; // Short day name (Mon, Tue, etc.)
  totalHours: number; // Total hours for this day
  isToday: boolean; // Highlight indicator
}

/**
 * Period type for team stats queries
 */
export type TeamStatsPeriod = 'today' | 'week';
