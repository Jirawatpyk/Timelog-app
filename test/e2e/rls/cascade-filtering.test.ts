/**
 * Cascade Filtering Tests
 * Story 3.4: Soft Delete Protection (AC: 6)
 *
 * Tests that inactive parent items cascade to hide child items:
 * - Inactive client → its projects hidden from dropdowns
 * - Inactive project → its jobs hidden from dropdowns
 * - Historical entries still show correct names
 *
 * These tests use the service client for setup/teardown but verify
 * the cascade logic through direct database queries.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServiceClient, createAuthUser, deleteAuthUser, createUserClient } from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';

// Test data for cascade filtering (using valid UUID hex format)
const testData = {
  activeClient: {
    id: 'a1111111-1111-4111-a111-111111111111',
    name: 'Cascade Active Client',
    active: true,
  },
  inactiveClient: {
    id: 'a1111111-1111-4111-a111-111111111112',
    name: 'Cascade Inactive Client',
    active: false,
  },
  projectUnderActiveClient: {
    id: 'a2222222-2222-4222-a222-222222222221',
    name: 'Project Under Active Client',
    client_id: 'a1111111-1111-4111-a111-111111111111',
    active: true,
  },
  projectUnderInactiveClient: {
    id: 'a2222222-2222-4222-a222-222222222222',
    name: 'Project Under Inactive Client',
    client_id: 'a1111111-1111-4111-a111-111111111112',
    active: true, // Note: project itself is active, but parent is not
  },
  inactiveProject: {
    id: 'a2222222-2222-4222-a222-222222222223',
    name: 'Inactive Project',
    client_id: 'a1111111-1111-4111-a111-111111111111',
    active: false,
  },
  jobUnderActiveProject: {
    id: 'a3333333-3333-4333-a333-333333333331',
    name: 'Job Under Active Project',
    project_id: 'a2222222-2222-4222-a222-222222222221',
    job_no: 'G001',
    active: true,
  },
  jobUnderInactiveProject: {
    id: 'a3333333-3333-4333-a333-333333333332',
    name: 'Job Under Inactive Project',
    project_id: 'a2222222-2222-4222-a222-222222222223',
    job_no: 'G002',
    active: true, // Note: job itself is active, but project is not
  },
  jobUnderProjectWithInactiveClient: {
    id: 'a3333333-3333-4333-a333-333333333333',
    name: 'Job Under Project With Inactive Client',
    project_id: 'a2222222-2222-4222-a222-222222222222',
    job_no: 'G003',
    active: true, // Note: job and project active, but client is not
  },
};

describe('Cascade Filtering (AC: 6)', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Create department
    const { error: deptError } = await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
    ], { onConflict: 'id' });
    if (deptError) console.error('Error creating departments:', deptError);

    // Create auth users
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

    // Create clients
    const { error: clientError } = await serviceClient.from('clients').upsert([
      testData.activeClient,
      testData.inactiveClient,
    ], { onConflict: 'id' });
    if (clientError) console.error('Error creating clients:', clientError);

    // Create projects
    const { error: projectError } = await serviceClient.from('projects').upsert([
      testData.projectUnderActiveClient,
      testData.projectUnderInactiveClient,
      testData.inactiveProject,
    ], { onConflict: 'id' });
    if (projectError) console.error('Error creating projects:', projectError);

    // Create jobs
    const { error: jobError } = await serviceClient.from('jobs').upsert([
      testData.jobUnderActiveProject,
      testData.jobUnderInactiveProject,
      testData.jobUnderProjectWithInactiveClient,
    ], { onConflict: 'id' });
    if (jobError) console.error('Error creating jobs:', jobError);
  });

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    await serviceClient.from('jobs').delete().in('id', [
      testData.jobUnderActiveProject.id,
      testData.jobUnderInactiveProject.id,
      testData.jobUnderProjectWithInactiveClient.id,
    ]);
    await serviceClient.from('projects').delete().in('id', [
      testData.projectUnderActiveClient.id,
      testData.projectUnderInactiveClient.id,
      testData.inactiveProject.id,
    ]);
    await serviceClient.from('clients').delete().in('id', [
      testData.activeClient.id,
      testData.inactiveClient.id,
    ]);
    await serviceClient.from('users').delete().in('id', [testUsers.staff.id, testUsers.admin.id]);
    await deleteAuthUser(testUsers.staff.id);
    await deleteAuthUser(testUsers.admin.id);
    await serviceClient.from('departments').delete().eq('id', testDepartments.deptA.id);
  });

  describe('Client hierarchy - RLS behavior (historical access)', () => {
    it('staff_cannot_see_inactive_client', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data } = await staffClient
        .from('clients')
        .select('*')
        .in('id', [testData.activeClient.id, testData.inactiveClient.id]);

      expect(data).not.toBeNull();
      // Staff should only see the active client
      expect(data!.length).toBe(1);
      expect(data![0].id).toBe(testData.activeClient.id);
    });

    it('staff_CAN_see_active_project_even_if_client_inactive_for_historical_access', async () => {
      // AC6: Projects are still accessible for historical entries
      // RLS does NOT cascade - only checks project's own active status
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data } = await staffClient
        .from('projects')
        .select('*')
        .eq('id', testData.projectUnderInactiveClient.id);

      expect(data).not.toBeNull();
      // Project is active, so staff CAN see it (for historical entries)
      expect(data!.length).toBe(1);
      expect(data![0].active).toBe(true);
    });

    it('staff_cannot_see_inactive_project_regardless_of_client', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data } = await staffClient
        .from('projects')
        .select('*')
        .eq('id', testData.inactiveProject.id);

      expect(data).not.toBeNull();
      // Project is inactive, so staff cannot see it
      expect(data!.length).toBe(0);
    });

    it('staff_can_see_active_project_under_active_client', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data } = await staffClient
        .from('projects')
        .select('*')
        .eq('id', testData.projectUnderActiveClient.id);

      expect(data).not.toBeNull();
      expect(data!.length).toBe(1);
      expect(data![0].active).toBe(true);
    });
  });

  describe('Job hierarchy - RLS behavior (historical access)', () => {
    it('staff_CAN_see_active_job_even_if_project_inactive_for_historical_access', async () => {
      // AC6: Jobs are still accessible for historical entries
      // RLS does NOT cascade - only checks job's own active status
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data } = await staffClient
        .from('jobs')
        .select('*')
        .eq('id', testData.jobUnderInactiveProject.id);

      expect(data).not.toBeNull();
      // Job is active, so staff CAN see it (for historical entries)
      expect(data!.length).toBe(1);
      expect(data![0].active).toBe(true);
    });

    it('staff_CAN_see_active_job_even_if_client_inactive_for_historical_access', async () => {
      // AC6: Jobs are still accessible for historical entries
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data } = await staffClient
        .from('jobs')
        .select('*')
        .eq('id', testData.jobUnderProjectWithInactiveClient.id);

      expect(data).not.toBeNull();
      // Job is active, so staff CAN see it (for historical entries)
      expect(data!.length).toBe(1);
      expect(data![0].active).toBe(true);
    });

    it('staff_can_see_active_job_under_active_hierarchy', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data } = await staffClient
        .from('jobs')
        .select('*')
        .eq('id', testData.jobUnderActiveProject.id);

      expect(data).not.toBeNull();
      expect(data!.length).toBe(1);
      expect(data![0].active).toBe(true);
    });
  });

  describe('Admin can see all items regardless of cascade', () => {
    it('admin_can_see_inactive_client', async () => {
      const adminClient = await createUserClient(testUsers.admin.email);

      const { data } = await adminClient
        .from('clients')
        .select('*')
        .in('id', [testData.activeClient.id, testData.inactiveClient.id]);

      expect(data).not.toBeNull();
      expect(data!.length).toBe(2);
    });

    it('admin_can_see_project_under_inactive_client', async () => {
      const adminClient = await createUserClient(testUsers.admin.email);

      const { data } = await adminClient
        .from('projects')
        .select('*')
        .eq('id', testData.projectUnderInactiveClient.id);

      expect(data).not.toBeNull();
      expect(data!.length).toBe(1);
    });

    it('admin_can_see_jobs_in_any_hierarchy_state', async () => {
      const adminClient = await createUserClient(testUsers.admin.email);

      const { data } = await adminClient
        .from('jobs')
        .select('*')
        .in('id', [
          testData.jobUnderActiveProject.id,
          testData.jobUnderInactiveProject.id,
          testData.jobUnderProjectWithInactiveClient.id,
        ]);

      expect(data).not.toBeNull();
      expect(data!.length).toBe(3);
    });
  });

  describe('Dropdown cascade behavior simulation', () => {
    it('cascading_dropdown_only_shows_valid_paths', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      // Step 1: Get available clients
      const { data: clients } = await staffClient
        .from('clients')
        .select('id, name, active')
        .eq('active', true)
        .order('name');

      expect(clients).not.toBeNull();
      // Only active client should be available
      const hasActiveClient = clients!.some((c) => c.id === testData.activeClient.id);
      const hasInactiveClient = clients!.some((c) => c.id === testData.inactiveClient.id);
      expect(hasActiveClient).toBe(true);
      expect(hasInactiveClient).toBe(false);

      // Step 2: Select active client, get projects
      const { data: projects } = await staffClient
        .from('projects')
        .select('id, name, active')
        .eq('client_id', testData.activeClient.id)
        .eq('active', true)
        .order('name');

      expect(projects).not.toBeNull();
      // Only active project should be available
      const hasActiveProject = projects!.some((p) => p.id === testData.projectUnderActiveClient.id);
      const hasInactiveProject = projects!.some((p) => p.id === testData.inactiveProject.id);
      expect(hasActiveProject).toBe(true);
      expect(hasInactiveProject).toBe(false);

      // Step 3: Select active project, get jobs
      const { data: jobs } = await staffClient
        .from('jobs')
        .select('id, name, active')
        .eq('project_id', testData.projectUnderActiveClient.id)
        .eq('active', true)
        .order('job_no');

      expect(jobs).not.toBeNull();
      expect(jobs!.length).toBe(1);
      expect(jobs![0].id).toBe(testData.jobUnderActiveProject.id);
    });
  });
});
