/**
 * DashboardWrapper Component - Story 5.6, 5.7
 *
 * Client component that manages filter sheet and search state.
 * Wraps header section with FilterButton, SearchButton, and related sheets.
 */

'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FilterButton } from '@/components/dashboard/FilterButton';
import { FilterSheet } from '@/components/dashboard/FilterSheet';
import { SearchButton } from '@/components/dashboard/SearchButton';
import { SearchInput } from '@/components/dashboard/SearchInput';
import type { ClientOption } from '@/types/dashboard';

interface DashboardWrapperProps {
  children: React.ReactNode;
  clients: ClientOption[];
  currentClientId?: string;
  currentSearchQuery?: string;
}

export function DashboardWrapper({
  children,
  clients,
  currentClientId,
  currentSearchQuery,
}: DashboardWrapperProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Open search input if there's an initial search query
  useEffect(() => {
    if (currentSearchQuery) {
      setSearchOpen(true);
    }
  }, [currentSearchQuery]);

  return (
    <>
      <AnimatePresence mode="wait">
        {searchOpen ? (
          <SearchInput
            key="search-input"
            initialQuery={currentSearchQuery}
            onClose={() => setSearchOpen(false)}
          />
        ) : (
          <div key="header" className="flex items-center justify-between">
            {/* Period selector passed as children */}
            {children}
            <div className="flex items-center gap-1">
              <SearchButton
                isActive={!!currentSearchQuery}
                onClick={() => setSearchOpen(true)}
              />
              <FilterButton
                hasActiveFilter={!!currentClientId}
                onClick={() => setSheetOpen(true)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        clients={clients}
        currentClientId={currentClientId}
      />
    </>
  );
}
