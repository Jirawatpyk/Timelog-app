/**
 * User Entries Query Tests - Story 5.6, 5.7
 *
 * Tests for getUserClients and getUserEntries search functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the server client before importing the module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { getUserClients, getUserEntries } from './get-user-entries';
import { createClient } from '@/lib/supabase/server';
import type { TimeEntryWithDetails } from '@/types/domain';

describe('getUserClients', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockIs = vi.fn();
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();
  const mockGetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    });

    // Setup RPC mock - returns error by default to test fallback
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'RPC not found' },
    });

    // Setup chainable mock for fallback
    mockIs.mockResolvedValue({
      data: [
        {
          job: {
            project: {
              client: { id: 'client-1', name: 'Zebra Corp' },
            },
          },
        },
        {
          job: {
            project: {
              client: { id: 'client-2', name: 'Alpha Inc' },
            },
          },
        },
        {
          job: {
            project: {
              client: { id: 'client-1', name: 'Zebra Corp' }, // Duplicate
            },
          },
        },
      ],
      error: null,
    });
    mockEq.mockReturnValue({ is: mockIs });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
      rpc: mockRpc,
      auth: {
        getUser: mockGetUser,
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it('tries RPC first for optimized query', async () => {
    await getUserClients();

    expect(mockRpc).toHaveBeenCalledWith('get_user_clients');
  });

  it('uses RPC result when available', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { id: 'client-a', name: 'Alpha Corp' },
        { id: 'client-b', name: 'Beta Inc' },
      ],
      error: null,
    });

    const clients = await getUserClients();

    expect(clients).toHaveLength(2);
    expect(clients[0].name).toBe('Alpha Corp');
    expect(mockFrom).not.toHaveBeenCalled(); // Should not fall back
  });

  it('falls back to time_entries query when RPC fails', async () => {
    await getUserClients();

    expect(mockFrom).toHaveBeenCalledWith('time_entries');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
  });

  it('selects nested client data in fallback', async () => {
    await getUserClients();

    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining('job:jobs')
    );
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining('client:clients')
    );
  });

  it('filters out deleted entries in fallback', async () => {
    await getUserClients();

    expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
  });

  it('returns unique clients sorted alphabetically', async () => {
    const clients = await getUserClients();

    // Should have only 2 unique clients
    expect(clients).toHaveLength(2);

    // Should be sorted alphabetically
    expect(clients[0].name).toBe('Alpha Inc');
    expect(clients[1].name).toBe('Zebra Corp');
  });

  it('returns empty array when no entries', async () => {
    mockIs.mockResolvedValue({ data: [], error: null });

    const clients = await getUserClients();

    expect(clients).toEqual([]);
  });

  it('throws error when user not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(getUserClients()).rejects.toThrow('Unauthorized');
  });

  it('throws error on database error in fallback', async () => {
    mockIs.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

    await expect(getUserClients()).rejects.toThrow();
  });

  it('returns ClientOption type with id and name', async () => {
    const clients = await getUserClients();

    clients.forEach((client) => {
      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('name');
      expect(typeof client.id).toBe('string');
      expect(typeof client.name).toBe('string');
    });
  });
});

/**
 * Story 5.7: Tests for getUserEntries search functionality
 */
