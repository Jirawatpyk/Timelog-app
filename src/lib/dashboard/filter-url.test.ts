/**
 * Filter URL State Tests - Story 5.6
 *
 * Unit tests for URL-based filter state management.
 * Tests AC5 (URL sync) and AC8 (filter + period combination).
 *
 * Related tests:
 * - filter-utils.test.ts: Core utility function tests
 * - Filter*.test.tsx: Component-level tests (AC1-4, AC6-7)
 */

import { describe, it, expect } from 'vitest';
import {
  getFilterFromSearchParams,
  hasActiveFilter,
  buildFilteredUrl,
} from '@/lib/dashboard/filter-utils';
import type { FilterState } from '@/types/dashboard';

describe('Dashboard Filter - URL State', () => {
  describe('AC5: URL Sync - getFilterFromSearchParams', () => {
    it('parses client filter from URL params', () => {
      const filter = getFilterFromSearchParams({ client: 'client-123' });
      expect(filter.clientId).toBe('client-123');
    });

    it('returns empty filter when no client param', () => {
      const filter = getFilterFromSearchParams({});
      expect(filter.clientId).toBeUndefined();
    });

    it('trims whitespace from client param', () => {
      const filter = getFilterFromSearchParams({ client: '  abc-123  ' });
      expect(filter.clientId).toBe('abc-123');
    });

    it('ignores empty string client param', () => {
      const filter = getFilterFromSearchParams({ client: '' });
      expect(filter.clientId).toBeUndefined();
    });

    it('ignores undefined client param', () => {
      const filter = getFilterFromSearchParams({ client: undefined });
      expect(filter.clientId).toBeUndefined();
    });
  });

  describe('AC5: URL Sync - hasActiveFilter', () => {
    it('returns true when clientId is set', () => {
      const filter: FilterState = { clientId: 'abc' };
      expect(hasActiveFilter(filter)).toBe(true);
    });

    it('returns false when filter is empty', () => {
      expect(hasActiveFilter({})).toBe(false);
    });

    it('returns false when clientId is undefined', () => {
      expect(hasActiveFilter({ clientId: undefined })).toBe(false);
    });
  });

  describe('AC5: URL Sync - buildFilteredUrl', () => {
    it('builds URL with client filter', () => {
      const url = buildFilteredUrl(
        { clientId: 'client-abc' },
        new URLSearchParams()
      );
      expect(url).toContain('client=client-abc');
    });

    it('preserves existing URL params', () => {
      const url = buildFilteredUrl(
        { clientId: 'client-abc' },
        new URLSearchParams('period=week')
      );
      expect(url).toContain('period=week');
      expect(url).toContain('client=client-abc');
    });

    it('removes client param when filter cleared', () => {
      const url = buildFilteredUrl(
        {},
        new URLSearchParams('period=week&client=old')
      );
      expect(url).toContain('period=week');
      expect(url).not.toContain('client=');
    });

    it('returns plain dashboard URL when no params', () => {
      const url = buildFilteredUrl({}, new URLSearchParams());
      expect(url).toBe('/dashboard');
    });
  });

  describe('AC8: Filter + Period Combination', () => {
    it('filter state is independent of period', () => {
      // Verify filter can be combined with any period
      const todayUrl = buildFilteredUrl(
        { clientId: 'abc' },
        new URLSearchParams('period=today')
      );
      const weekUrl = buildFilteredUrl(
        { clientId: 'abc' },
        new URLSearchParams('period=week')
      );
      const monthUrl = buildFilteredUrl(
        { clientId: 'abc' },
        new URLSearchParams('period=month')
      );

      expect(todayUrl).toContain('client=abc');
      expect(todayUrl).toContain('period=today');
      expect(weekUrl).toContain('client=abc');
      expect(weekUrl).toContain('period=week');
      expect(monthUrl).toContain('client=abc');
      expect(monthUrl).toContain('period=month');
    });

    it('changing period preserves filter in URL', () => {
      // Start with period=today&client=abc
      const params = new URLSearchParams('period=today&client=abc');

      // Change to week (but keep client)
      params.set('period', 'week');

      expect(params.get('client')).toBe('abc');
      expect(params.get('period')).toBe('week');
    });

    it('clearing filter preserves period', () => {
      // Start with period=month&client=abc
      const url = buildFilteredUrl(
        {},
        new URLSearchParams('period=month&client=abc')
      );

      expect(url).toContain('period=month');
      expect(url).not.toContain('client=');
    });

    it('supports all period values with filter', () => {
      const periods = ['today', 'week', 'month'];

      periods.forEach((period) => {
        const url = buildFilteredUrl(
          { clientId: 'test-client' },
          new URLSearchParams(`period=${period}`)
        );

        expect(url).toContain(`period=${period}`);
        expect(url).toContain('client=test-client');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters in client ID', () => {
      const filter = getFilterFromSearchParams({ client: 'client-with-dashes-123' });
      expect(filter.clientId).toBe('client-with-dashes-123');
    });

    it('handles UUID format client ID', () => {
      const uuid = 'f1111111-1111-4111-f111-111111111111';
      const filter = getFilterFromSearchParams({ client: uuid });
      expect(filter.clientId).toBe(uuid);
    });

    it('URL encodes client ID correctly', () => {
      const url = buildFilteredUrl(
        { clientId: 'abc-123' },
        new URLSearchParams()
      );
      expect(url).toBe('/dashboard?client=abc-123');
    });
  });
});
