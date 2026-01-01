/**
 * Soft Delete RLS Policy Tests
 * Story 3.4: Soft Delete Protection (AC: 2, 4)
 *
 * Tests that RLS policies properly filter inactive items:
 * - staff_cannot_see_inactive_services (RLS filters them)
 * - staff_cannot_see_inactive_clients (RLS filters them)
 * - staff_cannot_see_inactive_tasks (RLS filters them)
 * - admin_can_see_inactive_services
 * - admin_can_see_inactive_clients
 * - admin_can_see_inactive_tasks
 *
 * RLS Policy Pattern:
 * USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'))
 *
 * NOTE: These tests use createUserClient() which authenticates as the user
 * and respects RLS policies - unlike serviceClient which bypasses RLS.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createServiceClient,
  createAuthUser,
  deleteAuthUser,
  createUserClient,
} from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';

// Test data for soft delete verification
const testData = {
  services: {
    active: {
      id: 'e1111111-1111-4111-e111-111111111111',
      name: 'SoftDelete Active Service',
      active: true,
    },
    inactive: {
      id: 'e1111111-1111-4111-e111-111111111112',
      name: 'SoftDelete Inactive Service',
      active: false,
    },
  },
  clients: {
    active: {
      id: 'e2222222-2222-4222-e222-222222222221',
      name: 'SoftDelete Active Client',
      active: true,
    },
    inactive: {
      id: 'e2222222-2222-4222-e222-222222222222',
      name: 'SoftDelete Inactive Client',
      active: false,
    },
  },
  tasks: {
    active: {
      id: 'e3333333-3333-4333-e333-333333333331',
      name: 'SoftDelete Active Task',
      active: true,
    },
    inactive: {
      id: 'e3333333-3333-4333-e333-333333333332',
      name: 'SoftDelete Inactive Task',
      active: false,
    },
  },
};

describe('Soft Delete RLS Policies (AC: 2, 4)', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Create departments
    const { error: deptError } = await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
    ], { onConflict: 'id' });
    if (deptError) console.error('Error creating departments:', deptError);

    // Create auth users for staff and admin
    const staffResult = await createAuthUser(testUsers.staff.id, testUsers.staff.email);
    if (!staffResult.success) console.error('Error creating auth user (staff):', staffResult.error);

    const adminResult = await createAuthUser(testUsers.admin.id, testUsers.admin.email);
    if (!adminResult.success) console.error('Error creating auth user (admin):', adminResult.error);

    // Create users in public.users
    const { error: userError } = await serviceClient.from('users').upsert([
      {
        id: testUsers.staff.id,
        email: testUsers.staff.email,
        role: testUsers.staff.role,
        department_id: testUsers.staff.departmentId,
        display_name: testUsers.staff.displayName,
      },
      {
        id: testUsers.admin.id,
        email: testUsers.admin.email,
        role: testUsers.admin.role,
        department_id: testUsers.admin.departmentId,
        display_name: testUsers.admin.displayName,
      },
    ], { onConflict: 'id' });
    if (userError) console.error('Error creating users:', userError);

    // Create test services (active and inactive)
    const { error: serviceError } = await serviceClient.from('services').upsert([
      testData.services.active,
      testData.services.inactive,
    ], { onConflict: 'id' });
    if (serviceError) console.error('Error creating services:', serviceError);

    // Create test clients (active and inactive)
    const { error: clientError } = await serviceClient.from('clients').upsert([
      testData.clients.active,
      testData.clients.inactive,
    ], { onConflict: 'id' });
    if (clientError) console.error('Error creating clients:', clientError);

    // Create test tasks (active and inactive)
    const { error: taskError } = await serviceClient.from('tasks').upsert([
      testData.tasks.active,
      testData.tasks.inactive,
    ], { onConflict: 'id' });
    if (taskError) console.error('Error creating tasks:', taskError);
  });

  afterAll(async () => {
    // Cleanup test data
    await serviceClient.from('services').delete().in('id', [
      testData.services.active.id,
      testData.services.inactive.id,
    ]);
    await serviceClient.from('clients').delete().in('id', [
      testData.clients.active.id,
      testData.clients.inactive.id,
    ]);
    await serviceClient.from('tasks').delete().in('id', [
      testData.tasks.active.id,
      testData.tasks.inactive.id,
    ]);
    await serviceClient.from('users').delete().in('id', [testUsers.staff.id, testUsers.admin.id]);
    await deleteAuthUser(testUsers.staff.id);
    await deleteAuthUser(testUsers.admin.id);
    await serviceClient.from('departments').delete().eq('id', testDepartments.deptA.id);
  });

  describe('Staff role - RLS filters inactive items (AC: 2)', () => {
    it('staff_cannot_see_inactive_services', async () => {
      // Staff should only see active services due to RLS policy
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('services')
        .select('*')
        .in('id', [testData.services.active.id, testData.services.inactive.id]);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // RLS should filter out the inactive service
      expect(data!.length).toBe(1);
      expect(data![0].id).toBe(testData.services.active.id);
      expect(data![0].active).toBe(true);
    });

    it('staff_cannot_see_inactive_clients', async () => {
      // Staff should only see active clients due to RLS policy
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('clients')
        .select('*')
        .in('id', [testData.clients.active.id, testData.clients.inactive.id]);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // RLS should filter out the inactive client
      expect(data!.length).toBe(1);
      expect(data![0].id).toBe(testData.clients.active.id);
      expect(data![0].active).toBe(true);
    });

    it('staff_cannot_see_inactive_tasks', async () => {
      // Staff should only see active tasks due to RLS policy
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('tasks')
        .select('*')
        .in('id', [testData.tasks.active.id, testData.tasks.inactive.id]);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // RLS should filter out the inactive task
      expect(data!.length).toBe(1);
      expect(data![0].id).toBe(testData.tasks.active.id);
      expect(data![0].active).toBe(true);
    });

    it('staff_dropdown_only_shows_active_items', async () => {
      // Simulates what a dropdown would show for staff
      const staffClient = await createUserClient(testUsers.staff.email);

      // Get all services for dropdown (no explicit active filter - RLS handles it)
      const { data: services } = await staffClient
        .from('services')
        .select('id, name, active')
        .order('name');

      // All returned services should be active
      expect(services).not.toBeNull();
      services?.forEach((service) => {
        expect(service.active).toBe(true);
      });

      // Specifically verify our test inactive service is NOT in the list
      const hasInactive = services?.some((s) => s.id === testData.services.inactive.id);
      expect(hasInactive).toBe(false);
    });
  });

  describe('Admin role - Can see all items including inactive (AC: 4)', () => {
    it('admin_can_see_inactive_services', async () => {
      // Admin should see both active and inactive services
      const adminClient = await createUserClient(testUsers.admin.email);

      const { data, error } = await adminClient
        .from('services')
        .select('*')
        .in('id', [testData.services.active.id, testData.services.inactive.id]);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // Admin should see both services
      expect(data!.length).toBe(2);

      const activeService = data!.find((s) => s.id === testData.services.active.id);
      const inactiveService = data!.find((s) => s.id === testData.services.inactive.id);

      expect(activeService).toBeDefined();
      expect(activeService!.active).toBe(true);
      expect(inactiveService).toBeDefined();
      expect(inactiveService!.active).toBe(false);
    });

    it('admin_can_see_inactive_clients', async () => {
      // Admin should see both active and inactive clients
      const adminClient = await createUserClient(testUsers.admin.email);

      const { data, error } = await adminClient
        .from('clients')
        .select('*')
        .in('id', [testData.clients.active.id, testData.clients.inactive.id]);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // Admin should see both clients
      expect(data!.length).toBe(2);

      const activeClient = data!.find((c) => c.id === testData.clients.active.id);
      const inactiveClient = data!.find((c) => c.id === testData.clients.inactive.id);

      expect(activeClient).toBeDefined();
      expect(activeClient!.active).toBe(true);
      expect(inactiveClient).toBeDefined();
      expect(inactiveClient!.active).toBe(false);
    });

    it('admin_can_see_inactive_tasks', async () => {
      // Admin should see both active and inactive tasks
      const adminClient = await createUserClient(testUsers.admin.email);

      const { data, error } = await adminClient
        .from('tasks')
        .select('*')
        .in('id', [testData.tasks.active.id, testData.tasks.inactive.id]);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // Admin should see both tasks
      expect(data!.length).toBe(2);

      const activeTask = data!.find((t) => t.id === testData.tasks.active.id);
      const inactiveTask = data!.find((t) => t.id === testData.tasks.inactive.id);

      expect(activeTask).toBeDefined();
      expect(activeTask!.active).toBe(true);
      expect(inactiveTask).toBeDefined();
      expect(inactiveTask!.active).toBe(false);
    });

    it('admin_panel_can_manage_inactive_items', async () => {
      // Admin should be able to reactivate an inactive service
      const adminClient = await createUserClient(testUsers.admin.email);

      // First verify we can see the inactive service
      const { data: before } = await adminClient
        .from('services')
        .select('*')
        .eq('id', testData.services.inactive.id)
        .single();

      expect(before).not.toBeNull();
      expect(before!.active).toBe(false);

      // Reactivate it
      const { data: updated, error: updateError } = await adminClient
        .from('services')
        .update({ active: true })
        .eq('id', testData.services.inactive.id)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updated).not.toBeNull();
      expect(updated!.active).toBe(true);

      // Revert back to inactive for other tests
      await adminClient
        .from('services')
        .update({ active: false })
        .eq('id', testData.services.inactive.id);
    });
  });

  describe('Reactivation behavior (AC: 4)', () => {
    it('reactivated_item_becomes_visible_to_staff', async () => {
      const adminClient = await createUserClient(testUsers.admin.email);
      const staffClient = await createUserClient(testUsers.staff.email);

      // Verify staff cannot see inactive service
      const { data: beforeReactivation } = await staffClient
        .from('services')
        .select('*')
        .eq('id', testData.services.inactive.id);

      expect(beforeReactivation).toHaveLength(0);

      // Admin reactivates the service
      await adminClient
        .from('services')
        .update({ active: true })
        .eq('id', testData.services.inactive.id);

      // Now staff should be able to see it
      const { data: afterReactivation } = await staffClient
        .from('services')
        .select('*')
        .eq('id', testData.services.inactive.id);

      expect(afterReactivation).not.toBeNull();
      expect(afterReactivation).toHaveLength(1);
      expect(afterReactivation![0].active).toBe(true);

      // Cleanup: set back to inactive
      await adminClient
        .from('services')
        .update({ active: false })
        .eq('id', testData.services.inactive.id);
    });
  });
});
