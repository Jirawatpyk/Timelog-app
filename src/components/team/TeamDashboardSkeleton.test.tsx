/**
 * Team Dashboard Skeleton Tests - Story 6.1
 *
 * Tests for TeamDashboardSkeleton component
 * AC7: Loading skeleton state
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TeamDashboardSkeleton } from './TeamDashboardSkeleton';

describe('TeamDashboardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TeamDashboardSkeleton />);
    expect(container).toBeInTheDocument();
  });

  it('renders header skeletons', () => {
    const { container } = render(<TeamDashboardSkeleton />);

    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders stats card skeleton', () => {
    const { container } = render(<TeamDashboardSkeleton />);

    // Check for Card components
    const cards = container.querySelectorAll('[class*="rounded-lg"]');
    expect(cards.length).toBeGreaterThanOrEqual(3); // Stats + 2 member sections
  });

  it('renders multiple member list skeletons', () => {
    const { container } = render(<TeamDashboardSkeleton />);

    // Should have skeleton for members lists
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5); // Header + stats + members
  });

  it('matches layout structure', () => {
    const { container } = render(<TeamDashboardSkeleton />);

    // Check for gap-4 layout
    const layout = container.querySelector('[class*="gap-4"]');
    expect(layout).toBeInTheDocument();
  });
});
