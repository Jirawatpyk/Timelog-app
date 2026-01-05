'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { UserFilters, UserRole, UserStatus } from '@/types/domain';

/**
 * Hook for managing user list filters via URL search params
 * Story 7.7: Filter Users
 *
 * URL param mapping:
 * - dept → departmentId
 * - role → role
 * - status → status
 * - q → search
 *
 * @returns Filter state and mutators
 */
export function useUserFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current filters from URL
  const filters: UserFilters = useMemo(
    () => ({
      departmentId: searchParams.get('dept') || undefined,
      role: (searchParams.get('role') as UserRole) || undefined,
      status: (searchParams.get('status') as UserStatus) || undefined,
      search: searchParams.get('q') || undefined,
    }),
    [searchParams]
  );

  // Set a single filter and navigate
  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset pagination on filter change (AC: pagination resets on filter change)
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Set multiple filters at once
  const setFilters = useCallback(
    (newFilters: UserFilters) => {
      const params = new URLSearchParams();

      if (newFilters.departmentId) {
        params.set('dept', newFilters.departmentId);
      }
      if (newFilters.role) {
        params.set('role', newFilters.role);
      }
      if (newFilters.status) {
        params.set('status', newFilters.status);
      }
      if (newFilters.search) {
        params.set('q', newFilters.search);
      }

      // Reset pagination on filter change
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname]
  );

  // Clear all filters and navigate to base path
  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters,
  };
}
