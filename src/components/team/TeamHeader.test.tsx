// src/components/team/TeamHeader.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamHeader } from './TeamHeader';
import type { DepartmentOption } from '@/types/domain';

// Mock format function for consistent date output
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: vi.fn((date: Date, pattern: string) => {
      if (pattern === 'EEEE, MMMM d, yyyy') return 'Friday, January 3, 2026';
      if (pattern === 'HH:mm') return '14:30';
      return date.toISOString();
    }),
  };
});

describe('TeamHeader', () => {
  const mockDepartments: DepartmentOption[] = [
    { id: '1', name: 'Engineering' },
    { id: '2', name: 'Design' },
  ];

  it('renders title', () => {
    render(<TeamHeader departments={mockDepartments} />);

    expect(screen.getByText('Team Dashboard')).toBeInTheDocument();
  });

  it('displays formatted date', () => {
    render(<TeamHeader departments={mockDepartments} />);

    expect(screen.getByText('Friday, January 3, 2026')).toBeInTheDocument();
  });

  it('displays department names', () => {
    render(<TeamHeader departments={mockDepartments} />);

    expect(screen.getByText('Engineering, Design')).toBeInTheDocument();
  });

  it('displays last updated timestamp when provided', () => {
    const lastUpdated = new Date('2026-01-03T14:30:00');
    render(
      <TeamHeader departments={mockDepartments} lastUpdated={lastUpdated} />
    );

    expect(screen.getByText(/Last updated: 14:30/)).toBeInTheDocument();
  });

  it('hides last updated when not provided', () => {
    render(<TeamHeader departments={mockDepartments} />);

    expect(screen.queryByText(/Last updated/)).not.toBeInTheDocument();
  });

  it('handles empty departments array', () => {
    render(<TeamHeader departments={[]} />);

    expect(screen.getByText('Team Dashboard')).toBeInTheDocument();
    // No department text should be shown
    expect(screen.queryByText(/Engineering/)).not.toBeInTheDocument();
  });

  it('has subtle styling for last updated', () => {
    const lastUpdated = new Date();
    render(
      <TeamHeader departments={mockDepartments} lastUpdated={lastUpdated} />
    );

    const lastUpdatedElement = screen.getByText(/Last updated/);
    expect(lastUpdatedElement).toHaveClass('text-muted-foreground');
  });
});
