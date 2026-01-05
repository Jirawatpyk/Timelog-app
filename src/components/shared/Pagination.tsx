'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  /** Optional query params to preserve when navigating (Story 7.7: Filter Users) */
  searchParams?: Record<string, string | undefined>;
}

/**
 * Reusable Pagination Component - Story 7.1 Task 7
 *
 * Features:
 * - Previous/Next buttons
 * - Page number display
 * - URL updates for page navigation
 * - Keyboard accessible
 */
export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, 'http://localhost');
    // Preserve existing query params (Story 7.7: Filter Users)
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && key !== 'page') {
          url.searchParams.set(key, value);
        }
      });
    }
    url.searchParams.set('page', String(page));
    return `${url.pathname}${url.search}`;
  };

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        asChild={hasPrevious}
        disabled={!hasPrevious}
        aria-label="Go to previous page"
      >
        {hasPrevious ? (
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </>
        )}
      </Button>

      {/* Page Info - AC 2: Current page is highlighted */}
      <span className="text-sm text-muted-foreground px-2">
        Page{' '}
        <span
          className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-md bg-primary text-primary-foreground font-semibold"
          aria-current="page"
        >
          {currentPage}
        </span>{' '}
        of <span className="font-medium text-foreground">{totalPages}</span>
      </span>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        asChild={hasNext}
        disabled={!hasNext}
        aria-label="Go to next page"
      >
        {hasNext ? (
          <Link href={getPageUrl(currentPage + 1)}>
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </nav>
  );
}
