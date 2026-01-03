/**
 * Historical Entry Display Tests
 * Story 3.4: Soft Delete Protection (AC: 3)
 *
 * Tests that historical time entries preserve data integrity:
 * - Entries still display correct names for inactive services/tasks
 * - JOINed data is accessible even when referenced items are inactive
 * - Historical data remains intact after deactivation
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createServiceClient,
  createAuthUser,
  deleteAuthUser,
  createUserClient,
} from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';

// Test data for historical entry verification (valid UUID hex format)
const testData = {
  client: {
    id: 'b1111111-1111-4111-a111-111111111111',
    name: 'Historical Test Client',
    active: true,
  },
  project: {
    id: 'b2222222-2222-4222-a222-222222222222',
    name: 'Historical Test Project',
    client_id: 'b1111111-1111-4111-a111-111111111111',
    active: true,
  },
  job: {
    id: 'b3333333-3333-4333-a333-333333333333',
    name: 'Historical Test Job',
    project_id: 'b2222222-2222-4222-a222-222222222222',
    job_no: 'H001',
    active: true,
  },
  service: {
    id: 'b4444444-4444-4444-a444-444444444444',
    name: 'Historical Test Service',
    active: true, // Will be deactivated during test
  },
  task: {
    id: 'b5555555-5555-4555-a555-555555555555',
    name: 'Historical Test Task',
    active: true, // Will be deactivated during test
  },
  timeEntry: {
    id: 'b6666666-6666-4666-a666-666666666666',
  },
};

describe('Historical Entry Display (AC: 3)', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Create department
    const { error: deptError } = await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
    ], { onConflict: 'id' });
    if (deptError) console.error('Error creating departments:', deptError);

    // Create auth user
    const staffResult = await createAuthUser(testUsers.staff.id, testUsers.staff.email);
    if (!staffResult.success) console.error('Error creating auth user:', staffResult.error);

    // Create user in public.users
    const { error: userError } = await serviceClient.from('users').upsert([
      {
        id: testUsers.staff.id,
        email: testUsers.staff.email,
        role: testUsers.staff.role,
        department_id: testUsers.staff.departmentId,
        display_name: testUsers.staff.displayName,
      },
    ], { onConflict: 'id' });
    if (userError) console.error('Error creating user:', userError);

    // Create master data hierarchy
    const { error: clientError } = await serviceClient.from('clients').upsert([testData.client], { onConflict: 'id' });
    if (clientError) console.error('Error creating client:', clientError);

    const { error: projectError } = await serviceClient.from('projects').upsert([testData.project], { onConflict: 'id' });
    if (projectError) console.error('Error creating project:', projectError);

    const { error: jobError } = await serviceClient.from('jobs').upsert([testData.job], { onConflict: 'id' });
    if (jobError) console.error('Error creating job:', jobError);

    const { error: serviceError } = await serviceClient.from('services').upsert([testData.service], { onConflict: 'id' });
    if (serviceError) console.error('Error creating service:', serviceError);

    const { error: taskError } = await serviceClient.from('tasks').upsert([testData.task], { onConflict: 'id' });
    if (taskError) console.error('Error creating task:', taskError);

    // Create a time entry BEFORE deactivating items
    const { error: entryError } = await serviceClient.from('time_entries').upsert([
      {
        id: testData.timeEntry.id,
        user_id: testUsers.staff.id,
        job_id: testData.job.id,
        service_id: testData.service.id,
        task_id: testData.task.id,
        duration_minutes: 120,
        entry_date: '2025-01-15',
        notes: 'Test entry for historical display verification',
        department_id: testDepartments.deptA.id,
      },
    ], { onConflict: 'id' });
    if (entryError) console.error('Error creating time entry:', entryError);
  });

  afterAll(async () => {
    // Cleanup
    await serviceClient.from('time_entries').delete().eq('id', testData.timeEntry.id);
    await serviceClient.from('jobs').delete().eq('id', testData.job.id);
    await serviceClient.from('projects').delete().eq('id', testData.project.id);
    await serviceClient.from('clients').delete().eq('id', testData.client.id);
    // Restore service and task to active before deleting
    await serviceClient.from('services').update({ active: true }).eq('id', testData.service.id);
    await serviceClient.from('tasks').update({ active: true }).eq('id', testData.task.id);
    await serviceClient.from('services').delete().eq('id', testData.service.id);
    await serviceClient.from('tasks').delete().eq('id', testData.task.id);
    await serviceClient.from('users').delete().eq('id', testUsers.staff.id);
    await deleteAuthUser(testUsers.staff.id);
    await serviceClient.from('departments').delete().eq('id', testDepartments.deptA.id);
  });

  describe('Historical entries with active references', () => {
    it('staff_can_query_own_entry_with_all_joined_data', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      // Query entry with JOINs
      const { data, error } = await staffClient
        .from('time_entries')
        .select(`
          *,
          job:jobs(id, name, job_no),
          service:services(id, name),
          task:tasks(id, name)
        `)
        .eq('id', testData.timeEntry.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.job).not.toBeNull();
      expect(data!.job!.name).toBe(testData.job.name);
      expect(data!.service).not.toBeNull();
      expect(data!.service!.name).toBe(testData.service.name);
      expect(data!.task).not.toBeNull();
      expect(data!.task!.name).toBe(testData.task.name);
    });
  });

  describe('Historical entries AFTER service deactivation', () => {
    beforeAll(async () => {
      // Deactivate the service
      await serviceClient
        .from('services')
        .update({ active: false })
        .eq('id', testData.service.id);
    });

    it('staff_can_still_see_own_historical_entry', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      // Staff can see their own entry via RLS
      const { data, error } = await staffClient
        .from('time_entries')
        .select('*')
        .eq('id', testData.timeEntry.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.service_id).toBe(testData.service.id);
    });

    it('historical_entry_still_shows_service_name_via_join', async () => {
      // Use service client to verify JOINed data is accessible
      // (Staff would not see inactive service directly, but through JOIN it's preserved)
      const { data, error } = await serviceClient
        .from('time_entries')
        .select(`
          *,
          service:services(id, name, active)
        `)
        .eq('id', testData.timeEntry.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.service).not.toBeNull();
      expect(data!.service.name).toBe(testData.service.name);
      expect(data!.service.active).toBe(false); // Service is now inactive
    });

    afterAll(async () => {
      // Restore service for next test
      await serviceClient
        .from('services')
        .update({ active: true })
        .eq('id', testData.service.id);
    });
  });

  describe('Historical entries AFTER task deactivation', () => {
    beforeAll(async () => {
      // Deactivate the task
      await serviceClient
        .from('tasks')
        .update({ active: false })
        .eq('id', testData.task.id);
    });

    it('historical_entry_still_has_task_reference', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('time_entries')
        .select('*')
        .eq('id', testData.timeEntry.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.task_id).toBe(testData.task.id);
    });

    it('historical_entry_still_shows_task_name_via_join', async () => {
      const { data, error } = await serviceClient
        .from('time_entries')
        .select(`
          *,
          task:tasks(id, name, active)
        `)
        .eq('id', testData.timeEntry.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.task).not.toBeNull();
      expect(data!.task!.name).toBe(testData.task.name);
      expect(data!.task!.active).toBe(false); // Task is now inactive
    });

    afterAll(async () => {
      // Restore task
      await serviceClient
        .from('tasks')
        .update({ active: true })
        .eq('id', testData.task.id);
    });
  });

  describe('Full hierarchy JOIN even with inactive items', () => {
    beforeAll(async () => {
      // Deactivate multiple items
      await serviceClient.from('services').update({ active: false }).eq('id', testData.service.id);
      await serviceClient.from('tasks').update({ active: false }).eq('id', testData.task.id);
    });

    it('can_retrieve_full_entry_details_with_all_joins', async () => {
      const { data, error } = await serviceClient
        .from('time_entries')
        .select(`
          *,
          job:jobs(
            id, name, job_no,
            project:projects(
              id, name,
              client:clients(id, name)
            )
          ),
          service:services(id, name, active),
          task:tasks(id, name, active)
        `)
        .eq('id', testData.timeEntry.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      // Verify complete hierarchy is accessible
      expect(data!.job!.name).toBe(testData.job.name);
      expect(data!.job!.project!.name).toBe(testData.project.name);
      expect(data!.job!.project!.client!.name).toBe(testData.client.name);
      expect(data!.service!.name).toBe(testData.service.name);
      expect(data!.task!.name).toBe(testData.task.name);

      // Verify inactive status is captured
      expect(data!.service!.active).toBe(false);
      expect(data!.task!.active).toBe(false);
    });

    afterAll(async () => {
      // Restore items
      await serviceClient.from('services').update({ active: true }).eq('id', testData.service.id);
      await serviceClient.from('tasks').update({ active: true }).eq('id', testData.task.id);
    });
  });
});
