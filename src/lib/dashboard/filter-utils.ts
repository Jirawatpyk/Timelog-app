/**
 * Filter Utils - Story 5.6, 5.7
 *
 * URL filter state management utilities for dashboard filtering and search.
 */

import type { FilterState } from '@/types/dashboard';

/** Minimum characters required for search to trigger */
export const MIN_SEARCH_LENGTH = 2;

/**
 * Extract filter state from URL search params
 *
 * Story 5.6: client filter
 * Story 5.7: search query (q param)
 */
export function getFilterFromSearchParams(params: { client?: string; q?: string }): FilterState {
  const filter: FilterState = {};

  const clientId = params.client?.trim();
  if (clientId) {
    filter.clientId = clientId;
  }

  // Story 5.7: Extract search query (min 2 chars)
  const searchQuery = params.q?.trim();
  if (searchQuery && searchQuery.length >= MIN_SEARCH_LENGTH) {
    filter.searchQuery = searchQuery;
  }

  return filter;
}

/**
 * Build URL with filter params applied
 *
 * Story 5.6: client filter
 * Story 5.7: search query
 */
export function buildFilteredUrl(
  filter: FilterState,
  currentParams: URLSearchParams
): string {
  const params = new URLSearchParams(currentParams.toString());

  if (filter.clientId) {
    params.set('client', filter.clientId);
  } else {
    params.delete('client');
  }

  // Story 5.7: Handle search query
  if (filter.searchQuery && filter.searchQuery.length >= MIN_SEARCH_LENGTH) {
    params.set('q', filter.searchQuery);
  } else {
    params.delete('q');
  }

  const queryString = params.toString();
  return queryString ? `/dashboard?${queryString}` : '/dashboard';
}

/**
 * Check if any filter is currently active (client filter only, not search)
 */
export function hasActiveFilter(filter: FilterState): boolean {
  return !!filter.clientId;
}

/**
 * Story 5.7: Check if search is active
 */
export function hasActiveSearch(filter: FilterState): boolean {
  return !!filter.searchQuery && filter.searchQuery.length >= MIN_SEARCH_LENGTH;
}
