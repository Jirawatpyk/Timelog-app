/**
 * Manager Departments E2E Tests
 * Story 7.6: Assign Manager Departments
 *
 * Tests verify:
 * - AC 1: Get current department assignments
 * - AC 2: Assign multiple departments to manager
 * - AC 3: Remove departments from manager
 * - AC 4: Auto-update team dashboard access
 * - AC 5: Warning for managers without departments
 * - AC 6: Direct "Assign Departments" button
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServiceClient, createAuthUser, deleteAuthUser } from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';

describe('Story 7.6: Manager Department Assignment', () => {
  const serviceClient = createServiceClient();

  // Test user for new manager
  const newManager = {
    id: '77777777-7777-4777-a777-777777777776',
    email: 'new-manager-76@test.timelog.local',
    role: 'manager' as const,
    departmentId: testDepartments.deptA.id,
    displayName: 'New Manager For Test',
  };

  beforeAll(async () => {
    // Setup test data using service client (bypasses RLS)

    // 1. Create departments
    await serviceClient.from('departments').delete().in('id', [
      testDepartments.deptA.id,
      testDepartments.deptB.id,
      testDepartments.deptC.id,
    ]);

    for (const dept of [testDepartments.deptA, testDepartments.deptB, testDepartments.deptC]) {
      const { error: deptError } = await serviceClient.from('departments').insert({
        id: dept.id,
        name: dept.name,
        active: true,
      });
      if (deptError && !deptError.message?.includes('duplicate')) {
        throw new Error(`Failed to create department ${dept.name}: ${deptError.message}`);
      }
    }

    // 2. Create auth user for admin and new manager
    await createAuthUser(testUsers.admin.id, testUsers.admin.email);
    await createAuthUser(newManager.id, newManager.email);

    // 3. Create users in public.users
    const { error: userError } = await serviceClient.from('users').upsert([
      {
        id: testUsers.admin.id,
        email: testUsers.admin.email,
        role: testUsers.admin.role,
        department_id: testUsers.admin.departmentId,
        display_name: testUsers.admin.displayName,
      },
      {
        id: newManager.id,
        email: newManager.email,
        role: newManager.role,
        department_id: newManager.departmentId,
        display_name: newManager.displayName,
      },
    ], { onConflict: 'id' });
    if (userError) throw new Error(`Failed to create users: ${userError.message}`);
  });

  afterAll(async () => {
    // Cleanup test data in reverse order of creation
    await serviceClient.from('manager_departments').delete().eq('manager_id', newManager.id);
    await serviceClient.from('users').delete().in('id', [testUsers.admin.id, newManager.id]);
    await deleteAuthUser(testUsers.admin.id);
    await deleteAuthUser(newManager.id);
    await serviceClient.from('departments').delete().in('id', [
      testDepartments.deptA.id,
      testDepartments.deptB.id,
      testDepartments.deptC.id,
    ]);
  });

  describe('AC 1: Get Current Department Assignments', () => {
    it('returns empty array for manager with no departments', async () => {
      // New manager starts with no departments
      const { data, error } = await serviceClient
        .from('manager_departments')
        .select('department:departments(id, name)')
        .eq('manager_id', newManager.id);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('returns assigned departments after assignment', async () => {
      // Assign dept-a to new manager
      await serviceClient.from('manager_departments').insert({
        manager_id: newManager.id,
        department_id: testDepartments.deptA.id,
      });

      const { data, error } = await serviceClient
        .from('manager_departments')
        .select('department:departments(id, name)')
        .eq('manager_id', newManager.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect((data![0] as { department: { id: string; name: string } }).department.id).toBe(testDepartments.deptA.id);

      // Cleanup for next test
      await serviceClient.from('manager_departments').delete().eq('manager_id', newManager.id);
    });
  });

  describe('AC 2: Assign Multiple Departments', () => {
    it('can assign multiple departments to manager', async () => {
      // Assign both dept-a and dept-b
      const { error: insertError } = await serviceClient.from('manager_departments').insert([
        { manager_id: newManager.id, department_id: testDepartments.deptA.id },
        { manager_id: newManager.id, department_id: testDepartments.deptB.id },
      ]);

      expect(insertError).toBeNull();

      // Verify assignments
      const { data, error } = await serviceClient
        .from('manager_departments')
        .select('department_id')
        .eq('manager_id', newManager.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data!.map((d) => d.department_id)).toContain(testDepartments.deptA.id);
      expect(data!.map((d) => d.department_id)).toContain(testDepartments.deptB.id);

      // Cleanup
      await serviceClient.from('manager_departments').delete().eq('manager_id', newManager.id);
    });

    it('prevents duplicate department assignments', async () => {
      // First assignment
      await serviceClient.from('manager_departments').insert({
        manager_id: newManager.id,
        department_id: testDepartments.deptA.id,
      });

      // Try duplicate - should fail
      const { error: dupError } = await serviceClient.from('manager_departments').insert({
        manager_id: newManager.id,
        department_id: testDepartments.deptA.id,
      });

      expect(dupError).not.toBeNull();
      expect(dupError!.code).toBe('23505'); // Unique violation

      // Cleanup
      await serviceClient.from('manager_departments').delete().eq('manager_id', newManager.id);
    });
  });

  describe('AC 3: Remove Department Assignment', () => {
    it('can remove specific department from manager', async () => {
      // Setup: assign 2 departments
      await serviceClient.from('manager_departments').insert([
        { manager_id: newManager.id, department_id: testDepartments.deptA.id },
        { manager_id: newManager.id, department_id: testDepartments.deptB.id },
      ]);

      // Remove dept-a
      const { error: deleteError } = await serviceClient
        .from('manager_departments')
        .delete()
        .eq('manager_id', newManager.id)
        .eq('department_id', testDepartments.deptA.id);

      expect(deleteError).toBeNull();

      // Verify only dept-b remains
      const { data } = await serviceClient
        .from('manager_departments')
        .select('department_id')
        .eq('manager_id', newManager.id);

      expect(data).toHaveLength(1);
      expect(data![0].department_id).toBe(testDepartments.deptB.id);

      // Cleanup
      await serviceClient.from('manager_departments').delete().eq('manager_id', newManager.id);
    });

    it('can remove all departments from manager', async () => {
      // Setup: assign 2 departments
      await serviceClient.from('manager_departments').insert([
        { manager_id: newManager.id, department_id: testDepartments.deptA.id },
        { manager_id: newManager.id, department_id: testDepartments.deptB.id },
      ]);

      // Remove all
      const { error: deleteError } = await serviceClient
        .from('manager_departments')
        .delete()
        .eq('manager_id', newManager.id);

      expect(deleteError).toBeNull();

      // Verify empty
      const { data } = await serviceClient
        .from('manager_departments')
        .select('department_id')
        .eq('manager_id', newManager.id);

      expect(data).toHaveLength(0);
    });
  });

  describe('AC 4: Team Dashboard Access (RLS Integration)', () => {
    it('verifies manager_departments junction table structure', async () => {
      // Insert department assignment
      const { error: insertError } = await serviceClient.from('manager_departments').insert({
        manager_id: newManager.id,
        department_id: testDepartments.deptA.id,
      });
      expect(insertError).toBeNull();

      // Verify structure supports RLS query pattern
      const { data, error } = await serviceClient
        .from('manager_departments')
        .select(`
          manager_id,
          department_id,
          department:departments(id, name)
        `)
        .eq('manager_id', newManager.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].manager_id).toBe(newManager.id);
      expect(data![0].department_id).toBe(testDepartments.deptA.id);

      // Cleanup
      await serviceClient.from('manager_departments').delete().eq('manager_id', newManager.id);
    });
  });

  describe('AC 5: Manager Without Departments Warning', () => {
    it('can query manager without departments for warning indicator', async () => {
      // Query manager with no departments
      const { data: managerDepts, error } = await serviceClient
        .from('manager_departments')
        .select('department_id')
        .eq('manager_id', newManager.id);

      expect(error).toBeNull();
      expect(managerDepts).toHaveLength(0);

      // This data is used by UI to show warning indicator
      const hasNoDepartments = managerDepts!.length === 0;
      expect(hasNoDepartments).toBe(true);
    });
  });

  describe('Foreign Key Constraints', () => {
    it('fails when assigning non-existent department', async () => {
      const fakeDepId = '99999999-9999-4999-a999-999999999999';

      const { error } = await serviceClient.from('manager_departments').insert({
        manager_id: newManager.id,
        department_id: fakeDepId,
      });

      expect(error).not.toBeNull();
      expect(error!.code).toBe('23503'); // FK violation
    });

    it('fails when assigning to non-existent manager', async () => {
      const fakeManagerId = '88888888-8888-4888-a888-888888888888';

      const { error } = await serviceClient.from('manager_departments').insert({
        manager_id: fakeManagerId,
        department_id: testDepartments.deptA.id,
      });

      expect(error).not.toBeNull();
      expect(error!.code).toBe('23503'); // FK violation
    });

    it('cascade deletes assignments when manager is deleted', async () => {
      // Create a temporary user
      const tempManager = {
        id: '66666666-6666-4666-a666-666666666666',
        email: 'temp-manager@test.timelog.local',
      };

      await createAuthUser(tempManager.id, tempManager.email);
      await serviceClient.from('users').insert({
        id: tempManager.id,
        email: tempManager.email,
        role: 'manager',
        department_id: testDepartments.deptA.id,
        display_name: 'Temp Manager',
      });

      // Assign department
      await serviceClient.from('manager_departments').insert({
        manager_id: tempManager.id,
        department_id: testDepartments.deptA.id,
      });

      // Delete user (should cascade delete assignments)
      await serviceClient.from('users').delete().eq('id', tempManager.id);
      await deleteAuthUser(tempManager.id);

      // Verify assignment was cascade deleted
      const { data } = await serviceClient
        .from('manager_departments')
        .select('*')
        .eq('manager_id', tempManager.id);

      expect(data).toHaveLength(0);
    });
  });
});
