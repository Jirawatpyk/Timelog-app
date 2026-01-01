/**
 * Time Entry Query Functions - Unit Tests
 * Story 3.4: Soft Delete Protection (AC: 3)
 *
 * These tests verify the time entry query functions work correctly.
 * Integration testing for historical display with inactive items
 * is done via E2E tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the server client before importing the module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Now import the functions
import {
  getTimeEntryWithDetails,
  getUserTimeEntries,
  getUserTimeEntriesForDate,
  getDepartmentTimeEntries,
} from './time-entries';
import { createClient } from '@/lib/supabase/server';

describe('Time Entry Query Functions', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockGte = vi.fn();
  const mockLte = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup chainable mock
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockLte.mockReturnValue({ order: mockOrder });
    mockGte.mockReturnValue({ lte: mockLte });
    mockEq.mockReturnValue({
      eq: mockEq,
      gte: mockGte,
      single: mockSingle,
      order: mockOrder,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  describe('getTimeEntryWithDetails', () => {
    it('queries time_entries with all JOINs', async () => {
      await getTimeEntryWithDetails('test-id');

      expect(mockFrom).toHaveBeenCalledWith('time_entries');
      expect(mockSelect).toHaveBeenCalled();
      // Verify the select includes all JOINs
      const selectArg = mockSelect.mock.calls[0][0];
      expect(selectArg).toContain('job:jobs');
      expect(selectArg).toContain('project:projects');
      expect(selectArg).toContain('client:clients');
      expect(selectArg).toContain('service:services');
      expect(selectArg).toContain('task:tasks');
    });

    it('filters by id', async () => {
      await getTimeEntryWithDetails('test-entry-id');

      expect(mockEq).toHaveBeenCalledWith('id', 'test-entry-id');
      expect(mockSingle).toHaveBeenCalled();
    });
  });

  describe('getUserTimeEntries', () => {
    it('queries with user_id and date range', async () => {
      await getUserTimeEntries('user-123', '2025-01-01', '2025-01-31');

      expect(mockFrom).toHaveBeenCalledWith('time_entries');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockGte).toHaveBeenCalledWith('entry_date', '2025-01-01');
      expect(mockLte).toHaveBeenCalledWith('entry_date', '2025-01-31');
      expect(mockOrder).toHaveBeenCalledWith('entry_date', { ascending: false });
    });

    it('includes all JOINs for display names', async () => {
      await getUserTimeEntries('user-123', '2025-01-01', '2025-01-31');

      const selectArg = mockSelect.mock.calls[0][0];
      expect(selectArg).toContain('job:jobs');
      expect(selectArg).toContain('service:services');
      expect(selectArg).toContain('task:tasks');
    });
  });

  describe('getUserTimeEntriesForDate', () => {
    it('queries with user_id and specific date', async () => {
      await getUserTimeEntriesForDate('user-123', '2025-01-15');

      expect(mockFrom).toHaveBeenCalledWith('time_entries');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockEq).toHaveBeenCalledWith('entry_date', '2025-01-15');
    });

    it('orders by created_at descending', async () => {
      await getUserTimeEntriesForDate('user-123', '2025-01-15');

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('getDepartmentTimeEntries', () => {
    it('queries with department_id and date range', async () => {
      await getDepartmentTimeEntries('dept-abc', '2025-01-01', '2025-01-31');

      expect(mockFrom).toHaveBeenCalledWith('time_entries');
      expect(mockEq).toHaveBeenCalledWith('department_id', 'dept-abc');
      expect(mockGte).toHaveBeenCalledWith('entry_date', '2025-01-01');
      expect(mockLte).toHaveBeenCalledWith('entry_date', '2025-01-31');
    });
  });

  describe('Function exports', () => {
    it('exports all required functions', () => {
      expect(typeof getTimeEntryWithDetails).toBe('function');
      expect(typeof getUserTimeEntries).toBe('function');
      expect(typeof getUserTimeEntriesForDate).toBe('function');
      expect(typeof getDepartmentTimeEntries).toBe('function');
    });
  });
});
