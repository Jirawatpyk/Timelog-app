/**
 * Master Data Query Functions - Unit Tests
 * Story 3.4: Soft Delete Protection (AC: 2, 4)
 *
 * These tests verify the query function exports and types.
 * Integration testing is done via E2E tests in test/e2e/rls/soft-delete.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the server client before importing the module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Now import the functions
import {
  getActiveServices,
  getAllServices,
  getActiveClients,
  getAllClients,
  getActiveProjectsByClient,
  getAllProjectsByClient,
  getActiveJobsByProject,
  getAllJobsByProject,
  getActiveTasks,
  getAllTasks,
} from './master-data';
import { createClient } from '@/lib/supabase/server';

describe('Master Data Query Functions', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup chainable mock
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockEq.mockReturnValue({ eq: mockEq, order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  describe('Services queries', () => {
    it('getActiveServices filters by active=true', async () => {
      await getActiveServices();

      expect(mockFrom).toHaveBeenCalledWith('services');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('active', true);
      expect(mockOrder).toHaveBeenCalledWith('name');
    });

    it('getAllServices does not filter by active', async () => {
      await getAllServices();

      expect(mockFrom).toHaveBeenCalledWith('services');
      expect(mockSelect).toHaveBeenCalledWith('*');
      // Should go directly to order, not eq
      expect(mockOrder).toHaveBeenCalledWith('name');
    });
  });

  describe('Clients queries', () => {
    it('getActiveClients filters by active=true', async () => {
      await getActiveClients();

      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('active', true);
      expect(mockOrder).toHaveBeenCalledWith('name');
    });

    it('getAllClients does not filter by active', async () => {
      await getAllClients();

      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('name');
    });
  });

  describe('Projects queries', () => {
    it('getActiveProjectsByClient filters by client_id and active=true', async () => {
      const clientId = 'test-client-id';
      await getActiveProjectsByClient(clientId);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('client_id', clientId);
      expect(mockEq).toHaveBeenCalledWith('active', true);
      expect(mockOrder).toHaveBeenCalledWith('name');
    });

    it('getAllProjectsByClient filters only by client_id', async () => {
      const clientId = 'test-client-id';
      await getAllProjectsByClient(clientId);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('client_id', clientId);
      expect(mockOrder).toHaveBeenCalledWith('name');
    });
  });

  describe('Jobs queries', () => {
    it('getActiveJobsByProject filters by project_id and active=true', async () => {
      const projectId = 'test-project-id';
      await getActiveJobsByProject(projectId);

      expect(mockFrom).toHaveBeenCalledWith('jobs');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('project_id', projectId);
      expect(mockEq).toHaveBeenCalledWith('active', true);
      expect(mockOrder).toHaveBeenCalledWith('job_no', { ascending: true });
    });

    it('getAllJobsByProject filters only by project_id', async () => {
      const projectId = 'test-project-id';
      await getAllJobsByProject(projectId);

      expect(mockFrom).toHaveBeenCalledWith('jobs');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('project_id', projectId);
      expect(mockOrder).toHaveBeenCalledWith('job_no', { ascending: true });
    });
  });

  describe('Tasks queries', () => {
    it('getActiveTasks filters by active=true', async () => {
      await getActiveTasks();

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('active', true);
      expect(mockOrder).toHaveBeenCalledWith('name');
    });

    it('getAllTasks does not filter by active', async () => {
      await getAllTasks();

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('name');
    });
  });

  describe('Function exports', () => {
    it('exports all required functions', () => {
      expect(typeof getActiveServices).toBe('function');
      expect(typeof getAllServices).toBe('function');
      expect(typeof getActiveClients).toBe('function');
      expect(typeof getAllClients).toBe('function');
      expect(typeof getActiveProjectsByClient).toBe('function');
      expect(typeof getAllProjectsByClient).toBe('function');
      expect(typeof getActiveJobsByProject).toBe('function');
      expect(typeof getAllJobsByProject).toBe('function');
      expect(typeof getActiveTasks).toBe('function');
      expect(typeof getAllTasks).toBe('function');
    });
  });
});
