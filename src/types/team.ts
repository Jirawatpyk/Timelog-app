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
