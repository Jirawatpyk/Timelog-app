/**
 * Audit Trigger E2E Tests
 * Story 8.6: Audit Log Database Trigger
 *
 * Tests:
 * - INSERT creates audit log (AC: 1)
 * - UPDATE creates audit log with old/new data (AC: 2)
 * - Soft DELETE creates DELETE audit log (AC: 3)
 * - Admin can view audit logs (AC: 5)
 * - Super Admin can view audit logs (AC: 5)
 * - Manager cannot view audit logs (AC: 5)
 * - Staff cannot view audit logs (AC: 5)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServiceClient, createUserClient, createAuthUser, deleteAuthUser } from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';
import { testJobs, testServices, testClients, testProjects } from '../../fixtures/master-data';

// Unique test entry IDs for this test suite
const TEST_ENTRY_IDS = {
  insertTest: 'e8600000-0000-4000-a001-000000000001',
  updateTest: 'e8600000-0000-4000-a002-000000000002',
  deleteTest: 'e8600000-0000-4000-a003-000000000003',
};

describe('Audit Trigger E2E Tests', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Setup test data using service client (bypasses RLS)
    // 1. Create departments
    const { error: deptError } = await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
    ], { onConflict: 'id' });
    if (deptError) console.error('Error creating departments:', deptError);

    // 2. Create auth users first (required for foreign key constraint)
    await createAuthUser(testUsers.admin.id, testUsers.admin.email);
    await createAuthUser(testUsers.staff.id, testUsers.staff.email);
    await createAuthUser(testUsers.manager.id, testUsers.manager.email);
    await createAuthUser(testUsers.superAdmin.id, testUsers.superAdmin.email);

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
        id: testUsers.staff.id,
        email: testUsers.staff.email,
        role: testUsers.staff.role,
        department_id: testUsers.staff.departmentId,
        display_name: testUsers.staff.displayName,
      },
      {
        id: testUsers.manager.id,
        email: testUsers.manager.email,
        role: testUsers.manager.role,
        department_id: testUsers.manager.departmentId,
        display_name: testUsers.manager.displayName,
      },
      {
        id: testUsers.superAdmin.id,
        email: testUsers.superAdmin.email,
        role: testUsers.superAdmin.role,
        department_id: testUsers.superAdmin.departmentId,
        display_name: testUsers.superAdmin.displayName,
      },
    ], { onConflict: 'id' });
    if (userError) console.error('Error creating users:', userError);

    // 4. Create master data
    const { error: clientError } = await serviceClient.from('clients').upsert([
      { id: testClients.clientA.id, name: testClients.clientA.name, active: true },
    ], { onConflict: 'id' });
    if (clientError) console.error('Error creating clients:', clientError);

    const { error: projectError } = await serviceClient.from('projects').upsert([
      { id: testProjects.projectA.id, client_id: testClients.clientA.id, name: testProjects.projectA.name, active: true },
    ], { onConflict: 'id' });
    if (projectError) console.error('Error creating projects:', projectError);

    const { error: jobError } = await serviceClient.from('jobs').upsert([
      { id: testJobs.jobA.id, project_id: testProjects.projectA.id, name: testJobs.jobA.name, job_no: testJobs.jobA.jobNo, active: true },
    ], { onConflict: 'id' });
    if (jobError) console.error('Error creating jobs:', jobError);

    const { error: serviceError } = await serviceClient.from('services').upsert([
      { id: testServices.serviceA.id, name: testServices.serviceA.name, active: true },
    ], { onConflict: 'id' });
    if (serviceError) console.error('Error creating services:', serviceError);

    // 5. Clean up any existing audit logs for test entries
    await serviceClient.from('audit_logs').delete().in('record_id', Object.values(TEST_ENTRY_IDS));
  });

  afterAll(async () => {
    // Cleanup test data
    await serviceClient.from('time_entries').delete().in('id', Object.values(TEST_ENTRY_IDS));
    await serviceClient.from('audit_logs').delete().in('record_id', Object.values(TEST_ENTRY_IDS));
    await serviceClient.from('users').delete().in('id', [
      testUsers.admin.id,
      testUsers.staff.id,
      testUsers.manager.id,
      testUsers.superAdmin.id,
    ]);
    await deleteAuthUser(testUsers.admin.id);
    await deleteAuthUser(testUsers.staff.id);
    await deleteAuthUser(testUsers.manager.id);
    await deleteAuthUser(testUsers.superAdmin.id);
    await serviceClient.from('jobs').delete().eq('id', testJobs.jobA.id);
    await serviceClient.from('projects').delete().eq('id', testProjects.projectA.id);
    await serviceClient.from('clients').delete().eq('id', testClients.clientA.id);
    await serviceClient.from('services').delete().eq('id', testServices.serviceA.id);
    await serviceClient.from('departments').delete().eq('id', testDepartments.deptA.id);
  });

  describe('AC 1: INSERT Logging', () => {
    it('creates audit log when time entry is INSERTed', async () => {
      const newEntry = {
        id: TEST_ENTRY_IDS.insertTest,
        user_id: testUsers.staff.id,
        job_id: testJobs.jobA.id,
        service_id: testServices.serviceA.id,
        duration_minutes: 120,
        entry_date: '2026-01-05',
        department_id: testDepartments.deptA.id,
        notes: 'Test entry for INSERT audit log',
      };

      // Insert time entry
      const { error: insertError } = await serviceClient
        .from('time_entries')
        .insert(newEntry);

      expect(insertError).toBeNull();

      // Verify audit log was created
      const { data: auditLogs, error: auditError } = await serviceClient
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'time_entries')
        .eq('record_id', TEST_ENTRY_IDS.insertTest)
        .eq('action', 'INSERT');

      expect(auditError).toBeNull();
      expect(auditLogs).not.toBeNull();
      expect(auditLogs!.length).toBe(1);

      const auditLog = auditLogs![0];
      expect(auditLog.action).toBe('INSERT');
      expect(auditLog.old_data).toBeNull();
      expect(auditLog.new_data).not.toBeNull();
      expect(auditLog.user_id).toBe(testUsers.staff.id);
      expect(auditLog.created_at).toBeDefined();

      // Verify new_data contains the entry data
      const newData = auditLog.new_data as Record<string, unknown>;
      expect(newData.id).toBe(TEST_ENTRY_IDS.insertTest);
      expect(newData.duration_minutes).toBe(120);
    });
  });

  describe('AC 2: UPDATE Logging', () => {
    it('creates audit log when time entry is UPDATEd', async () => {
      // First create an entry
      const entryId = TEST_ENTRY_IDS.updateTest;
      await serviceClient.from('time_entries').insert({
        id: entryId,
        user_id: testUsers.staff.id,
        job_id: testJobs.jobA.id,
        service_id: testServices.serviceA.id,
        duration_minutes: 60,
        entry_date: '2026-01-05',
        department_id: testDepartments.deptA.id,
        notes: 'Original notes',
      });

      // Update the entry
      const { error: updateError } = await serviceClient
        .from('time_entries')
        .update({ duration_minutes: 90, notes: 'Updated notes' })
        .eq('id', entryId);

      expect(updateError).toBeNull();

      // Verify UPDATE audit log was created
      const { data: auditLogs, error: auditError } = await serviceClient
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'time_entries')
        .eq('record_id', entryId)
        .eq('action', 'UPDATE');

      expect(auditError).toBeNull();
      expect(auditLogs).not.toBeNull();
      expect(auditLogs!.length).toBe(1);

      const auditLog = auditLogs![0];
      expect(auditLog.action).toBe('UPDATE');
      expect(auditLog.old_data).not.toBeNull();
      expect(auditLog.new_data).not.toBeNull();

      // Verify old_data contains original values
      const oldData = auditLog.old_data as Record<string, unknown>;
      expect(oldData.duration_minutes).toBe(60);
      expect(oldData.notes).toBe('Original notes');

      // Verify new_data contains updated values
      const newData = auditLog.new_data as Record<string, unknown>;
      expect(newData.duration_minutes).toBe(90);
      expect(newData.notes).toBe('Updated notes');
    });
  });

  describe('AC 3: Soft DELETE Logging', () => {
    it('creates DELETE audit log when deleted_at is set', async () => {
      // First create an entry
      const entryId = TEST_ENTRY_IDS.deleteTest;
      await serviceClient.from('time_entries').insert({
        id: entryId,
        user_id: testUsers.staff.id,
        job_id: testJobs.jobA.id,
        service_id: testServices.serviceA.id,
        duration_minutes: 45,
        entry_date: '2026-01-05',
        department_id: testDepartments.deptA.id,
        notes: 'Entry to be soft deleted',
      });

      // Soft delete by setting deleted_at
      const { error: deleteError } = await serviceClient
        .from('time_entries')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', entryId);

      expect(deleteError).toBeNull();

      // Verify DELETE audit log was created
      const { data: auditLogs, error: auditError } = await serviceClient
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'time_entries')
        .eq('record_id', entryId)
        .eq('action', 'DELETE');

      expect(auditError).toBeNull();
      expect(auditLogs).not.toBeNull();
      expect(auditLogs!.length).toBe(1);

      const auditLog = auditLogs![0];
      expect(auditLog.action).toBe('DELETE');
      expect(auditLog.old_data).not.toBeNull();
      // new_data is null for DELETE action per AC 3
      expect(auditLog.new_data).toBeNull();

      // Verify old_data contains the deleted row
      const oldData = auditLog.old_data as Record<string, unknown>;
      expect(oldData.id).toBe(entryId);
      expect(oldData.notes).toBe('Entry to be soft deleted');
    });
  });

  describe('AC 5: Audit Log Access Control', () => {
    it('admin can view audit logs', async () => {
      const adminClient = await createUserClient(testUsers.admin.email);

      const { data, error } = await adminClient
        .from('audit_logs')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // Admin should see audit logs from our tests (at least INSERT from AC 1)
      expect(data!.length).toBeGreaterThan(0);
    });

    it('super admin can view audit logs', async () => {
      const superAdminClient = await createUserClient(testUsers.superAdmin.email);

      const { data, error } = await superAdminClient
        .from('audit_logs')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // Super Admin should see audit logs from our tests
      expect(data!.length).toBeGreaterThan(0);
    });

    it('manager cannot view audit logs', async () => {
      const managerClient = await createUserClient(testUsers.manager.email);

      const { data, error } = await managerClient
        .from('audit_logs')
        .select('*')
        .limit(10);

      // RLS should prevent manager from seeing any audit logs
      // Supabase returns empty array when RLS denies access (not an error)
      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it('staff cannot view audit logs', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('audit_logs')
        .select('*')
        .limit(10);

      // RLS should prevent staff from seeing any audit logs
      // Supabase returns empty array when RLS denies access (not an error)
      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });
  });
});
