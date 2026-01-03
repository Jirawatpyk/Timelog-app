/**
 * Filter Utils Tests - Story 5.6, 5.7
 *
 * Tests for URL filter state management utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  getFilterFromSearchParams,
  buildFilteredUrl,
  hasActiveFilter,
  hasActiveSearch,
  MIN_SEARCH_LENGTH,
} from './filter-utils';
import type { FilterState } from '@/types/dashboard';

describe('getFilterFromSearchParams', () => {
  it('returns empty filter when no params', () => {
    const result = getFilterFromSearchParams({});
    expect(result).toEqual({});
  });

  it('returns clientId when client param is present', () => {
    const result = getFilterFromSearchParams({ client: 'client-123' });
    expect(result).toEqual({ clientId: 'client-123' });
  });

  it('ignores undefined client param', () => {
    const result = getFilterFromSearchParams({ client: undefined });
    expect(result).toEqual({});
  });

  it('trims whitespace from client param', () => {
    const result = getFilterFromSearchParams({ client: '  client-123  ' });
    expect(result).toEqual({ clientId: 'client-123' });
  });

  it('returns empty filter for empty string client', () => {
    const result = getFilterFromSearchParams({ client: '' });
    expect(result).toEqual({});
  });

  // Story 5.7: Search query tests
  it('returns searchQuery when q param is present and long enough', () => {
    const result = getFilterFromSearchParams({ q: 'test' });
    expect(result).toEqual({ searchQuery: 'test' });
  });

  it('ignores q param shorter than MIN_SEARCH_LENGTH', () => {
    const result = getFilterFromSearchParams({ q: 'a' });
    expect(result).toEqual({});
  });

  it('trims whitespace from q param', () => {
    const result = getFilterFromSearchParams({ q: '  test  ' });
    expect(result).toEqual({ searchQuery: 'test' });
  });

  it('ignores empty q param', () => {
    const result = getFilterFromSearchParams({ q: '' });
    expect(result).toEqual({});
  });

  it('returns both clientId and searchQuery when both present', () => {
    const result = getFilterFromSearchParams({ client: 'client-123', q: 'test' });
    expect(result).toEqual({ clientId: 'client-123', searchQuery: 'test' });
  });
});

describe('buildFilteredUrl', () => {
  it('adds client param to empty search params', () => {
    const url = buildFilteredUrl({ clientId: 'abc' }, new URLSearchParams());
    expect(url).toBe('/dashboard?client=abc');
  });

  it('preserves existing params when adding client', () => {
    const existingParams = new URLSearchParams('period=week');
    const url = buildFilteredUrl({ clientId: 'abc' }, existingParams);
    expect(url).toContain('period=week');
    expect(url).toContain('client=abc');
  });

  it('removes client param when clientId is undefined', () => {
    const existingParams = new URLSearchParams('period=week&client=old');
    const url = buildFilteredUrl({}, existingParams);
    expect(url).toBe('/dashboard?period=week');
    expect(url).not.toContain('client=');
  });

  it('updates existing client param', () => {
    const existingParams = new URLSearchParams('period=week&client=old');
    const url = buildFilteredUrl({ clientId: 'new' }, existingParams);
    expect(url).toContain('client=new');
    expect(url).not.toContain('client=old');
  });

  // Story 5.7: Search query tests
  it('adds q param to empty search params', () => {
    const url = buildFilteredUrl({ searchQuery: 'test' }, new URLSearchParams());
    expect(url).toBe('/dashboard?q=test');
  });

  it('preserves existing params when adding q', () => {
    const existingParams = new URLSearchParams('period=week');
    const url = buildFilteredUrl({ searchQuery: 'test' }, existingParams);
    expect(url).toContain('period=week');
    expect(url).toContain('q=test');
  });

  it('removes q param when searchQuery is undefined', () => {
    const existingParams = new URLSearchParams('period=week&q=old');
    const url = buildFilteredUrl({}, existingParams);
    expect(url).toBe('/dashboard?period=week');
    expect(url).not.toContain('q=');
  });

  it('removes q param when searchQuery is too short', () => {
    const existingParams = new URLSearchParams('period=week&q=old');
    const url = buildFilteredUrl({ searchQuery: 'a' }, existingParams);
    expect(url).toBe('/dashboard?period=week');
    expect(url).not.toContain('q=');
  });

  it('handles both client and q params', () => {
    const url = buildFilteredUrl(
      { clientId: 'abc', searchQuery: 'test' },
      new URLSearchParams()
    );
    expect(url).toContain('client=abc');
    expect(url).toContain('q=test');
  });
});

describe('hasActiveFilter', () => {
  it('returns false for empty filter', () => {
    expect(hasActiveFilter({})).toBe(false);
  });

  it('returns false for undefined clientId', () => {
    expect(hasActiveFilter({ clientId: undefined })).toBe(false);
  });

  it('returns true when clientId is set', () => {
    expect(hasActiveFilter({ clientId: 'abc' })).toBe(true);
  });

  // Story 5.7: hasActiveFilter should NOT consider searchQuery
  it('returns false when only searchQuery is set', () => {
    expect(hasActiveFilter({ searchQuery: 'test' })).toBe(false);
  });
});

describe('hasActiveSearch', () => {
  it('returns false for empty filter', () => {
    expect(hasActiveSearch({})).toBe(false);
  });

  it('returns false for undefined searchQuery', () => {
    expect(hasActiveSearch({ searchQuery: undefined })).toBe(false);
  });

  it('returns false when searchQuery is too short', () => {
    expect(hasActiveSearch({ searchQuery: 'a' })).toBe(false);
  });

  it('returns true when searchQuery meets minimum length', () => {
    expect(hasActiveSearch({ searchQuery: 'ab' })).toBe(true);
  });

  it('returns true when searchQuery exceeds minimum length', () => {
    expect(hasActiveSearch({ searchQuery: 'test' })).toBe(true);
  });
});

describe('MIN_SEARCH_LENGTH constant', () => {
  it('equals 2', () => {
    expect(MIN_SEARCH_LENGTH).toBe(2);
  });
});
