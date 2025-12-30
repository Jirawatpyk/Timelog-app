/**
 * Time entry fixtures for RLS E2E testing
 * Story 1.4: RLS Policies for All Roles (AC: 8, 9, 10)
 */

import { testUsers, testDepartments } from '../helpers/test-users';
import { testJobs, testServices, testTasks } from './master-data';

export interface TestTimeEntry {
  id: string;
  userId: string;
  jobId: string;
  serviceId: string;
  taskId: string | null;
  durationMinutes: number;
  entryDate: string;
  departmentId: string;
  notes: string | null;
}

/**
 * Test time entries - organized by user and department for RLS testing
 * Using valid UUID v4 format
 */
export const testEntries: Record<string, TestTimeEntry> = {
  // Staff user's own entries (dept-a)
  staffEntry1: {
    id: 'f0000000-0000-4000-a000-000000000001',
    userId: testUsers.staff.id,
    jobId: testJobs.jobA.id,
    serviceId: testServices.serviceA.id,
    taskId: testTasks.taskA.id,
    durationMinutes: 60,
    entryDate: '2024-12-30',
    departmentId: testDepartments.deptA.id,
    notes: 'Staff entry in dept-a',
  },
  staffEntry2: {
    id: 'f0000000-0000-4000-a000-000000000002',
    userId: testUsers.staff.id,
    jobId: testJobs.jobA.id,
    serviceId: testServices.serviceA.id,
    taskId: null,
    durationMinutes: 90,
    entryDate: '2024-12-30',
    departmentId: testDepartments.deptA.id,
    notes: 'Another staff entry',
  },

  // Staff B's entries (dept-b) - for cross-user testing
  staffBEntry1: {
    id: 'f0000000-0000-4000-a000-000000000003',
    userId: testUsers.staffB.id,
    jobId: testJobs.jobB.id,
    serviceId: testServices.serviceB.id,
    taskId: testTasks.taskB.id,
    durationMinutes: 120,
    entryDate: '2024-12-30',
    departmentId: testDepartments.deptB.id,
    notes: 'Staff B entry in dept-b',
  },

  // Manager's own entries (dept-a)
  managerEntry1: {
    id: 'f0000000-0000-4000-a000-000000000004',
    userId: testUsers.manager.id,
    jobId: testJobs.jobA.id,
    serviceId: testServices.serviceA.id,
    taskId: testTasks.taskA.id,
    durationMinutes: 180,
    entryDate: '2024-12-30',
    departmentId: testDepartments.deptA.id,
    notes: 'Manager entry',
  },

  // Entry in dept-c (manager does NOT manage this)
  deptCEntry: {
    id: 'f0000000-0000-4000-a000-000000000005',
    userId: testUsers.admin.id, // Created by admin
    jobId: testJobs.jobA.id,
    serviceId: testServices.serviceA.id,
    taskId: null,
    durationMinutes: 45,
    entryDate: '2024-12-30',
    departmentId: testDepartments.deptC.id, // CRITICAL: dept-c not managed by manager
    notes: 'Entry in dept-c - manager should not see this',
  },

  // Admin's entries
  adminEntry1: {
    id: 'f0000000-0000-4000-a000-000000000006',
    userId: testUsers.admin.id,
    jobId: testJobs.jobA.id,
    serviceId: testServices.serviceA.id,
    taskId: testTasks.taskA.id,
    durationMinutes: 60,
    entryDate: '2024-12-30',
    departmentId: testDepartments.deptA.id,
    notes: 'Admin entry',
  },

  // Super Admin's entries
  superAdminEntry1: {
    id: 'f0000000-0000-4000-a000-000000000007',
    userId: testUsers.superAdmin.id,
    jobId: testJobs.jobB.id,
    serviceId: testServices.serviceB.id,
    taskId: testTasks.taskB.id,
    durationMinutes: 240,
    entryDate: '2024-12-30',
    departmentId: testDepartments.deptA.id,
    notes: 'Super Admin entry',
  },
};

/**
 * Get entries by department
 */
export function getEntriesByDepartment(departmentId: string): TestTimeEntry[] {
  return Object.values(testEntries).filter(
    (entry) => entry.departmentId === departmentId
  );
}

/**
 * Get entries by user
 */
export function getEntriesByUser(userId: string): TestTimeEntry[] {
  return Object.values(testEntries).filter((entry) => entry.userId === userId);
}
