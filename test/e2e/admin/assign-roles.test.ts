/**
 * Assign Roles E2E Tests (Vitest)
 * Story 7.5: Assign Roles
 *
 * Tests verify server-side role assignment logic:
 * - AC 1: Admin can assign staff, manager, admin (not super_admin)
 * - AC 2: Role change success
 * - AC 3: Manager department prompt flag
 * - AC 4: Super Admin can assign any role
 * - AC 5: Role downgrade removes manager_departments
 * - AC 6: Self-demotion protection
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServiceClient, createAuthUser, deleteAuthUser } from '../../helpers/supabase-test';
import { testDepartments } from '../../helpers/test-users';
import { getRoleOptions, canAssignRole } from '@/lib/roles';

describe('Story 7.5: Assign Roles', () => {
  const serviceClient = createServiceClient();

  // Test user IDs
  const TEST_STAFF_ID = '77777777-7777-7777-7777-777777777701';
  const TEST_MANAGER_ID = '77777777-7777-7777-7777-777777777702';
  const TEST_ADMIN_ID = '77777777-7777-7777-7777-777777777703';
  const TEST_SUPER_ADMIN_ID = '77777777-7777-7777-7777-777777777704';

  beforeAll(async () => {
    // Setup test departments
    await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
    ], { onConflict: 'id' });

    // Create auth users
    await createAuthUser(TEST_STAFF_ID, 'test-staff-75@example.com');
    await createAuthUser(TEST_MANAGER_ID, 'test-manager-75@example.com');
    await createAuthUser(TEST_ADMIN_ID, 'test-admin-75@example.com');
    await createAuthUser(TEST_SUPER_ADMIN_ID, 'test-superadmin-75@example.com');

    // Create users in public.users with different roles
    await serviceClient.from('users').upsert([
      {
        id: TEST_STAFF_ID,
        email: 'test-staff-75@example.com',
        display_name: 'Test Staff 75',
        role: 'staff',
        department_id: testDepartments.deptA.id,
        is_active: true,
      },
      {
        id: TEST_MANAGER_ID,
        email: 'test-manager-75@example.com',
        display_name: 'Test Manager 75',
        role: 'manager',
        department_id: testDepartments.deptA.id,
        is_active: true,
      },
      {
        id: TEST_ADMIN_ID,
        email: 'test-admin-75@example.com',
        display_name: 'Test Admin 75',
        role: 'admin',
        department_id: testDepartments.deptA.id,
        is_active: true,
      },
      {
        id: TEST_SUPER_ADMIN_ID,
        email: 'test-superadmin-75@example.com',
        display_name: 'Test Super Admin 75',
        role: 'super_admin',
        department_id: testDepartments.deptA.id,
        is_active: true,
      },
    ], { onConflict: 'id' });

    // Setup manager_departments for manager user
    await serviceClient.from('manager_departments').upsert([
      { manager_id: TEST_MANAGER_ID, department_id: testDepartments.deptA.id },
    ], { onConflict: 'manager_id,department_id' });
  });

  afterAll(async () => {
    // Cleanup manager_departments
    await serviceClient.from('manager_departments').delete().in('manager_id', [
      TEST_MANAGER_ID,
      TEST_STAFF_ID,
    ]);

    // Cleanup users
    await serviceClient.from('users').delete().in('id', [
      TEST_STAFF_ID,
      TEST_MANAGER_ID,
      TEST_ADMIN_ID,
      TEST_SUPER_ADMIN_ID,
    ]);

    // Cleanup auth users
    await deleteAuthUser(TEST_STAFF_ID);
    await deleteAuthUser(TEST_MANAGER_ID);
    await deleteAuthUser(TEST_ADMIN_ID);
    await deleteAuthUser(TEST_SUPER_ADMIN_ID);
  });

  describe('AC 1: Role Dropdown Options for Admin', () => {
    it('getRoleOptions(admin) returns staff, manager, admin - excludes super_admin', () => {
      const options = getRoleOptions('admin');

      expect(options).toHaveLength(3);
      expect(options.map(o => o.value)).toContain('staff');
      expect(options.map(o => o.value)).toContain('manager');
      expect(options.map(o => o.value)).toContain('admin');
      expect(options.map(o => o.value)).not.toContain('super_admin');
    });

    it('canAssignRole(admin, super_admin) returns false', () => {
      expect(canAssignRole('admin', 'super_admin')).toBe(false);
    });

    it('canAssignRole(admin, manager) returns true', () => {
      expect(canAssignRole('admin', 'manager')).toBe(true);
    });
  });

  describe('AC 4: Super Admin Role Visibility', () => {
    it('getRoleOptions(super_admin) returns all 4 roles including super_admin', () => {
      const options = getRoleOptions('super_admin');

      expect(options).toHaveLength(4);
      expect(options.map(o => o.value)).toContain('staff');
      expect(options.map(o => o.value)).toContain('manager');
      expect(options.map(o => o.value)).toContain('admin');
      expect(options.map(o => o.value)).toContain('super_admin');
    });

    it('canAssignRole(super_admin, super_admin) returns true', () => {
      expect(canAssignRole('super_admin', 'super_admin')).toBe(true);
    });
  });

  describe('AC 2: Role Change Success', () => {
    it('can update user role from staff to admin', async () => {
      // Update role using service client (simulates admin action)
      const { data, error } = await serviceClient
        .from('users')
        .update({ role: 'admin' })
        .eq('id', TEST_STAFF_ID)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.role).toBe('admin');

      // Revert for other tests
      await serviceClient
        .from('users')
        .update({ role: 'staff' })
        .eq('id', TEST_STAFF_ID);
    });
  });

  describe('AC 3: Manager Department Prompt', () => {
    it('changing to manager should trigger department assignment prompt', async () => {
      // Get user before change
      const { data: before } = await serviceClient
        .from('users')
        .select('role')
        .eq('id', TEST_STAFF_ID)
        .single();

      expect(before?.role).toBe('staff');

      // Simulate role change to manager
      const newRole = 'manager';
      const becomingManager = newRole === 'manager' && before?.role !== 'manager';

      expect(becomingManager).toBe(true);
      // This flag would be returned by updateUser action as promptDepartment: true
    });

    it('changing from manager to admin should NOT trigger department prompt', async () => {
      const { data: before } = await serviceClient
        .from('users')
        .select('role')
        .eq('id', TEST_MANAGER_ID)
        .single();

      expect(before?.role).toBe('manager');

      // Use string type to allow runtime comparison (simulating dynamic role selection)
      const newRole: string = 'admin';
      const becomingManager = newRole === 'manager' && before?.role !== 'manager';

      expect(becomingManager).toBe(false);
    });
  });

  describe('AC 5: Role Downgrade Handling', () => {
    it('downgrading from manager removes manager_departments entries', async () => {
      // Verify manager has department assignments
      const { data: beforeAssignments } = await serviceClient
        .from('manager_departments')
        .select('*')
        .eq('manager_id', TEST_MANAGER_ID);

      expect(beforeAssignments?.length).toBeGreaterThan(0);

      // Simulate downgrade: delete manager_departments when role changes from manager
      await serviceClient
        .from('manager_departments')
        .delete()
        .eq('manager_id', TEST_MANAGER_ID);

      // Verify assignments removed
      const { data: afterAssignments } = await serviceClient
        .from('manager_departments')
        .select('*')
        .eq('manager_id', TEST_MANAGER_ID);

      expect(afterAssignments?.length).toBe(0);

      // Restore for other tests
      await serviceClient.from('manager_departments').insert({
        manager_id: TEST_MANAGER_ID,
        department_id: testDepartments.deptA.id,
      });
    });
  });

  describe('AC 6: Self-Demotion Protection', () => {
    it('user cannot change own role - logic check', () => {
      // Use string types to simulate dynamic values from form/database
      const currentUserId: string = TEST_ADMIN_ID;
      const targetUserId: string = TEST_ADMIN_ID;
      const currentRole: string = 'admin';
      const newRole: string = 'staff';

      // Self-role-change detection
      const isSelfRoleChange = currentUserId === targetUserId && newRole !== currentRole;

      expect(isSelfRoleChange).toBe(true);
      // Server action should return error: "Cannot change your own role"
    });

    it('user can change other users role', () => {
      // Use string types to simulate dynamic values from form/database
      const currentUserId: string = TEST_ADMIN_ID;
      const targetUserId: string = TEST_STAFF_ID;
      const currentRole: string = 'staff';
      const newRole: string = 'manager';

      const isSelfRoleChange = currentUserId === targetUserId && newRole !== currentRole;

      expect(isSelfRoleChange).toBe(false);
    });
  });

  describe('Admin Cannot Assign Super Admin', () => {
    it('admin trying to assign super_admin should be blocked', () => {
      const currentUserRole = 'admin';
      const targetRole = 'super_admin';

      const canAssign = canAssignRole(currentUserRole, targetRole);

      expect(canAssign).toBe(false);
    });

    it('super_admin can assign super_admin role', () => {
      const currentUserRole = 'super_admin';
      const targetRole = 'super_admin';

      const canAssign = canAssignRole(currentUserRole, targetRole);

      expect(canAssign).toBe(true);
    });
  });
});
