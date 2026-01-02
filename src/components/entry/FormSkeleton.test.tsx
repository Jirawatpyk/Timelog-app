'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormSkeleton, SelectorSkeleton, DurationSkeleton, DateSkeleton, RecentCombinationsSkeleton } from './FormSkeleton';

describe('FormSkeleton', () => {
  it('renders all skeleton sections for entry form', () => {
    render(<FormSkeleton />);

    // Should have test id for form skeleton
    expect(screen.getByTestId('form-skeleton')).toBeInTheDocument();

    // Should have multiple skeleton elements with animate-pulse
    const skeletons = screen.getAllByTestId(/skeleton/);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has consistent pulse animation on all skeletons', () => {
    const { container } = render(<FormSkeleton />);

    // All skeleton elements should have animate-pulse class
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('matches expected form layout structure', () => {
    render(<FormSkeleton />);

    // Should have Recent Combinations skeleton section
    expect(screen.getByTestId('recent-skeleton-section')).toBeInTheDocument();

    // Should have selectors skeleton section
    expect(screen.getByTestId('selectors-skeleton-section')).toBeInTheDocument();

    // Should have duration and date skeleton section
    expect(screen.getByTestId('duration-date-skeleton-section')).toBeInTheDocument();

    // Should have submit button skeleton
    expect(screen.getByTestId('submit-skeleton')).toBeInTheDocument();
  });
});

describe('SelectorSkeleton', () => {
  it('renders label and select skeletons', () => {
    render(<SelectorSkeleton label="Client" />);

    // Should have skeleton elements for label and select
    const container = screen.getByTestId('selector-skeleton');
    expect(container).toBeInTheDocument();
  });

  it('shows optional badge when optional prop is true', () => {
    render(<SelectorSkeleton label="Task" optional />);

    // Should have optional skeleton badge
    expect(screen.getByTestId('optional-skeleton-badge')).toBeInTheDocument();
  });
});

describe('DurationSkeleton', () => {
  it('renders duration preset buttons and input skeletons', () => {
    render(<DurationSkeleton />);

    const container = screen.getByTestId('duration-skeleton');
    expect(container).toBeInTheDocument();

    // Should have preset button skeletons (5 buttons)
    const presetSkeletons = container.querySelectorAll('[data-testid="preset-button-skeleton"]');
    expect(presetSkeletons.length).toBe(5);
  });
});

describe('DateSkeleton', () => {
  it('renders date picker skeleton', () => {
    render(<DateSkeleton />);

    expect(screen.getByTestId('date-skeleton')).toBeInTheDocument();
  });
});

describe('RecentCombinationsSkeleton', () => {
  it('renders 3 skeleton cards matching card dimensions', () => {
    const { container } = render(<RecentCombinationsSkeleton />);

    // Should have 3 card skeletons (280px × 76px)
    const cardSkeletons = container.querySelectorAll('.w-\\[280px\\].h-\\[76px\\]');
    expect(cardSkeletons.length).toBe(3);
  });

  it('renders header skeleton with icon and text placeholder', () => {
    const { container } = render(<RecentCombinationsSkeleton />);

    // Should have header skeletons (icon 4x4, text 4x16)
    const headerSkeletons = container.querySelectorAll('.h-4');
    expect(headerSkeletons.length).toBeGreaterThanOrEqual(2);
  });

  it('has consistent pulse animation', () => {
    const { container } = render(<RecentCombinationsSkeleton />);

    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
