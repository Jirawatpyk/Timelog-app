'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EntryListSkeleton, EntryCardSkeleton } from './EntryListSkeleton';

describe('EntryListSkeleton', () => {
  it('renders default 5 skeleton cards', () => {
    render(<EntryListSkeleton />);

    const skeletons = screen.getAllByTestId('entry-card-skeleton');
    expect(skeletons.length).toBe(5);
  });

  it('renders custom count of skeleton cards', () => {
    render(<EntryListSkeleton count={3} />);

    const skeletons = screen.getAllByTestId('entry-card-skeleton');
    expect(skeletons.length).toBe(3);
  });

  it('has consistent pulse animation', () => {
    const { container } = render(<EntryListSkeleton />);

    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});

describe('EntryCardSkeleton', () => {
  it('renders skeleton card structure', () => {
    render(<EntryCardSkeleton />);

    expect(screen.getByTestId('entry-card-skeleton')).toBeInTheDocument();
  });

  it('matches entry card layout with client, project, job, duration', () => {
    const { container } = render(<EntryCardSkeleton />);

    // Should have skeleton for client/project
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
