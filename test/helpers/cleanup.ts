/**
 * Test data cleanup utilities
 * Story 1.4: RLS Policies for All Roles (AC: 8, 9, 10)
 */

import { createServiceClient } from './supabase-test';
import { getAllTestUserIds, getAllTestDepartmentIds, testUsers, testDepartments } from './test-users';

/**
 * Clean up all test time entries for a specific user
 */
export async function cleanupTestEntries(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from('time_entries').delete().eq('user_id', userId);
}

/**
 * Clean up all test time entries for all test users
 */
export async function cleanupAllTestEntries(): Promise<void> {
  const supabase = createServiceClient();
  const userIds = getAllTestUserIds();

  for (const userId of userIds) {
    await supabase.from('time_entries').delete().eq('user_id', userId);
  }
}

/**
 * Clean up recent combinations for a specific user
 */
export async function cleanupRecentCombinations(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from('user_recent_combinations').delete().eq('user_id', userId);
}

/**
 * Clean up all test data (full cleanup)
 * Order matters due to foreign key constraints
 */
export async function cleanupAllTestData(): Promise<void> {
  const supabase = createServiceClient();
  const userIds = getAllTestUserIds();
  const deptIds = getAllTestDepartmentIds();

  // Delete in order of dependencies
  // 1. Time entries (references users, jobs, services, tasks, departments)
  for (const userId of userIds) {
    await supabase.from('time_entries').delete().eq('user_id', userId);
  }

  // 2. User recent combinations (references users, clients, projects, jobs, services, tasks)
  for (const userId of userIds) {
    await supabase.from('user_recent_combinations').delete().eq('user_id', userId);
  }

  // 3. Manager departments (references users, departments)
  for (const userId of userIds) {
    await supabase.from('manager_departments').delete().eq('manager_id', userId);
  }

  // 4. Users (references auth.users, departments)
  await supabase.from('users').delete().in('id', userIds);

  // 5. Departments
  await supabase.from('departments').delete().in('id', deptIds);
}

/**
 * Setup test departments
 */
export async function setupTestDepartments(): Promise<void> {
  const supabase = createServiceClient();

  const departments = Object.values(testDepartments).map((dept) => ({
    id: dept.id,
    name: dept.name,
    active: true,
  }));

  const { error } = await supabase.from('departments').upsert(departments, {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(`Failed to setup test departments: ${error.message}`);
  }
}

/**
 * Setup test users in the database
 * Note: This creates entries in the public.users table, not auth.users
 * For full auth testing, users must exist in auth.users first
 */
export async function setupTestUsers(): Promise<void> {
  const supabase = createServiceClient();

  // First ensure departments exist
  await setupTestDepartments();

  // Create users
  const users = Object.values(testUsers).map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    department_id: user.departmentId,
    display_name: user.displayName,
  }));

  const { error: usersError } = await supabase.from('users').upsert(users, {
    onConflict: 'id',
  });

  if (usersError) {
    throw new Error(`Failed to setup test users: ${usersError.message}`);
  }

  // Setup manager departments junction for manager user
  const manager = testUsers.manager;
  if (manager.managedDepartments) {
    const managerDepts = manager.managedDepartments.map((deptId) => ({
      manager_id: manager.id,
      department_id: deptId,
    }));

    const { error: mdError } = await supabase
      .from('manager_departments')
      .upsert(managerDepts, { onConflict: 'manager_id,department_id' });

    if (mdError) {
      throw new Error(`Failed to setup manager departments: ${mdError.message}`);
    }
  }
}

/**
 * Complete test data setup
 */
export async function setupTestData(): Promise<void> {
  // Clean up any existing test data first
  await cleanupAllTestData();

  // Then setup fresh test data
  await setupTestUsers();
}
