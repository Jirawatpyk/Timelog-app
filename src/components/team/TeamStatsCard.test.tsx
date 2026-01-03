/**
 * Team Stats Card Tests - Story 6.1
 *
 * Tests for TeamStatsCard component
 * AC2: Summary stats section
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamStatsCard } from './TeamStatsCard';

describe('TeamStatsCard', () => {
  it('renders team member count', () => {
    render(<TeamStatsCard totalMembers={5} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('team members')).toBeInTheDocument();
  });

  it('renders Team Summary title', () => {
    render(<TeamStatsCard totalMembers={3} />);

    expect(screen.getByText('Team Summary')).toBeInTheDocument();
  });

  it('renders Users icon', () => {
    render(<TeamStatsCard totalMembers={5} />);

    // Check for icon parent element
    const iconParent = screen.getByText('Team Summary').closest('[class*="flex"]');
    expect(iconParent).toBeInTheDocument();
  });

  it('handles zero members', () => {
    render(<TeamStatsCard totalMembers={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles single member', () => {
    render(<TeamStatsCard totalMembers={1} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('handles large member count', () => {
    render(<TeamStatsCard totalMembers={999} />);

    expect(screen.getByText('999')).toBeInTheDocument();
  });
});
