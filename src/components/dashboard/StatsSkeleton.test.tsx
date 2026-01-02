'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatsSkeleton, PeriodSelectorSkeleton } from './StatsSkeleton';

describe('StatsSkeleton', () => {
  it('renders stats card skeleton', () => {
    render(<StatsSkeleton />);

    expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument();
  });

  it('has pulse animation', () => {
    const { container } = render(<StatsSkeleton />);

    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('includes period label and total hours skeleton', () => {
    const { container } = render(<StatsSkeleton />);

    // Should have multiple skeleton elements for stats
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('PeriodSelectorSkeleton', () => {
  it('renders period selector skeleton with 3 tabs', () => {
    render(<PeriodSelectorSkeleton />);

    expect(screen.getByTestId('period-selector-skeleton')).toBeInTheDocument();

    const tabSkeletons = screen.getAllByTestId('period-tab-skeleton');
    expect(tabSkeletons.length).toBe(3);
  });
});
