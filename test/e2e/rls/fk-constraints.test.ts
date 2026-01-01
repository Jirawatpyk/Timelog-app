/**
 * Foreign Key Constraint Tests
 * Story 3.4: Soft Delete Protection (AC: 5)
 *
 * Tests that FK constraints prevent hard deletion of master data:
 * - service_id: FK RESTRICT - cannot delete service if used in time_entries
 * - job_id: FK RESTRICT - cannot delete job if used in time_entries
 * - task_id: FK SET NULL - can delete task, sets time_entry.task_id to null
 *
 * These constraints protect historical data integrity by preventing
 * accidental deletion of master data that is referenced by time entries.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServiceClient, createAuthUser, deleteAuthUser } from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';

// Test data for FK constraint verification
const testData = {
  client: {
    id: 'f1111111-1111-4111-f111-111111111111',
    name: 'FK Test Client',
    active: true,
  },
  project: {
    id: 'f2222222-2222-4222-f222-222222222222',
    name: 'FK Test Project',
    client_id: 'f1111111-1111-4111-f111-111111111111',
    active: true,
  },
  job: {
    id: 'f3333333-3333-4333-f333-333333333333',
    name: 'FK Test Job',
    project_id: 'f2222222-2222-4222-f222-222222222222',
    job_no: 'FK001',
    active: true,
  },
  service: {
    id: 'f4444444-4444-4444-f444-444444444444',
    name: 'FK Test Service',
    active: true,
  },
  task: {
    id: 'f5555555-5555-4555-f555-555555555555',
    name: 'FK Test Task',
    active: true,
  },
  timeEntry: {
    id: 'f6666666-6666-4666-f666-666666666666',
    // Other fields set in beforeAll
  },
};

describe('Foreign Key Constraints (AC: 5)', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Create department
    const { error: deptError } = await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
    ], { onConflict: 'id' });
    if (deptError) console.error('Error creating departments:', deptError);

    // Create auth user (staff)
    const staffResult = await createAuthUser(testUsers.staff.id, testUsers.staff.email);
    if (!staffResult.success) console.error('Error creating auth user (staff):', staffResult.error);

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
    if (userError) console.error('Error creating users:', userError);

    // Create master data hierarchy: client → project → job
    const { error: clientError } = await serviceClient.from('clients').upsert([testData.client], { onConflict: 'id' });
    if (clientError) console.error('Error creating client:', clientError);

    const { error: projectError } = await serviceClient.from('projects').upsert([testData.project], { onConflict: 'id' });
    if (projectError) console.error('Error creating project:', projectError);

    const { error: jobError } = await serviceClient.from('jobs').upsert([testData.job], { onConflict: 'id' });
    if (jobError) console.error('Error creating job:', jobError);

    // Create service and task
    const { error: serviceError } = await serviceClient.from('services').upsert([testData.service], { onConflict: 'id' });
    if (serviceError) console.error('Error creating service:', serviceError);

    const { error: taskError } = await serviceClient.from('tasks').upsert([testData.task], { onConflict: 'id' });
    if (taskError) console.error('Error creating task:', taskError);

    // Create time entry that references all master data
    const { error: entryError } = await serviceClient.from('time_entries').upsert([
      {
        id: testData.timeEntry.id,
        user_id: testUsers.staff.id,
        job_id: testData.job.id,
        service_id: testData.service.id,
        task_id: testData.task.id,
        duration_minutes: 60,
        entry_date: '2025-01-01',
        department_id: testDepartments.deptA.id,
      },
    ], { onConflict: 'id' });
    if (entryError) console.error('Error creating time entry:', entryError);
  });

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    await serviceClient.from('time_entries').delete().eq('id', testData.timeEntry.id);
    await serviceClient.from('jobs').delete().eq('id', testData.job.id);
    await serviceClient.from('projects').delete().eq('id', testData.project.id);
    await serviceClient.from('clients').delete().eq('id', testData.client.id);
    await serviceClient.from('services').delete().eq('id', testData.service.id);
    await serviceClient.from('tasks').delete().eq('id', testData.task.id);
    await serviceClient.from('users').delete().eq('id', testUsers.staff.id);
    await deleteAuthUser(testUsers.staff.id);
    await serviceClient.from('departments').delete().eq('id', testDepartments.deptA.id);
  });

  describe('FK RESTRICT on services (time_entries.service_id)', () => {
    it('cannot_delete_service_used_in_time_entries', async () => {
      // Attempt to delete service that is referenced by time_entry
      const { error } = await serviceClient
        .from('services')
        .delete()
        .eq('id', testData.service.id);

      // Should fail with FK violation error
      expect(error).not.toBeNull();
      expect(error!.code).toBe('23503'); // FK violation code
      expect(error!.message).toContain('time_entries');
    });

    it('can_delete_service_not_used_in_time_entries', async () => {
      // Create an unused service
      const unusedService = {
        id: 'f4444444-4444-4444-f444-444444444445',
        name: 'Unused FK Test Service',
        active: true,
      };

      await serviceClient.from('services').insert(unusedService);

      // Should be able to delete unused service
      const { error } = await serviceClient
        .from('services')
        .delete()
        .eq('id', unusedService.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data } = await serviceClient
        .from('services')
        .select('*')
        .eq('id', unusedService.id);

      expect(data).toHaveLength(0);
    });
  });

  describe('FK RESTRICT on jobs (time_entries.job_id)', () => {
    it('cannot_delete_job_used_in_time_entries', async () => {
      // Attempt to delete job that is referenced by time_entry
      const { error } = await serviceClient
        .from('jobs')
        .delete()
        .eq('id', testData.job.id);

      // Should fail with FK violation error
      expect(error).not.toBeNull();
      expect(error!.code).toBe('23503'); // FK violation code
      expect(error!.message).toContain('time_entries');
    });

    it('can_delete_job_not_used_in_time_entries', async () => {
      // Create an unused job
      const unusedJob = {
        id: 'f3333333-3333-4333-f333-333333333334',
        name: 'Unused FK Test Job',
        project_id: testData.project.id,
        job_no: 'FK002',
        active: true,
      };

      await serviceClient.from('jobs').insert(unusedJob);

      // Should be able to delete unused job
      const { error } = await serviceClient
        .from('jobs')
        .delete()
        .eq('id', unusedJob.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data } = await serviceClient
        .from('jobs')
        .select('*')
        .eq('id', unusedJob.id);

      expect(data).toHaveLength(0);
    });
  });

  describe('FK SET NULL on tasks (time_entries.task_id)', () => {
    it('deleting_task_sets_time_entry_task_id_to_null', async () => {
      // Create a separate task for this test
      const deletableTask = {
        id: 'f5555555-5555-4555-f555-555555555556',
        name: 'Deletable FK Test Task',
        active: true,
      };

      await serviceClient.from('tasks').insert(deletableTask);

      // Create time entry with this task
      const testEntryWithTask = {
        id: 'f6666666-6666-4666-f666-666666666667',
        user_id: testUsers.staff.id,
        job_id: testData.job.id,
        service_id: testData.service.id,
        task_id: deletableTask.id,
        duration_minutes: 30,
        entry_date: '2025-01-02',
        department_id: testDepartments.deptA.id,
      };

      await serviceClient.from('time_entries').insert(testEntryWithTask);

      // Verify task_id is set
      const { data: beforeDelete } = await serviceClient
        .from('time_entries')
        .select('task_id')
        .eq('id', testEntryWithTask.id)
        .single();

      expect(beforeDelete?.task_id).toBe(deletableTask.id);

      // Delete the task
      const { error } = await serviceClient
        .from('tasks')
        .delete()
        .eq('id', deletableTask.id);

      // Should succeed (FK SET NULL, not RESTRICT)
      expect(error).toBeNull();

      // Verify time_entry.task_id is now null
      const { data: afterDelete } = await serviceClient
        .from('time_entries')
        .select('task_id')
        .eq('id', testEntryWithTask.id)
        .single();

      expect(afterDelete?.task_id).toBeNull();

      // Cleanup
      await serviceClient.from('time_entries').delete().eq('id', testEntryWithTask.id);
    });

    it('time_entry_preserves_other_data_when_task_deleted', async () => {
      // Create a separate task for this test
      const deletableTask = {
        id: 'f5555555-5555-4555-f555-555555555557',
        name: 'Another Deletable Task',
        active: true,
      };

      await serviceClient.from('tasks').insert(deletableTask);

      // Create time entry with specific values
      const testEntry = {
        id: 'f6666666-6666-4666-f666-666666666668',
        user_id: testUsers.staff.id,
        job_id: testData.job.id,
        service_id: testData.service.id,
        task_id: deletableTask.id,
        duration_minutes: 120,
        entry_date: '2025-01-03',
        notes: 'Test notes for FK test',
        department_id: testDepartments.deptA.id,
      };

      await serviceClient.from('time_entries').insert(testEntry);

      // Delete the task
      await serviceClient.from('tasks').delete().eq('id', deletableTask.id);

      // Verify all other fields are preserved
      const { data } = await serviceClient
        .from('time_entries')
        .select('*')
        .eq('id', testEntry.id)
        .single();

      expect(data).not.toBeNull();
      expect(data!.user_id).toBe(testEntry.user_id);
      expect(data!.job_id).toBe(testEntry.job_id);
      expect(data!.service_id).toBe(testEntry.service_id);
      expect(data!.task_id).toBeNull(); // Only this should change
      expect(data!.duration_minutes).toBe(testEntry.duration_minutes);
      expect(data!.notes).toBe(testEntry.notes);

      // Cleanup
      await serviceClient.from('time_entries').delete().eq('id', testEntry.id);
    });
  });

  describe('Error handling documentation (AC: 5)', () => {
    it('FK_violation_returns_code_23503', async () => {
      // This documents the expected error code for FK violations
      // PostgreSQL error code 23503 = foreign_key_violation

      const { error } = await serviceClient
        .from('services')
        .delete()
        .eq('id', testData.service.id);

      expect(error).not.toBeNull();
      expect(error!.code).toBe('23503');
      // Error message format includes the constraint name and tables
      expect(error!.message).toMatch(/violates foreign key constraint/i);
    });
  });
});
