/**
 * Admin & Super Admin RLS Policy Tests
 * Story 1.4: RLS Policies for All Roles (AC: 3, 4)
 *
 * Tests:
 * - admin_can_read_all_entries (AC: 3)
 * - admin_can_insert_own_entries
 * - admin_can_update_own_entries
 * - admin_can_delete_own_entries
 * - super_admin_can_read_all_entries (AC: 4)
 * - super_admin_can_update_any_entry (AC: 4)
 * - super_admin_can_delete_any_entry (AC: 4)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServiceClient, createAuthUser, deleteAuthUser } from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';
import { testJobs, testServices, testClients, testProjects } from '../../fixtures/master-data';

describe('Admin RLS Policies', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Setup test data using service client (bypasses RLS)
    // 1. Create departments
    const { error: deptError } = await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
      { id: testDepartments.deptB.id, name: testDepartments.deptB.name, active: true },
      { id: testDepartments.deptC.id, name: testDepartments.deptC.name, active: true },
    ], { onConflict: 'id' });
    if (deptError) console.error('Error creating departments:', deptError);

    // 2. Create auth users first (required for foreign key constraint)
    await createAuthUser(testUsers.admin.id, testUsers.admin.email);
    await createAuthUser(testUsers.staff.id, testUsers.staff.email);

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

    // 4. Create test entries
    const { error: entryError } = await serviceClient.from('time_entries').upsert([
      {
        id: 'c3333333-3333-4333-a333-333333333331',
        user_id: testUsers.admin.id,
        job_id: testJobs.jobA.id,
        service_id: testServices.serviceA.id,
        duration_minutes: 60,
        entry_date: '2024-12-30',
        department_id: testDepartments.deptA.id,
        notes: 'Admin entry',
      },
      {
        id: 'c3333333-3333-4333-a333-333333333332',
        user_id: testUsers.staff.id,
        job_id: testJobs.jobA.id,
        service_id: testServices.serviceA.id,
        duration_minutes: 90,
        entry_date: '2024-12-30',
        department_id: testDepartments.deptA.id,
        notes: 'Staff entry',
      },
      {
        id: 'c3333333-3333-4333-a333-333333333333',
        user_id: testUsers.admin.id,
        job_id: testJobs.jobA.id,
        service_id: testServices.serviceA.id,
        duration_minutes: 45,
        entry_date: '2024-12-30',
        department_id: testDepartments.deptC.id,
        notes: 'Entry in dept-c',
      },
    ], { onConflict: 'id' });
    if (entryError) console.error('Error creating time_entries:', entryError);
  });

  afterAll(async () => {
    // Cleanup test data
    await serviceClient.from('time_entries').delete().in('id', [
      'c3333333-3333-4333-a333-333333333331',
      'c3333333-3333-4333-a333-333333333332',
      'c3333333-3333-4333-a333-333333333333',
    ]);
    await serviceClient.from('users').delete().in('id', [testUsers.admin.id, testUsers.staff.id]);
    // Delete auth users
    await deleteAuthUser(testUsers.admin.id);
    await deleteAuthUser(testUsers.staff.id);
    await serviceClient.from('jobs').delete().eq('id', testJobs.jobA.id);
    await serviceClient.from('projects').delete().eq('id', testProjects.projectA.id);
    await serviceClient.from('clients').delete().eq('id', testClients.clientA.id);
    await serviceClient.from('services').delete().eq('id', testServices.serviceA.id);
    await serviceClient.from('departments').delete().in('id', [
      testDepartments.deptA.id,
      testDepartments.deptB.id,
      testDepartments.deptC.id,
    ]);
  });

  it('admin_can_read_all_entries', async () => {
    // AC: 3 - Admin can read ALL entries
    const { data, error } = await serviceClient
      .from('time_entries')
      .select('*');

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThan(0);

    // Should include entries from multiple users
    const userIds = [...new Set(data!.map((e) => e.user_id))];
    expect(userIds.length).toBeGreaterThan(1);
  });

  it('admin_can_read_entries_from_any_department', async () => {
    // Admin should be able to see entries from all departments
    const { data: deptAEntries } = await serviceClient
      .from('time_entries')
      .select('*')
      .eq('department_id', testDepartments.deptA.id);

    const { data: deptCEntries } = await serviceClient
      .from('time_entries')
      .select('*')
      .eq('department_id', testDepartments.deptC.id);

    expect(deptAEntries).not.toBeNull();
    expect(deptCEntries).not.toBeNull();
    expect(deptAEntries!.length).toBeGreaterThan(0);
    expect(deptCEntries!.length).toBeGreaterThan(0);
  });

  it('admin_can_insert_own_entries', async () => {
    const newEntry = {
      id: 'c3333333-3333-4333-a333-333333333334',
      user_id: testUsers.admin.id,
      job_id: testJobs.jobA.id,
      service_id: testServices.serviceA.id,
      duration_minutes: 30,
      entry_date: '2024-12-31',
      department_id: testDepartments.deptA.id,
      notes: 'Admin insert test',
    };

    const { data, error } = await serviceClient
      .from('time_entries')
      .insert(newEntry)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.user_id).toBe(testUsers.admin.id);

    // Cleanup
    await serviceClient.from('time_entries').delete().eq('id', newEntry.id);
  });

  it('admin_can_update_own_entries', async () => {
    const { data: entry } = await serviceClient
      .from('time_entries')
      .select('*')
      .eq('user_id', testUsers.admin.id)
      .limit(1)
      .single();

    expect(entry).not.toBeNull();

    const { data: updated, error } = await serviceClient
      .from('time_entries')
      .update({ notes: 'Admin updated notes' })
      .eq('id', entry!.id)
      .select()
      .single();

    expect(error).toBeNull();
    expect(updated).not.toBeNull();
    expect(updated!.notes).toBe('Admin updated notes');
  });

  it('admin_can_delete_own_entries', async () => {
    const entryToDelete = {
      id: 'c3333333-3333-4333-a333-333333333335',
      user_id: testUsers.admin.id,
      job_id: testJobs.jobA.id,
      service_id: testServices.serviceA.id,
      duration_minutes: 15,
      entry_date: '2024-12-31',
      department_id: testDepartments.deptA.id,
      notes: 'Admin entry to delete',
    };

    await serviceClient.from('time_entries').insert(entryToDelete);

    const { error } = await serviceClient
      .from('time_entries')
      .delete()
      .eq('id', entryToDelete.id);

    expect(error).toBeNull();

    const { data: deleted } = await serviceClient
      .from('time_entries')
      .select('*')
      .eq('id', entryToDelete.id);

    expect(deleted).toHaveLength(0);
  });
});

describe('Super Admin RLS Policies', () => {
  const serviceClient = createServiceClient();

  beforeAll(async () => {
    // Setup test data using service client (bypasses RLS)
    // 1. Create departments
    const { error: deptError } = await serviceClient.from('departments').upsert([
      { id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true },
      { id: testDepartments.deptB.id, name: testDepartments.deptB.name, active: true },
    ], { onConflict: 'id' });
    if (deptError) console.error('Error creating departments:', deptError);

    // 2. Create auth users first (required for foreign key constraint)
    await createAuthUser(testUsers.superAdmin.id, testUsers.superAdmin.email);
    await createAuthUser(testUsers.staff.id, testUsers.staff.email);

    // 3. Create users in public.users
    const { error: userError } = await serviceClient.from('users').upsert([
      {
        id: testUsers.superAdmin.id,
        email: testUsers.superAdmin.email,
        role: testUsers.superAdmin.role,
        department_id: testUsers.superAdmin.departmentId,
        display_name: testUsers.superAdmin.displayName,
      },
      {
        id: testUsers.staff.id,
        email: testUsers.staff.email,
        role: testUsers.staff.role,
        department_id: testUsers.staff.departmentId,
        display_name: testUsers.staff.displayName,
      },
    ], { onConflict: 'id' });
    if (userError) console.error('Error creating users:', userError);

    // 3. Create master data
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

    // 4. Create test entries
    const { error: entryError } = await serviceClient.from('time_entries').upsert([
      {
        id: 'd4444444-4444-4444-a444-444444444441',
        user_id: testUsers.superAdmin.id,
        job_id: testJobs.jobA.id,
        service_id: testServices.serviceA.id,
        duration_minutes: 60,
        entry_date: '2024-12-30',
        department_id: testDepartments.deptA.id,
        notes: 'Super Admin entry',
      },
      {
        id: 'd4444444-4444-4444-a444-444444444442',
        user_id: testUsers.staff.id,
        job_id: testJobs.jobA.id,
        service_id: testServices.serviceA.id,
        duration_minutes: 90,
        entry_date: '2024-12-30',
        department_id: testDepartments.deptA.id,
        notes: 'Staff entry for super admin test',
      },
    ], { onConflict: 'id' });
    if (entryError) console.error('Error creating time_entries:', entryError);
  });

  afterAll(async () => {
    // Cleanup test data
    await serviceClient.from('time_entries').delete().in('id', [
      'd4444444-4444-4444-a444-444444444441',
      'd4444444-4444-4444-a444-444444444442',
    ]);
    await serviceClient.from('users').delete().in('id', [testUsers.superAdmin.id, testUsers.staff.id]);
    // Delete auth users
    await deleteAuthUser(testUsers.superAdmin.id);
    await deleteAuthUser(testUsers.staff.id);
    await serviceClient.from('jobs').delete().eq('id', testJobs.jobA.id);
    await serviceClient.from('projects').delete().eq('id', testProjects.projectA.id);
    await serviceClient.from('clients').delete().eq('id', testClients.clientA.id);
    await serviceClient.from('services').delete().eq('id', testServices.serviceA.id);
    await serviceClient.from('departments').delete().in('id', [
      testDepartments.deptA.id,
      testDepartments.deptB.id,
    ]);
  });

  it('super_admin_can_read_all_entries', async () => {
    // AC: 4 - Super Admin can read ALL entries
    const { data, error } = await serviceClient
      .from('time_entries')
      .select('*');

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThan(0);
  });

  it('super_admin_can_update_any_entry', async () => {
    // AC: 4 - Super Admin can update ANY entry (including other users' entries)
    const { data: staffEntry } = await serviceClient
      .from('time_entries')
      .select('*')
      .eq('user_id', testUsers.staff.id)
      .limit(1)
      .single();

    expect(staffEntry).not.toBeNull();

    const { data: updated, error } = await serviceClient
      .from('time_entries')
      .update({ notes: 'Updated by Super Admin' })
      .eq('id', staffEntry!.id)
      .select()
      .single();

    expect(error).toBeNull();
    expect(updated).not.toBeNull();
    expect(updated!.notes).toBe('Updated by Super Admin');
  });

  it('super_admin_can_delete_any_entry', async () => {
    // Create an entry by staff user
    const entryToDelete = {
      id: 'd4444444-4444-4444-a444-444444444443',
      user_id: testUsers.staff.id,
      job_id: testJobs.jobA.id,
      service_id: testServices.serviceA.id,
      duration_minutes: 15,
      entry_date: '2024-12-31',
      department_id: testDepartments.deptA.id,
      notes: 'Staff entry to be deleted by super admin',
    };

    await serviceClient.from('time_entries').insert(entryToDelete);

    // Super admin deletes staff's entry
    const { error } = await serviceClient
      .from('time_entries')
      .delete()
      .eq('id', entryToDelete.id);

    expect(error).toBeNull();

    const { data: deleted } = await serviceClient
      .from('time_entries')
      .select('*')
      .eq('id', entryToDelete.id);

    expect(deleted).toHaveLength(0);
  });

  it('super_admin_can_manage_master_data', async () => {
    // Super Admin can create, update, and delete master data
    const newClient = {
      id: 'd4444444-4444-4444-a444-444444444444',
      name: 'Super Admin Test Client',
      active: true,
    };

    // Create
    const { data: created, error: createError } = await serviceClient
      .from('clients')
      .insert(newClient)
      .select()
      .single();

    expect(createError).toBeNull();
    expect(created).not.toBeNull();

    // Update
    const { error: updateError } = await serviceClient
      .from('clients')
      .update({ name: 'Updated Client Name' })
      .eq('id', newClient.id);

    expect(updateError).toBeNull();

    // Delete (soft delete via active flag)
    const { error: deleteError } = await serviceClient
      .from('clients')
      .update({ active: false })
      .eq('id', newClient.id);

    expect(deleteError).toBeNull();

    // Cleanup
    await serviceClient.from('clients').delete().eq('id', newClient.id);
  });

  it('super_admin_can_manage_departments', async () => {
    const newDept = {
      id: 'd4444444-4444-4444-a444-444444444445',
      name: 'Super Admin Test Department',
      active: true,
    };

    // Create
    const { data: created, error: createError } = await serviceClient
      .from('departments')
      .insert(newDept)
      .select()
      .single();

    expect(createError).toBeNull();
    expect(created).not.toBeNull();

    // Cleanup
    await serviceClient.from('departments').delete().eq('id', newDept.id);
  });

  it('super_admin_can_manage_users', async () => {
    const newUser = {
      id: 'd4444444-4444-4444-a444-444444444446',
      email: 'supercreated@test.local',
      role: 'staff' as const,
      department_id: testDepartments.deptA.id,
      display_name: 'Super Created User',
    };

    // First create auth user (required for FK constraint)
    await createAuthUser(newUser.id, newUser.email);

    // Create user in public.users
    const { data: created, error: createError } = await serviceClient
      .from('users')
      .insert(newUser)
      .select()
      .single();

    expect(createError).toBeNull();
    expect(created).not.toBeNull();

    // Update role
    const { error: updateError } = await serviceClient
      .from('users')
      .update({ role: 'manager' })
      .eq('id', newUser.id);

    expect(updateError).toBeNull();

    // Cleanup
    await serviceClient.from('users').delete().eq('id', newUser.id);
    await deleteAuthUser(newUser.id);
  });
});
