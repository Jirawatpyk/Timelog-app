/**
 * Test user definitions for RLS E2E testing
 * Story 1.4: RLS Policies for All Roles (AC: 8, 9, 10)
 */

export type UserRole = 'staff' | 'manager' | 'admin' | 'super_admin';

export interface TestUser {
  id: string;
  email: string;
  role: UserRole;
  departmentId: string;
  displayName: string;
  managedDepartments?: string[];
}

export interface TestDepartment {
  id: string;
  name: string;
}

/**
 * Test departments - 3 departments to test multi-department manager scenarios
 * Manager manages dept-a and dept-b, but NOT dept-c (critical for negative test)
 * Using valid UUID v4 format
 */
export const testDepartments: Record<string, TestDepartment> = {
  deptA: { id: '00000000-0000-4000-a001-000000000001', name: 'Audio Production' },
  deptB: { id: '00000000-0000-4000-a002-000000000002', name: 'Video Production' },
  deptC: { id: '00000000-0000-4000-a003-000000000003', name: 'Localization' }, // Manager does NOT manage this
};

/**
 * Test users - one for each role
 * These users must be created in the test database before running RLS tests
 * Using valid UUID v4 format
 */
export const testUsers: Record<string, TestUser> = {
  staff: {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'staff@test.timelog.local',
    role: 'staff',
    departmentId: testDepartments.deptA.id,
    displayName: 'Test Staff User',
  },
  staffB: {
    id: '11111111-1111-4111-a111-111111111112',
    email: 'staffb@test.timelog.local',
    role: 'staff',
    departmentId: testDepartments.deptB.id,
    displayName: 'Test Staff User B',
  },
  manager: {
    id: '22222222-2222-4222-a222-222222222222',
    email: 'manager@test.timelog.local',
    role: 'manager',
    departmentId: testDepartments.deptA.id,
    displayName: 'Test Manager',
    managedDepartments: [testDepartments.deptA.id, testDepartments.deptB.id], // Manages 2 departments
  },
  admin: {
    id: '33333333-3333-4333-a333-333333333333',
    email: 'admin@test.timelog.local',
    role: 'admin',
    departmentId: testDepartments.deptA.id,
    displayName: 'Test Admin',
  },
  superAdmin: {
    id: '44444444-4444-4444-a444-444444444444',
    email: 'superadmin@test.timelog.local',
    role: 'super_admin',
    departmentId: testDepartments.deptA.id,
    displayName: 'Test Super Admin',
  },
};

/**
 * Get all test user IDs for cleanup
 */
export function getAllTestUserIds(): string[] {
  return Object.values(testUsers).map((user) => user.id);
}

/**
 * Get all test department IDs
 */
export function getAllTestDepartmentIds(): string[] {
  return Object.values(testDepartments).map((dept) => dept.id);
}