describe('getUserEntries search filtering', () => {
  const mockGetUser = vi.fn();
  const mockOrder = vi.fn();

  // Sample entries for search testing
  const sampleEntries: TimeEntryWithDetails[] = [
    {
      id: 'entry-1',
      user_id: 'test-user-id',
      job_id: 'job-1',
      service_id: 'service-1',
      task_id: null,
      department_id: 'dept-1',
      duration_minutes: 60,
      notes: 'Fixed login bug',
      entry_date: '2024-01-15',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      deleted_at: null,
      job: {
        id: 'job-1',
        name: 'Website Redesign',
        job_no: 'WEB-001',
        project: {
          id: 'proj-1',
          name: 'Marketing Site',
          client: { id: 'client-1', name: 'Acme Corp' },
        },
      },
      service: { id: 'service-1', name: 'Development' },
      task: null,
    },
    {
      id: 'entry-2',
      user_id: 'test-user-id',
      job_id: 'job-2',
      service_id: 'service-2',
      task_id: 'task-1',
      department_id: 'dept-1',
      duration_minutes: 120,
      notes: 'Database migration planning',
      entry_date: '2024-01-15',
      created_at: '2024-01-15T14:00:00Z',
      updated_at: '2024-01-15T14:00:00Z',
      deleted_at: null,
      job: {
        id: 'job-2',
        name: 'Backend API',
        job_no: 'API-100',
        project: {
          id: 'proj-2',
          name: 'Enterprise Platform',
          client: { id: 'client-2', name: 'TechStart Inc' },
        },
      },
      service: { id: 'service-2', name: 'Consulting' },
      task: { id: 'task-1', name: 'Planning' },
    },
    {
      id: 'entry-3',
      user_id: 'test-user-id',
      job_id: 'job-3',
      service_id: 'service-1',
      task_id: null,
      department_id: 'dept-1',
      duration_minutes: 90,
      notes: null,
      entry_date: '2024-01-14',
      created_at: '2024-01-14T09:00:00Z',
      updated_at: '2024-01-14T09:00:00Z',
      deleted_at: null,
      job: {
        id: 'job-3',
        name: 'Mobile App',
        job_no: 'APP-050',
        project: {
          id: 'proj-3',
          name: 'Consumer App',
          client: { id: 'client-1', name: 'Acme Corp' },
        },
      },
      service: { id: 'service-1', name: 'Development' },
      task: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    });

    // Create a proper chainable mock
    const createChainableMock = () => {
      const mock: Record<string, unknown> = {};

      // All chainable methods return the same mock for chaining
      mock.select = vi.fn().mockReturnValue(mock);
      mock.eq = vi.fn().mockReturnValue(mock);
      mock.gte = vi.fn().mockReturnValue(mock);
      mock.lte = vi.fn().mockReturnValue(mock);
      mock.is = vi.fn().mockReturnValue(mock);

      // First order call returns chainable, second resolves with data
      let orderCallCount = 0;
      mock.order = vi.fn().mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          // Second .order() call - return a promise
          return Promise.resolve({
            data: sampleEntries,
            error: null,
          });
        }
        // First .order() call - return chainable
        return mock;
      });

      return mock;
    };

    const mockQuery = createChainableMock();

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(mockQuery),
      auth: {
        getUser: mockGetUser,
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it('returns all entries when no search query', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange);

    expect(entries).toHaveLength(3);
  });

  it('filters entries by client name (case-insensitive)', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'acme' });

    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.job.project.client.name === 'Acme Corp')).toBe(true);
  });

  it('filters entries by project name', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'Marketing' });

    expect(entries).toHaveLength(1);
    expect(entries[0].job.project.name).toBe('Marketing Site');
  });

  it('filters entries by job name', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'Backend' });

    expect(entries).toHaveLength(1);
    expect(entries[0].job.name).toBe('Backend API');
  });

  it('filters entries by job number', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'API-100' });

    expect(entries).toHaveLength(1);
    expect(entries[0].job.job_no).toBe('API-100');
  });

  it('filters entries by service name', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'Consulting' });

    expect(entries).toHaveLength(1);
    expect(entries[0].service.name).toBe('Consulting');
  });

  it('filters entries by task name', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'Planning' });

    expect(entries).toHaveLength(1);
    expect(entries[0].task?.name).toBe('Planning');
  });

  it('filters entries by notes', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'login bug' });

    expect(entries).toHaveLength(1);
    expect(entries[0].notes).toBe('Fixed login bug');
  });

  it('supports partial matches', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'Develop' });

    expect(entries).toHaveLength(2); // Matches 'Development' service
  });

  it('returns empty array when no matches', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'xyz123nonexistent' });

    expect(entries).toHaveLength(0);
  });

  it('ignores search query shorter than 2 characters', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const entries = await getUserEntries(dateRange, { searchQuery: 'a' });

    expect(entries).toHaveLength(3); // All entries returned
  });

  it('combines search with client filter', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    // Search within already-filtered entries
    const entries = await getUserEntries(dateRange, {
      clientId: 'client-1',
      searchQuery: 'Mobile',
    });

    // The mock doesn't actually filter by clientId, but search should work
    expect(entries.every((e) => e.job.name.includes('Mobile'))).toBe(true);
  });
});
