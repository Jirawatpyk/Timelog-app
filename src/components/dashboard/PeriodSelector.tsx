/**
 * Period Selector - Story 5.1
 *
 * Client Component for tab-based period selection.
 * Updates URL on selection (AC4).
 *
 * Touch targets: min 44x44px (AC2)
 * Smooth transitions (AC3)
 */

'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Period } from '@/types/dashboard';

interface PeriodSelectorProps {
  currentPeriod: Period;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export function PeriodSelector({ currentPeriod }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handlePeriodChange = (period: Period) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    router.push(`/dashboard?${params.toString()}`, { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % PERIODS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + PERIODS.length) % PERIODS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = PERIODS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      buttonRefs.current[nextIndex]?.focus();
      handlePeriodChange(PERIODS[nextIndex].value);
    }
  };

  return (
    <div
      className="flex gap-1 p-1 bg-muted rounded-lg"
      role="tablist"
      aria-label="Select time period"
    >
      {PERIODS.map((period, index) => (
        <button
          key={period.value}
          ref={(el) => { buttonRefs.current[index] = el; }}
          id={`tab-${period.value}`}
          onClick={() => handlePeriodChange(period.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          role="tab"
          aria-selected={currentPeriod === period.value}
          aria-controls={`panel-${period.value}`}
          tabIndex={currentPeriod === period.value ? 0 : -1}
          className={cn(
            'flex-1 min-h-[44px] px-3 py-2 rounded-md whitespace-nowrap',
            'text-sm font-medium transition-all duration-200',
            'touch-manipulation focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            currentPeriod === period.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
