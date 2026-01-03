/**
 * SearchInput Component - Story 5.7
 *
 * Search input with debounced URL updates.
 * Auto-focuses on mount and handles clear/close actions.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { MIN_SEARCH_LENGTH } from '@/lib/dashboard/filter-utils';
import { motion } from 'framer-motion';

interface SearchInputProps {
  initialQuery?: string;
  onClose: () => void;
}

export function SearchInput({ initialQuery = '', onClose }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update URL when debounced query changes
  useEffect(() => {
    // Skip if debounced value hasn't changed from initial
    if (debouncedQuery === initialQuery) return;

    setIsSearching(true);
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery.length >= MIN_SEARCH_LENGTH) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }

    router.push(`/dashboard?${params.toString()}`);

    // Brief loading indicator
    const timer = setTimeout(() => setIsSearching(false), 200);
    return () => clearTimeout(timer);
  }, [debouncedQuery, initialQuery, router, searchParams]);

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  const handleClose = useCallback(() => {
    // Clear search from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');

    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');

    onClose();
  }, [router, searchParams, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 w-full"
    >
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search client, project, job..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10"
          aria-label="Search entries"
        />

        {/* Clear or Loading indicator */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2
              className="h-4 w-4 animate-spin text-muted-foreground"
              aria-label="Searching"
            />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : null}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        aria-label="Cancel search"
      >
        Cancel
      </Button>
    </motion.div>
  );
}
