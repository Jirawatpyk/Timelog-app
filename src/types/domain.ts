import type { Database } from './database.types';

// Table row types
export type Department = Database['public']['Tables']['departments']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];

// New types for Story 1.3
export type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
export type ManagerDepartment = Database['public']['Tables']['manager_departments']['Row'];
export type UserRecentCombination = Database['public']['Tables']['user_recent_combinations']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// Insert types
export type DepartmentInsert = Database['public']['Tables']['departments']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type ServiceInsert = Database['public']['Tables']['services']['Insert'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

// Insert types for Story 1.3
export type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert'];
export type ManagerDepartmentInsert = Database['public']['Tables']['manager_departments']['Insert'];
export type UserRecentCombinationInsert = Database['public']['Tables']['user_recent_combinations']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

// Update types
export type DepartmentUpdate = Database['public']['Tables']['departments']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];
export type ServiceUpdate = Database['public']['Tables']['services']['Update'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Update types for Story 1.3
export type TimeEntryUpdate = Database['public']['Tables']['time_entries']['Update'];
export type ManagerDepartmentUpdate = Database['public']['Tables']['manager_departments']['Update'];
export type UserRecentCombinationUpdate = Database['public']['Tables']['user_recent_combinations']['Update'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];

// User roles
export type UserRole = 'staff' | 'manager' | 'admin' | 'super_admin';

// Audit action type
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

// Server Action result type
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================
// EXTENDED TYPES FOR JOINED QUERIES (Story 3.4)
// ============================================

/**
 * Time entry with all related names for display
 * Used for historical entries where we need to show names even if items are inactive
 */
export interface TimeEntryWithDetails extends TimeEntry {
  job: {
    id: string;
    name: string;
    job_no: string | null;
    project: {
      id: string;
      name: string;
      client: {
        id: string;
        name: string;
      };
    };
  };
  service: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    name: string;
  } | null;
}

// ============================================
// EXTENDED TYPES FOR MASTER DATA (Story 3.6)
// ============================================

/**
 * Project with client name for display in admin list
 */
export interface ProjectWithClient extends Project {
  clientName: string;
}

/**
 * Job with project and client names for display in admin list
 */
export interface JobWithProject extends Job {
  projectName: string;
  clientName: string;
  clientId: string;
}

// ============================================
// RECENT COMBINATIONS TYPE (Story 4.7)
// ============================================

/**
 * Recent combination with joined data for display
 * Used for quick entry feature on /entry page
 */
export interface RecentCombination {
  id: string;
  userId: string;
  clientId: string;
  projectId: string;
  jobId: string;
  serviceId: string;
  taskId: string | null;
  lastUsedAt: string;
  // Joined data for display
  client: { id: string; name: string };
  project: { id: string; name: string };
  job: { id: string; name: string; jobNo: string | null };
  service: { id: string; name: string };
  task: { id: string; name: string } | null;
}

// ============================================
// DEPARTMENT FILTER TYPES (Story 6.5)
// ============================================

/**
 * Department option for filter dropdown
 */
export interface DepartmentOption {
  id: string;
  name: string;
}

/**
 * Department filter for URL params
 * 'all' means show all departments, otherwise specific department ID
 */
export type DepartmentFilter = 'all' | string;

// ============================================
// USER LIST TYPES (Story 7.1)
// ============================================

/**
 * User item for admin user list display
 */
export interface UserListItem {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  department: { id: string; name: string } | null;
  isActive: boolean;
}

/**
 * Response type for paginated user list
 */
export interface UserListResponse {
  users: UserListItem[];
  totalCount: number;
}

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
  page: number;
  limit: number;
}
