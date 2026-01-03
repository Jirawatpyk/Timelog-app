/**
 * SearchButton Component - Story 5.7
 *
 * Button to toggle search input visibility.
 * Shows active state when search query is present.
 */

'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function SearchButton({ isActive, onClick }: SearchButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        'h-9 w-9',
        isActive && 'bg-primary/10 text-primary'
      )}
      aria-label={isActive ? 'Close search' : 'Search entries'}
    >
      <Search className="h-5 w-5" />
    </Button>
  );
}
