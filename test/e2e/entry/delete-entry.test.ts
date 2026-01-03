/**
 * Delete Time Entry E2E Tests
 * Story 4.6: Delete Own Time Entry
 *
 * Tests:
 * - AC6: Soft delete sets deleted_at timestamp
 * - AC6: Deleted entries no longer appear in queries
 * - AC5: Audit log records DELETE action
 * - User can only delete their own entries (RLS)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createServiceClient,
  createAuthUser,
  deleteAuthUser,
  createUserClient,
} from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';

// Test data for delete verification
const testData = {
  client: {
    id: 'f1111111-1111-4111-f111-111111111111',
    name: 'Delete Test Client',
    active: true,
  },
  project: {
    id: 'f2222222-2222-4222-f222-222222222222',
    name: 'Delete Test Project',
    active: true,
  },
  job: {
    id: 'f3333333-3333-4333-f333-333333333333',
    name: 'Delete Test Job',
    active: true,
  },
  service: {
    id: 'f4444444-4444-4444-f444-444444444444',
    name: 'Delete Test Service',
    active: true,
  },
  entries: {
    toDelete: {
      id: 'f5555555-5555-4555-f555-555555555555',
    },
    toKeep: {
      id: 'f6666666-6666-4666-f666-666666666666',
    },
    otherUser: {
      id: 'f7777777-7777-4777-f777-777777777777',
    },
  },
};

describe('Delete Time Entry (Story 4.6)', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Create departments
    const { error: deptError } = await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
    ], { onConflict: 'id' });
    if (deptError) console.error('Error creating departments:', deptError);

    // Create auth users
    const staffResult = await createAuthUser(testUsers.staff.id, testUsers.staff.email);
    if (!staffResult.success) console.error('Error creating auth user (staff):', staffResult.error);

    const managerResult = await createAuthUser(testUsers.manager.id, testUsers.manager.email);
    if (!managerResult.success) console.error('Error creating auth user (manager):', managerResult.error);

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
        id: testUsers.manager.id,
        email: testUsers.manager.email,
        role: testUsers.manager.role,
        department_id: testUsers.manager.departmentId,
        display_name: testUsers.manager.displayName,
      },
    ], { onConflict: 'id' });
    if (userError) console.error('Error creating users:', userError);

    // Create test master data
    await serviceClient.from('clients').upsert([testData.client], { onConflict: 'id' });
    await serviceClient.from('projects').upsert([{
      ...testData.project,
      client_id: testData.client.id,
    }], { onConflict: 'id' });
    await serviceClient.from('jobs').upsert([{
      ...testData.job,
      project_id: testData.project.id,
    }], { onConflict: 'id' });
    await serviceClient.from('services').upsert([testData.service], { onConflict: 'id' });

    // Create test time entries
    const today = new Date().toISOString().split('T')[0];
    await serviceClient.from('time_entries').upsert([
      {
        id: testData.entries.toDelete.id,
        user_id: testUsers.staff.id,
        job_id: testData.job.id,
        service_id: testData.service.id,
        duration_minutes: 60,
        entry_date: today,
        department_id: testDepartments.deptA.id,
      },
      {
        id: testData.entries.toKeep.id,
        user_id: testUsers.staff.id,
        job_id: testData.job.id,
        service_id: testData.service.id,
        duration_minutes: 120,
        entry_date: today,
        department_id: testDepartments.deptA.id,
      },
      {
        id: testData.entries.otherUser.id,
        user_id: testUsers.manager.id,
        job_id: testData.job.id,
        service_id: testData.service.id,
        duration_minutes: 90,
        entry_date: today,
        department_id: testDepartments.deptA.id,
      },
    ], { onConflict: 'id' });
  });

  afterAll(async () => {
    // Cleanup in reverse order
    await serviceClient.from('time_entries').delete().in('id', [
      testData.entries.toDelete.id,
      testData.entries.toKeep.id,
      testData.entries.otherUser.id,
    ]);
    await serviceClient.from('audit_logs').delete().in('record_id', [
      testData.entries.toDelete.id,
      testData.entries.toKeep.id,
      testData.entries.otherUser.id,
    ]);
    await serviceClient.from('jobs').delete().eq('id', testData.job.id);
    await serviceClient.from('projects').delete().eq('id', testData.project.id);
    await serviceClient.from('clients').delete().eq('id', testData.client.id);
    await serviceClient.from('services').delete().eq('id', testData.service.id);
    await serviceClient.from('users').delete().in('id', [testUsers.staff.id, testUsers.manager.id]);
    await deleteAuthUser(testUsers.staff.id);
    await deleteAuthUser(testUsers.manager.id);
    await serviceClient.from('departments').delete().eq('id', testDepartments.deptA.id);
  });

  describe('Soft Delete (AC6)', () => {
    it('sets deleted_at timestamp on delete', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      // Delete the entry using the SECURITY DEFINER function
      // This bypasses RLS "new row visible" check
      const { data: result, error } = await staffClient
        .rpc('soft_delete_time_entry' as never, { entry_id: testData.entries.toDelete.id } as never) as unknown as { data: { success: boolean } | null; error: Error | null };

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);

      // Verify using service client (bypasses RLS) that deleted_at was set
      const { data: verifyEntry } = await serviceClient
        .from('time_entries')
        .select('deleted_at')
        .eq('id', testData.entries.toDelete.id)
        .single();

      expect(verifyEntry).not.toBeNull();
      expect(verifyEntry!.deleted_at).not.toBeNull();
    });

    it('deleted entry no longer appears in user queries', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      // Query for the deleted entry
      const { data } = await staffClient
        .from('time_entries')
        .select('*')
        .eq('id', testData.entries.toDelete.id);

      // RLS should filter out deleted entries
      expect(data).toHaveLength(0);
    });

    it('non-deleted entry still appears in queries', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      // Query for the kept entry
      const { data } = await staffClient
        .from('time_entries')
        .select('*')
        .eq('id', testData.entries.toKeep.id);

      expect(data).toHaveLength(1);
      expect(data![0].deleted_at).toBeNull();
    });

    it('super_admin can still see deleted entries', async () => {
      // Use service client which bypasses RLS to verify data exists
      const { data } = await serviceClient
        .from('time_entries')
        .select('*')
        .eq('id', testData.entries.toDelete.id);

      expect(data).toHaveLength(1);
      expect(data![0].deleted_at).not.toBeNull();
    });
  });

  describe('RLS Protection', () => {
    it('user cannot delete other users entries', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      // Try to soft delete manager's entry using the RPC function
      const { data: result, error } = await staffClient
        .rpc('soft_delete_time_entry' as never, { entry_id: testData.entries.otherUser.id } as never) as unknown as { data: { success: boolean } | null; error: Error | null };

      // Function should return error (not owned by user)
      expect(error).toBeNull(); // RPC call itself succeeds
      expect(result).not.toBeNull();
      expect(result!.success).toBe(false);

      // Verify manager's entry is still there (not deleted)
      const { data: managerEntry } = await serviceClient
        .from('time_entries')
        .select('*')
        .eq('id', testData.entries.otherUser.id)
        .single();

      expect(managerEntry).not.toBeNull();
      expect(managerEntry!.deleted_at).toBeNull();
    });
  });

  describe('Audit Log (AC5)', () => {
    it('records DELETE action in audit_logs', async () => {
      // Check that the delete was recorded in audit logs
      const { data: auditLog } = await serviceClient
        .from('audit_logs')
        .select('*')
        .eq('record_id', testData.entries.toDelete.id)
        .eq('action', 'DELETE')
        .single();

      expect(auditLog).not.toBeNull();
      expect(auditLog!.table_name).toBe('time_entries');
      expect(auditLog!.old_data).not.toBeNull();
    });
  });

  describe('Double Delete Prevention', () => {
    it('cannot delete already deleted entry', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      // Try to delete the already deleted entry using the RPC function
      const { data: result, error } = await staffClient
        .rpc('soft_delete_time_entry' as never, { entry_id: testData.entries.toDelete.id } as never) as unknown as { data: { success: boolean } | null; error: Error | null };

      // Function should return error (already deleted)
      expect(error).toBeNull(); // RPC call itself succeeds
      expect(result).not.toBeNull();
      expect(result!.success).toBe(false);
    });
  });
});
