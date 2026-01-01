/**
 * Tests for Master Data Server Actions
 * Story 3.1: Service Type Management (AC: 2, 4, 5)
 * Story 3.2: Client Management (AC: 2, 4, 5)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createService,
  updateService,
  toggleServiceActive,
  createClientAction,
  updateClientAction,
  toggleClientActive,
  createTask,
  updateTask,
  toggleTaskActive,
  checkServiceUsage,
  checkTaskUsage,
  checkClientUsage,
} from './master-data';

// Mock Supabase client
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Valid UUID for testing
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('Master Data Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user-id' } },
      error: null,
    });

    // Default: user is admin
    mockFrom.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role: 'admin' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
      };
    });

    mockSelect.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ select: mockSelect });
  });

  describe('createService', () => {
    it('creates service successfully with valid input', async () => {
      const mockService = { id: '1', name: 'Dubbing', active: true };
      mockSingle.mockResolvedValue({ data: mockService, error: null });

      const result = await createService({ name: 'Dubbing' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockService);
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await createService({ name: 'Dubbing' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error when user is not admin', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'staff' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { insert: mockInsert };
      });

      const result = await createService({ name: 'Dubbing' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authorized');
      }
    });

    it('returns validation error for invalid input', async () => {
      const result = await createService({ name: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Service name is required');
      }
    });

    it('returns error for duplicate service name', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      });

      const result = await createService({ name: 'Dubbing' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Service name already exists');
      }
    });

    it('returns generic error for other database errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '12345', message: 'Some database error' },
      });

      const result = await createService({ name: 'Dubbing' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Some database error');
      }
    });

    it('allows super_admin to create service', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'super_admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      });

      const mockService = { id: VALID_UUID, name: 'Dubbing', active: true };
      mockSingle.mockResolvedValue({ data: mockService, error: null });

      const result = await createService({ name: 'Dubbing' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockService);
      }
    });
  });

  describe('updateService', () => {
    it('updates service successfully', async () => {
      const mockService = { id: VALID_UUID, name: 'Updated Dubbing', active: true };
      mockSingle.mockResolvedValue({ data: mockService, error: null });

      const result = await updateService(VALID_UUID, { name: 'Updated Dubbing' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockService);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await updateService('invalid-id', { name: 'Updated' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updateService(VALID_UUID, { name: 'Updated' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error for duplicate service name', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      });

      const result = await updateService(VALID_UUID, { name: 'Existing Name' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Service name already exists');
      }
    });

    it('returns validation error for invalid input', async () => {
      const result = await updateService(VALID_UUID, { name: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Service name is required');
      }
    });
  });

  describe('toggleServiceActive', () => {
    it('toggles service active status to false', async () => {
      const mockService = { id: VALID_UUID, name: 'Dubbing', active: false };
      mockSingle.mockResolvedValue({ data: mockService, error: null });

      const result = await toggleServiceActive(VALID_UUID, false);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active).toBe(false);
      }
    });

    it('toggles service active status to true', async () => {
      const mockService = { id: VALID_UUID, name: 'Dubbing', active: true };
      mockSingle.mockResolvedValue({ data: mockService, error: null });

      const result = await toggleServiceActive(VALID_UUID, true);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active).toBe(true);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await toggleServiceActive('not-a-uuid', false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await toggleServiceActive(VALID_UUID, false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error when database update fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      const result = await toggleServiceActive(VALID_UUID, false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Update failed');
      }
    });
  });

  /**
   * Client Actions Tests
   * Story 3.2: Client Management (AC: 2, 4, 5)
   */
  describe('createClientAction', () => {
    it('creates client successfully with valid input', async () => {
      const mockClient = { id: VALID_UUID, name: 'Netflix', active: true };
      mockSingle.mockResolvedValue({ data: mockClient, error: null });

      const result = await createClientAction({ name: 'Netflix' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockClient);
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await createClientAction({ name: 'Netflix' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error when user is not admin', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'staff' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { insert: mockInsert };
      });

      const result = await createClientAction({ name: 'Netflix' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authorized');
      }
    });

    it('returns validation error for invalid input', async () => {
      const result = await createClientAction({ name: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Client name is required');
      }
    });

    it('returns error for duplicate client name', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      });

      const result = await createClientAction({ name: 'Netflix' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Client name already exists');
      }
    });

    it('returns generic error for other database errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '12345', message: 'Some database error' },
      });

      const result = await createClientAction({ name: 'Netflix' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Some database error');
      }
    });

    it('allows super_admin to create client', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'super_admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      });

      const mockClient = { id: VALID_UUID, name: 'Netflix', active: true };
      mockSingle.mockResolvedValue({ data: mockClient, error: null });

      const result = await createClientAction({ name: 'Netflix' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockClient);
      }
    });
  });

  describe('updateClientAction', () => {
    it('updates client successfully', async () => {
      const mockClient = { id: VALID_UUID, name: 'Updated Netflix', active: true };
      mockSingle.mockResolvedValue({ data: mockClient, error: null });

      const result = await updateClientAction(VALID_UUID, { name: 'Updated Netflix' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockClient);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await updateClientAction('invalid-id', { name: 'Updated' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updateClientAction(VALID_UUID, { name: 'Updated' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error for duplicate client name', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      });

      const result = await updateClientAction(VALID_UUID, { name: 'Existing Name' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Client name already exists');
      }
    });

    it('returns validation error for invalid input', async () => {
      const result = await updateClientAction(VALID_UUID, { name: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Client name is required');
      }
    });
  });

  describe('toggleClientActive', () => {
    it('toggles client active status to false', async () => {
      const mockClient = { id: VALID_UUID, name: 'Netflix', active: false };
      mockSingle.mockResolvedValue({ data: mockClient, error: null });

      const result = await toggleClientActive(VALID_UUID, false);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active).toBe(false);
      }
    });

    it('toggles client active status to true', async () => {
      const mockClient = { id: VALID_UUID, name: 'Netflix', active: true };
      mockSingle.mockResolvedValue({ data: mockClient, error: null });

      const result = await toggleClientActive(VALID_UUID, true);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active).toBe(true);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await toggleClientActive('not-a-uuid', false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await toggleClientActive(VALID_UUID, false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error when database update fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      const result = await toggleClientActive(VALID_UUID, false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Update failed');
      }
    });
  });

  /**
   * Task Actions Tests
   * Story 3.3: Task Management (AC: 2, 4, 5)
   */
  describe('createTask', () => {
    it('creates task successfully with valid input', async () => {
      const mockTask = { id: VALID_UUID, name: 'Translation', active: true };
      mockSingle.mockResolvedValue({ data: mockTask, error: null });

      const result = await createTask({ name: 'Translation' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTask);
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await createTask({ name: 'Translation' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error when user is not admin', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'staff' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { insert: mockInsert };
      });

      const result = await createTask({ name: 'Translation' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authorized');
      }
    });

    it('returns validation error for invalid input', async () => {
      const result = await createTask({ name: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Task name is required');
      }
    });

    it('returns error for duplicate task name', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      });

      const result = await createTask({ name: 'Translation' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Task name already exists');
      }
    });

    it('returns generic error for other database errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '12345', message: 'Some database error' },
      });

      const result = await createTask({ name: 'Translation' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Some database error');
      }
    });

    it('allows super_admin to create task', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'super_admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      });

      const mockTask = { id: VALID_UUID, name: 'Translation', active: true };
      mockSingle.mockResolvedValue({ data: mockTask, error: null });

      const result = await createTask({ name: 'Translation' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTask);
      }
    });
  });

  describe('updateTask', () => {
    it('updates task successfully', async () => {
      const mockTask = { id: VALID_UUID, name: 'Updated Translation', active: true };
      mockSingle.mockResolvedValue({ data: mockTask, error: null });

      const result = await updateTask(VALID_UUID, { name: 'Updated Translation' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTask);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await updateTask('invalid-id', { name: 'Updated' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updateTask(VALID_UUID, { name: 'Updated' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error for duplicate task name', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      });

      const result = await updateTask(VALID_UUID, { name: 'Existing Name' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Task name already exists');
      }
    });

    it('returns validation error for invalid input', async () => {
      const result = await updateTask(VALID_UUID, { name: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Task name is required');
      }
    });
  });

  describe('toggleTaskActive', () => {
    it('toggles task active status to false', async () => {
      const mockTask = { id: VALID_UUID, name: 'Translation', active: false };
      mockSingle.mockResolvedValue({ data: mockTask, error: null });

      const result = await toggleTaskActive(VALID_UUID, false);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active).toBe(false);
      }
    });

    it('toggles task active status to true', async () => {
      const mockTask = { id: VALID_UUID, name: 'Translation', active: true };
      mockSingle.mockResolvedValue({ data: mockTask, error: null });

      const result = await toggleTaskActive(VALID_UUID, true);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active).toBe(true);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await toggleTaskActive('not-a-uuid', false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await toggleTaskActive(VALID_UUID, false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('returns error when database update fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      const result = await toggleTaskActive(VALID_UUID, false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Update failed');
      }
    });
  });

  /**
   * Usage Check Actions Tests
   * Story 3.4: Soft Delete Protection (AC: 1)
   */
  describe('checkServiceUsage', () => {
    it('returns usage count when service is used in time entries', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'time_entries') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                count: 5,
                error: null,
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const result = await checkServiceUsage(VALID_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.used).toBe(true);
        expect(result.data.count).toBe(5);
      }
    });

    it('returns zero count when service is not used', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'time_entries') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                count: 0,
                error: null,
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const result = await checkServiceUsage(VALID_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.used).toBe(false);
        expect(result.data.count).toBe(0);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await checkServiceUsage('not-a-uuid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await checkServiceUsage(VALID_UUID);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });
  });

  describe('checkTaskUsage', () => {
    it('returns usage count when task is used in time entries', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'time_entries') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                count: 3,
                error: null,
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const result = await checkTaskUsage(VALID_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.used).toBe(true);
        expect(result.data.count).toBe(3);
      }
    });

    it('returns zero count when task is not used', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'time_entries') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                count: 0,
                error: null,
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const result = await checkTaskUsage(VALID_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.used).toBe(false);
        expect(result.data.count).toBe(0);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await checkTaskUsage('not-a-uuid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });
  });

  describe('checkClientUsage', () => {
    it('returns usage count when client has time entries via jobs', async () => {
      const mockIn = vi.fn();
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 'proj-1' }, { id: 'proj-2' }],
                error: null,
              }),
            }),
          };
        }
        if (table === 'jobs') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: [{ id: 'job-1' }, { id: 'job-2' }],
                error: null,
              }),
            }),
          };
        }
        if (table === 'time_entries') {
          return {
            select: vi.fn().mockReturnValue({
              in: mockIn.mockResolvedValue({
                count: 10,
                error: null,
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const result = await checkClientUsage(VALID_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.used).toBe(true);
        expect(result.data.count).toBe(10);
      }
    });

    it('returns zero when client has no projects', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const result = await checkClientUsage(VALID_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.used).toBe(false);
        expect(result.data.count).toBe(0);
      }
    });

    it('returns zero when client has no jobs', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { role: 'admin' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 'proj-1' }],
                error: null,
              }),
            }),
          };
        }
        if (table === 'jobs') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        return { select: mockSelect };
      });

      const result = await checkClientUsage(VALID_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.used).toBe(false);
        expect(result.data.count).toBe(0);
      }
    });

    it('returns error for invalid UUID format', async () => {
      const result = await checkClientUsage('not-a-uuid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid ID format');
      }
    });
  });
});
