import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserFilters } from './use-user-filters';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = '/admin/users';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

/**
 * Tests for useUserFilters hook
 * Story 7.7: Filter Users (Task 4)
 */
describe('useUserFilters', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockPush.mockClear();
  });

  describe('filters parsing', () => {
    it('returns empty filters when URL has no params', () => {
      const { result } = renderHook(() => useUserFilters());

      expect(result.current.filters).toEqual({
        departmentId: undefined,
        role: undefined,
        status: undefined,
        search: undefined,
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('parses department filter from URL', () => {
      mockSearchParams = new URLSearchParams('dept=dept-123');
      const { result } = renderHook(() => useUserFilters());

      expect(result.current.filters.departmentId).toBe('dept-123');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('parses role filter from URL', () => {
      mockSearchParams = new URLSearchParams('role=manager');
      const { result } = renderHook(() => useUserFilters());

      expect(result.current.filters.role).toBe('manager');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('parses status filter from URL', () => {
      mockSearchParams = new URLSearchParams('status=pending');
      const { result } = renderHook(() => useUserFilters());

      expect(result.current.filters.status).toBe('pending');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('parses search query from URL', () => {
      mockSearchParams = new URLSearchParams('q=john');
      const { result } = renderHook(() => useUserFilters());

      expect(result.current.filters.search).toBe('john');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('parses multiple filters from URL', () => {
      mockSearchParams = new URLSearchParams('dept=dept-123&role=admin&status=active&q=test');
      const { result } = renderHook(() => useUserFilters());

      expect(result.current.filters).toEqual({
        departmentId: 'dept-123',
        role: 'admin',
        status: 'active',
        search: 'test',
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('setFilter', () => {
    it('sets a single filter and updates URL', () => {
      const { result } = renderHook(() => useUserFilters());

      act(() => {
        result.current.setFilter('dept', 'dept-456');
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/users?dept=dept-456');
    });

    it('removes page param when setting filter (resets pagination)', () => {
      mockSearchParams = new URLSearchParams('page=3');
      const { result } = renderHook(() => useUserFilters());

      act(() => {
        result.current.setFilter('role', 'staff');
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/users?role=staff');
    });

    it('removes filter when value is null', () => {
      mockSearchParams = new URLSearchParams('dept=dept-123&role=manager');
      const { result } = renderHook(() => useUserFilters());

      act(() => {
        result.current.setFilter('dept', null);
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/users?role=manager');
    });

    it('preserves other filters when setting one', () => {
      mockSearchParams = new URLSearchParams('role=admin');
      const { result } = renderHook(() => useUserFilters());

      act(() => {
        result.current.setFilter('status', 'active');
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/users?role=admin&status=active');
    });
  });

  describe('setFilters', () => {
    it('sets multiple filters at once', () => {
      const { result } = renderHook(() => useUserFilters());

      act(() => {
        result.current.setFilters({
          departmentId: 'dept-789',
          role: 'manager',
          status: 'active',
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/users?dept=dept-789&role=manager&status=active');
    });

    it('only includes non-empty filters', () => {
      const { result } = renderHook(() => useUserFilters());

      act(() => {
        result.current.setFilters({
          role: 'staff',
          search: undefined,
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/users?role=staff');
    });

    it('navigates to base path when all filters are empty', () => {
      mockSearchParams = new URLSearchParams('dept=dept-123');
      const { result } = renderHook(() => useUserFilters());

      act(() => {
        result.current.setFilters({});
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/users');
    });
  });

  describe('clearFilters', () => {
    it('clears all filters by navigating to base path', () => {
      mockSearchParams = new URLSearchParams('dept=dept-123&role=manager&status=active&q=test');
      const { result } = renderHook(() => useUserFilters());

      act(() => {
        result.current.clearFilters();
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/users');
    });
  });

  describe('hasActiveFilters', () => {
    it('returns false when no filters are active', () => {
      const { result } = renderHook(() => useUserFilters());
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('returns true when any filter is active', () => {
      mockSearchParams = new URLSearchParams('q=search');
      const { result } = renderHook(() => useUserFilters());
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
});
