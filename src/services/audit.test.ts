/**
 * Tests for Audit Service
 * Story 8.6: Audit Log Database Trigger (AC: 5)
 * Tests verify:
 * - getAuditLogsForEntry returns logs for specific entry
 * - getAuditLogsByUser returns logs with limit
 * - getAuditLogsByDateRange returns logs in range
 * - RLS prevents staff from accessing audit logs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAuditLogsForEntry,
  getAuditLogsByUser,
  getAuditLogsByDateRange,
} from './audit';

// Mock Supabase client
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

// Valid UUID for testing
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const ENTRY_UUID = '660e8400-e29b-41d4-a716-446655440001';
const USER_UUID = '770e8400-e29b-41d4-a716-446655440002';

// Sample audit logs for testing
const mockAuditLogs = [
  {
    id: VALID_UUID,
    table_name: 'time_entries',
    record_id: ENTRY_UUID,
    action: 'INSERT',
    old_data: null,
    new_data: { id: ENTRY_UUID, duration_minutes: 120 },
    user_id: USER_UUID,
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    table_name: 'time_entries',
    record_id: ENTRY_UUID,
    action: 'UPDATE',
    old_data: { id: ENTRY_UUID, duration_minutes: 120 },
    new_data: { id: ENTRY_UUID, duration_minutes: 180 },
    user_id: USER_UUID,
    created_at: '2026-01-05T11:00:00Z',
  },
];

describe('Audit Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuditLogsForEntry', () => {
    it('returns audit logs for a specific entry', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: mockOrder.mockResolvedValue({
                data: mockAuditLogs,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsForEntry(ENTRY_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].action).toBe('INSERT');
        expect(result.data[1].action).toBe('UPDATE');
      }
      expect(mockFrom).toHaveBeenCalledWith('audit_logs');
    });

    it('returns empty array when no logs exist for entry', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: mockOrder.mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsForEntry(ENTRY_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });

    it('returns error when database query fails', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: mockOrder.mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsForEntry(ENTRY_UUID);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Database error');
      }
    });

    it('filters by table_name=time_entries and record_id', async () => {
      const mockFirstEq = vi.fn();
      const mockSecondEq = vi.fn();

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockFirstEq.mockReturnValue({
            eq: mockSecondEq.mockReturnValue({
              order: mockOrder.mockResolvedValue({
                data: mockAuditLogs,
                error: null,
              }),
            }),
          }),
        }),
      });

      await getAuditLogsForEntry(ENTRY_UUID);

      expect(mockFirstEq).toHaveBeenCalledWith('table_name', 'time_entries');
      expect(mockSecondEq).toHaveBeenCalledWith('record_id', ENTRY_UUID);
    });
  });

  describe('getAuditLogsByUser', () => {
    it('returns audit logs for a specific user with default limit', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValue({
              limit: mockLimit.mockResolvedValue({
                data: mockAuditLogs,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsByUser(USER_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
      expect(mockLimit).toHaveBeenCalledWith(50); // default limit
    });

    it('returns audit logs with custom limit', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValue({
              limit: mockLimit.mockResolvedValue({
                data: [mockAuditLogs[0]],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsByUser(USER_UUID, 10);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
      }
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('returns empty array when user has no logs', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValue({
              limit: mockLimit.mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsByUser(USER_UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });

    it('returns error when database query fails', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValue({
              limit: mockLimit.mockResolvedValue({
                data: null,
                error: { message: 'Permission denied' },
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsByUser(USER_UUID);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Permission denied');
      }
    });

    it('filters by user_id', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValue({
              limit: mockLimit.mockResolvedValue({
                data: mockAuditLogs,
                error: null,
              }),
            }),
          }),
        }),
      });

      await getAuditLogsByUser(USER_UUID);

      expect(mockEq).toHaveBeenCalledWith('user_id', USER_UUID);
    });
  });

  describe('getAuditLogsByDateRange', () => {
    const startDate = '2026-01-01';
    const endDate = '2026-01-31';

    it('returns audit logs within date range with default limit', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          gte: mockGte.mockReturnValue({
            lte: mockLte.mockReturnValue({
              order: mockOrder.mockReturnValue({
                limit: mockLimit.mockResolvedValue({
                  data: mockAuditLogs,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsByDateRange(startDate, endDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
      expect(mockLimit).toHaveBeenCalledWith(100); // default limit
    });

    it('returns audit logs with custom limit', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          gte: mockGte.mockReturnValue({
            lte: mockLte.mockReturnValue({
              order: mockOrder.mockReturnValue({
                limit: mockLimit.mockResolvedValue({
                  data: [mockAuditLogs[0]],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsByDateRange(startDate, endDate, 25);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
      }
      expect(mockLimit).toHaveBeenCalledWith(25);
    });

    it('uses correct date filters', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          gte: mockGte.mockReturnValue({
            lte: mockLte.mockReturnValue({
              order: mockOrder.mockReturnValue({
                limit: mockLimit.mockResolvedValue({
                  data: mockAuditLogs,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      await getAuditLogsByDateRange(startDate, endDate);

      expect(mockGte).toHaveBeenCalledWith('created_at', startDate);
      expect(mockLte).toHaveBeenCalledWith('created_at', endDate);
    });

    it('returns empty array when no logs in range', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          gte: mockGte.mockReturnValue({
            lte: mockLte.mockReturnValue({
              order: mockOrder.mockReturnValue({
                limit: mockLimit.mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsByDateRange('2025-01-01', '2025-01-31');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });

    it('returns error when database query fails', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          gte: mockGte.mockReturnValue({
            lte: mockLte.mockReturnValue({
              order: mockOrder.mockReturnValue({
                limit: mockLimit.mockResolvedValue({
                  data: null,
                  error: { message: 'Invalid date format' },
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsByDateRange('invalid', 'invalid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid date format');
      }
    });

    it('orders results by created_at descending', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          gte: mockGte.mockReturnValue({
            lte: mockLte.mockReturnValue({
              order: mockOrder.mockReturnValue({
                limit: mockLimit.mockResolvedValue({
                  data: mockAuditLogs,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      await getAuditLogsByDateRange(startDate, endDate);

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('RLS prevents staff access', () => {
    it('returns error when staff user queries audit logs (RLS denial)', async () => {
      // When RLS denies access, Supabase returns empty array or permission error
      // This simulates the error case
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: mockOrder.mockResolvedValue({
                data: null,
                error: { message: 'permission denied for table audit_logs' },
              }),
            }),
          }),
        }),
      });

      const result = await getAuditLogsForEntry(ENTRY_UUID);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('permission denied');
      }
    });
  });
});
