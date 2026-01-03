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
