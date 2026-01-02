/**
 * Recent Combinations E2E Tests
 * Story 4.7: Recent Combinations Quick Entry
 *
 * Tests:
 * - AC1: Display up to 5 recent combinations
 * - AC2: Combinations include client, project, job, service, task
 * - AC4: Combination updates on save (upsert)
 * - AC5: Empty state for new users
 * - AC7: Deduplication - same combination appears once
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createServiceClient,
  createAuthUser,
  deleteAuthUser,
  createUserClient,
} from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';

// Test data for recent combinations verification
const testData = {
  client1: {
    id: 'e1111111-1111-4111-e111-111111111111',
    name: 'Recent Test Client 1',
    active: true,
  },
  client2: {
    id: 'e1111111-1111-4111-e111-111111111112',
    name: 'Recent Test Client 2',
    active: true,
  },
  project1: {
    id: 'e2222222-2222-4222-e222-222222222221',
    name: 'Recent Test Project 1',
    active: true,
  },
  project2: {
    id: 'e2222222-2222-4222-e222-222222222222',
    name: 'Recent Test Project 2',
    active: true,
  },
  job1: {
    id: 'e3333333-3333-4333-e333-333333333331',
    name: 'Recent Test Job 1',
    job_no: 'RTJ001',
    active: true,
  },
  job2: {
    id: 'e3333333-3333-4333-e333-333333333332',
    name: 'Recent Test Job 2',
    job_no: null,
    active: true,
  },
  service1: {
    id: 'e4444444-4444-4444-e444-444444444441',
    name: 'Recent Test Service 1',
    active: true,
  },
  service2: {
    id: 'e4444444-4444-4444-e444-444444444442',
    name: 'Recent Test Service 2',
    active: true,
  },
  task1: {
    id: 'e5555555-5555-4555-e555-555555555551',
    name: 'Recent Test Task 1',
    active: true,
  },
  combinations: {
    combo1: { id: 'e6666666-6666-4666-e666-666666666661' },
    combo2: { id: 'e6666666-6666-4666-e666-666666666662' },
    combo3: { id: 'e6666666-6666-4666-e666-666666666663' },
    combo4: { id: 'e6666666-6666-4666-e666-666666666664' },
    combo5: { id: 'e6666666-6666-4666-e666-666666666665' },
    combo6: { id: 'e6666666-6666-4666-e666-666666666666' }, // This should be removed when 6th is added
  },
};

describe('Recent Combinations (Story 4.7)', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Create department
    await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
    ], { onConflict: 'id' });

    // Create auth user
    const staffResult = await createAuthUser(testUsers.staff.id, testUsers.staff.email);
    if (!staffResult.success) console.error('Error creating auth user:', staffResult.error);

    // Create user in public.users
    await serviceClient.from('users').upsert([
      {
        id: testUsers.staff.id,
        email: testUsers.staff.email,
        role: testUsers.staff.role,
        department_id: testUsers.staff.departmentId,
        display_name: testUsers.staff.displayName,
      },
    ], { onConflict: 'id' });

    // Create master data
    await serviceClient.from('clients').upsert([testData.client1, testData.client2], { onConflict: 'id' });
    await serviceClient.from('projects').upsert([
      { ...testData.project1, client_id: testData.client1.id },
      { ...testData.project2, client_id: testData.client2.id },
    ], { onConflict: 'id' });
    await serviceClient.from('jobs').upsert([
      { ...testData.job1, project_id: testData.project1.id },
      { ...testData.job2, project_id: testData.project2.id },
    ], { onConflict: 'id' });
    await serviceClient.from('services').upsert([testData.service1, testData.service2], { onConflict: 'id' });
    await serviceClient.from('tasks').upsert([testData.task1], { onConflict: 'id' });
  });

  afterAll(async () => {
    // Cleanup in reverse order
    await serviceClient.from('user_recent_combinations').delete().eq('user_id', testUsers.staff.id);
    await serviceClient.from('tasks').delete().eq('id', testData.task1.id);
    await serviceClient.from('jobs').delete().in('id', [testData.job1.id, testData.job2.id]);
    await serviceClient.from('projects').delete().in('id', [testData.project1.id, testData.project2.id]);
    await serviceClient.from('services').delete().in('id', [testData.service1.id, testData.service2.id]);
    await serviceClient.from('clients').delete().in('id', [testData.client1.id, testData.client2.id]);
    await serviceClient.from('users').delete().eq('id', testUsers.staff.id);
    await deleteAuthUser(testUsers.staff.id);
    await serviceClient.from('departments').delete().eq('id', testDepartments.deptA.id);
  });

  beforeEach(async () => {
    // Clean up recent combinations before each test
    await serviceClient.from('user_recent_combinations').delete().eq('user_id', testUsers.staff.id);
  });

  describe('Empty State (AC5)', () => {
    it('returns empty array for user with no recent combinations', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('user_recent_combinations')
        .select('*')
        .eq('user_id', testUsers.staff.id)
        .order('last_used_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });
  });

  describe('Fetch Recent Combinations (AC1, AC2)', () => {
    beforeEach(async () => {
      // Create 3 test combinations
      const now = new Date();
      await serviceClient.from('user_recent_combinations').insert([
        {
          id: testData.combinations.combo1.id,
          user_id: testUsers.staff.id,
          client_id: testData.client1.id,
          project_id: testData.project1.id,
          job_id: testData.job1.id,
          service_id: testData.service1.id,
          task_id: testData.task1.id,
          last_used_at: new Date(now.getTime() - 1000).toISOString(), // 1 second ago
        },
        {
          id: testData.combinations.combo2.id,
          user_id: testUsers.staff.id,
          client_id: testData.client2.id,
          project_id: testData.project2.id,
          job_id: testData.job2.id,
          service_id: testData.service2.id,
          task_id: null, // No task
          last_used_at: new Date(now.getTime() - 2000).toISOString(), // 2 seconds ago
        },
        {
          id: testData.combinations.combo3.id,
          user_id: testUsers.staff.id,
          client_id: testData.client1.id,
          project_id: testData.project1.id,
          job_id: testData.job1.id,
          service_id: testData.service2.id, // Different service
          task_id: null,
          last_used_at: new Date(now.getTime() - 3000).toISOString(), // 3 seconds ago
        },
      ]);
    });

    it('fetches combinations ordered by last_used_at descending', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('user_recent_combinations')
        .select(`
          id,
          client:clients (id, name),
          project:projects (id, name),
          job:jobs (id, name, job_no),
          service:services (id, name),
          task:tasks (id, name)
        `)
        .eq('user_id', testUsers.staff.id)
        .order('last_used_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toHaveLength(3);

      // First should be combo1 (most recent)
      expect(data![0].id).toBe(testData.combinations.combo1.id);
      // Last should be combo3 (oldest)
      expect(data![2].id).toBe(testData.combinations.combo3.id);
    });

    it('includes joined data for client, project, job, service (AC2)', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('user_recent_combinations')
        .select(`
          id,
          client:clients (id, name),
          project:projects (id, name),
          job:jobs (id, name, job_no),
          service:services (id, name),
          task:tasks (id, name)
        `)
        .eq('id', testData.combinations.combo1.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      // Verify joined data
      expect((data!.client as { name: string }).name).toBe(testData.client1.name);
      expect((data!.project as { name: string }).name).toBe(testData.project1.name);
      expect((data!.job as { name: string; job_no: string | null }).name).toBe(testData.job1.name);
      expect((data!.job as { job_no: string | null }).job_no).toBe(testData.job1.job_no);
      expect((data!.service as { name: string }).name).toBe(testData.service1.name);
      expect((data!.task as { name: string } | null)?.name).toBe(testData.task1.name);
    });

    it('handles null task correctly', async () => {
      const staffClient = await createUserClient(testUsers.staff.email);

      const { data, error } = await staffClient
        .from('user_recent_combinations')
        .select(`
          id,
          task:tasks (id, name)
        `)
        .eq('id', testData.combinations.combo2.id)
        .single();

      expect(error).toBeNull();
      expect(data!.task).toBeNull();
    });
  });

  describe('5 Combination Limit (AC1)', () => {
    it('limits to 5 most recent combinations per user', async () => {
      const now = new Date();

      // Create 6 combinations
      await serviceClient.from('user_recent_combinations').insert([
        {
          id: testData.combinations.combo1.id,
          user_id: testUsers.staff.id,
          client_id: testData.client1.id,
          project_id: testData.project1.id,
          job_id: testData.job1.id,
          service_id: testData.service1.id,
          task_id: null,
          last_used_at: new Date(now.getTime() - 1000).toISOString(),
        },
        {
          id: testData.combinations.combo2.id,
          user_id: testUsers.staff.id,
          client_id: testData.client1.id,
          project_id: testData.project1.id,
          job_id: testData.job1.id,
          service_id: testData.service2.id,
          task_id: null,
          last_used_at: new Date(now.getTime() - 2000).toISOString(),
        },
        {
          id: testData.combinations.combo3.id,
          user_id: testUsers.staff.id,
          client_id: testData.client2.id,
          project_id: testData.project2.id,
          job_id: testData.job2.id,
          service_id: testData.service1.id,
          task_id: null,
          last_used_at: new Date(now.getTime() - 3000).toISOString(),
        },
        {
          id: testData.combinations.combo4.id,
          user_id: testUsers.staff.id,
          client_id: testData.client2.id,
          project_id: testData.project2.id,
          job_id: testData.job2.id,
          service_id: testData.service2.id,
          task_id: null,
          last_used_at: new Date(now.getTime() - 4000).toISOString(),
        },
        {
          id: testData.combinations.combo5.id,
          user_id: testUsers.staff.id,
          client_id: testData.client1.id,
          project_id: testData.project1.id,
          job_id: testData.job1.id,
          service_id: testData.service1.id,
          task_id: testData.task1.id,
          last_used_at: new Date(now.getTime() - 5000).toISOString(),
        },
        {
          id: testData.combinations.combo6.id,
          user_id: testUsers.staff.id,
          client_id: testData.client2.id,
          project_id: testData.project2.id,
          job_id: testData.job2.id,
          service_id: testData.service1.id,
          task_id: testData.task1.id,
          last_used_at: new Date(now.getTime() - 6000).toISOString(), // Oldest
        },
      ]);

      const staffClient = await createUserClient(testUsers.staff.email);

      // Query with limit 5 (as app would do)
      const { data, error } = await staffClient
        .from('user_recent_combinations')
        .select('id')
        .eq('user_id', testUsers.staff.id)
        .order('last_used_at', { ascending: false })
        .limit(5);

      expect(error).toBeNull();
      expect(data).toHaveLength(5);

      // Oldest (combo6) should NOT be in results
      const ids = data!.map((d) => d.id);
      expect(ids).not.toContain(testData.combinations.combo6.id);

      // Most recent (combo1) should be first
      expect(ids[0]).toBe(testData.combinations.combo1.id);
    });
  });

  describe('Deduplication (AC7)', () => {
    it('same combination appears only once (unique constraint)', async () => {
      // Try to insert duplicate combination
      const { error: insertError } = await serviceClient
        .from('user_recent_combinations')
        .insert({
          id: testData.combinations.combo1.id,
          user_id: testUsers.staff.id,
          client_id: testData.client1.id,
          project_id: testData.project1.id,
          job_id: testData.job1.id,
          service_id: testData.service1.id,
          task_id: null,
          last_used_at: new Date().toISOString(),
        });

      expect(insertError).toBeNull();

      // Try to insert same combination again (should violate unique constraint)
      const { error: duplicateError } = await serviceClient
        .from('user_recent_combinations')
        .insert({
          id: testData.combinations.combo2.id, // Different ID
          user_id: testUsers.staff.id,
          client_id: testData.client1.id, // Same combination
          project_id: testData.project1.id,
          job_id: testData.job1.id,
          service_id: testData.service1.id,
          task_id: null,
          last_used_at: new Date().toISOString(),
        });

      // Should fail due to unique constraint on (user_id, client_id, project_id, job_id, service_id, task_id)
      expect(duplicateError).not.toBeNull();
      expect(duplicateError!.code).toBe('23505'); // Unique violation
    });

    it('upsert updates last_used_at for existing combination', async () => {
      const initialTime = new Date('2024-01-01T10:00:00Z').toISOString();
      const updateTime = new Date('2024-01-02T10:00:00Z').toISOString();

      // Insert initial combination
      await serviceClient.from('user_recent_combinations').insert({
        id: testData.combinations.combo1.id,
        user_id: testUsers.staff.id,
        client_id: testData.client1.id,
        project_id: testData.project1.id,
        job_id: testData.job1.id,
        service_id: testData.service1.id,
        task_id: null,
        last_used_at: initialTime,
      });

      // Update the same combination
      await serviceClient
        .from('user_recent_combinations')
        .update({ last_used_at: updateTime })
        .eq('id', testData.combinations.combo1.id);

      // Verify it was updated
      const { data } = await serviceClient
        .from('user_recent_combinations')
        .select('last_used_at')
        .eq('id', testData.combinations.combo1.id)
        .single();

      // Compare as Date objects since Postgres returns different format (+00:00 vs Z)
      expect(new Date(data!.last_used_at).getTime()).toBe(new Date(updateTime).getTime());
    });
  });

  describe('RLS Protection', () => {
    it('user can only see their own combinations', async () => {
      // Create combination for staff user
      await serviceClient.from('user_recent_combinations').insert({
        id: testData.combinations.combo1.id,
        user_id: testUsers.staff.id,
        client_id: testData.client1.id,
        project_id: testData.project1.id,
        job_id: testData.job1.id,
        service_id: testData.service1.id,
        task_id: null,
        last_used_at: new Date().toISOString(),
      });

      // Create another user to test isolation
      const managerResult = await createAuthUser(testUsers.manager.id, testUsers.manager.email);
      if (!managerResult.success) console.error('Error creating manager:', managerResult.error);

      await serviceClient.from('users').upsert([
        {
          id: testUsers.manager.id,
          email: testUsers.manager.email,
          role: testUsers.manager.role,
          department_id: testUsers.manager.departmentId,
          display_name: testUsers.manager.displayName,
        },
      ], { onConflict: 'id' });

      try {
        // Manager should not see staff's combinations
        const managerClient = await createUserClient(testUsers.manager.email);
        const { data } = await managerClient
          .from('user_recent_combinations')
          .select('*')
          .eq('user_id', testUsers.staff.id);

        // RLS should filter out other user's combinations
        expect(data).toHaveLength(0);
      } finally {
        // Cleanup manager
        await serviceClient.from('users').delete().eq('id', testUsers.manager.id);
        await deleteAuthUser(testUsers.manager.id);
      }
    });
  });
});
